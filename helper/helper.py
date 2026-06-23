#!/usr/bin/env python3
# Quill Haven local helper. Two jobs:
#   1) Serve a tiny localhost API the home screen calls for power / session actions.
#   2) Keep ITSELF up to date from GitHub, safely (hash-verified, atomic, auto-rollback).
# Bound to 127.0.0.1 only. POST for actions, GET for status. CORS + Private-Network
# headers so the GitHub-hosted home screen can reach it across the public->loopback line.

import hashlib, json, os, shutil, subprocess, sys, threading, time, urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

PORT      = 8137
BASE      = "https://raw.githubusercontent.com/stjohnbuilds/quill-haven/main/helper"
HERE      = os.path.dirname(os.path.abspath(__file__))
LIVE      = os.path.join(HERE, "helper.py")
BAK       = LIVE + ".bak"
VERF      = os.path.join(HERE, "helper-version.txt")
LAUNCH    = os.path.join(HERE, "launch-home.sh")   # written by setup.sh
UPDATE_EVERY_SEC = 6 * 60 * 60
ALLOWED_ORIGIN   = "https://stjohnbuilds.github.io"

BROWSER = "chromium" if shutil.which("chromium") else "chromium-browser"

ACTIONS = {
    "/poweroff": ["systemctl", "poweroff"],
    "/reboot":   ["systemctl", "reboot"],
    "/sleep":    ["systemctl", "suspend"],
}

# ---------- self-update (safe: verify hash + compiles, atomic swap, rollback) ----------
def _get(url, timeout=15):
    req = urllib.request.Request(url, headers={"Cache-Control": "no-cache"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()

def current_version():
    try:
        with open(VERF) as f:
            return f.read().strip()
    except FileNotFoundError:
        return "0"

def check_for_update():
    try:
        man = json.loads(_get(BASE + "/helper-manifest.json"))
        want_ver = str(man["version"]); want_sha = man["sha256"].lower()
    except Exception:
        return                                   # network/JSON failure -> never act
    if want_ver == current_version():
        return
    try:
        blob = _get(BASE + "/helper.py")
    except Exception:
        return
    if hashlib.sha256(blob).hexdigest().lower() != want_sha:
        return                                   # corrupt/partial/tampered -> refuse
    tmp = LIVE + ".tmp"
    with open(tmp, "wb") as f:
        f.write(blob); f.flush(); os.fsync(f.fileno())
    if subprocess.run([sys.executable, "-m", "py_compile", tmp]).returncode != 0:
        os.remove(tmp); return                   # won't even parse -> throw away
    try:
        shutil.copyfile(LIVE, BAK)               # refresh known-good fallback
    except FileNotFoundError:
        pass
    os.replace(tmp, LIVE)                         # atomic swap
    with open(VERF, "w") as f:
        f.write(want_ver)
    os._exit(75)                                 # tell wrapper to relaunch new code

def update_loop():
    time.sleep(20)                               # let the session settle before first check
    while True:
        check_for_update()
        time.sleep(UPDATE_EVERY_SEC)

# ---------- http ----------
class H(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", ALLOWED_ORIGIN)
        self.send_header("Access-Control-Allow-Private-Network", "true")  # PNA preflight opt-in
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")

    def _send(self, code=200, body=b"ok"):
        self.send_response(code); self._cors()
        self.send_header("Content-Type", "text/plain")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)

    def log_message(self, *a):
        pass

    def do_OPTIONS(self):                         # PNA / CORS preflight
        self.send_response(204); self._cors(); self.end_headers()

    def do_GET(self):
        p = self.path.split("?")[0]
        if p in ("/status", "/ping"):
            self._send(body=("quill-helper " + current_version() + " ok").encode())
        else:
            self._send(404, b"no")

    def do_POST(self):
        p = self.path.split("?")[0]
        if p in ACTIONS:
            subprocess.Popen(ACTIONS[p]); self._send()
        elif p == "/desktop":                     # exit to desktop: just close the browser
            subprocess.Popen(["pkill", "-x", BROWSER]); self._send()
        elif p == "/go-home":                     # come back to the home screen
            subprocess.Popen(["pkill", "-x", BROWSER])
            if os.path.exists(LAUNCH):
                subprocess.Popen(["bash", LAUNCH])
            self._send()
        else:
            self._send(404, b"no")

def main():
    threading.Thread(target=update_loop, daemon=True).start()
    ThreadingHTTPServer(("127.0.0.1", PORT), H).serve_forever()

if __name__ == "__main__":
    main()
