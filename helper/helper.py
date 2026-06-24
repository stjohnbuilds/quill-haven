#!/usr/bin/env python3
# Quill Haven local helper. Three jobs:
#   1) Serve a tiny localhost API the home screen calls for power / session actions.
#   2) Keep ITSELF (and other user-space files) up to date from GitHub.
#   3) Apply system-level device fixes from a device-manifest on GitHub (needs sudo).
# Bound to 127.0.0.1 only. POST for actions, GET for status. CORS + Private-Network
# headers so the GitHub-hosted home screen can reach it across the public->loopback line.

import hashlib, json, os, shutil, subprocess, sys, tempfile, threading, time, urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

PORT      = 8137
BASE      = "https://raw.githubusercontent.com/stjohnbuilds/quill-haven/main/helper"
HERE      = os.path.dirname(os.path.abspath(__file__))
LIVE      = os.path.join(HERE, "helper.py")
BAK       = LIVE + ".bak"
VERF      = os.path.join(HERE, "helper-version.txt")
DEV_VERF  = os.path.join(HERE, "device-version.txt")
LAUNCH    = os.path.join(HERE, "launch-home.sh")
ADMIN_BIN = "/usr/local/bin/qh-admin"
UPDATE_EVERY_SEC = 6 * 60 * 60
ALLOWED_ORIGIN   = "https://stjohnbuilds.github.io"

BROWSER = "chromium" if shutil.which("chromium") else "chromium-browser"

ACTIONS = {
    "/poweroff": ["systemctl", "poweroff"],
    "/reboot":   ["systemctl", "reboot"],
    "/sleep":    ["systemctl", "suspend"],
}

# ---------- download helper ----------
def _get(url, timeout=15):
    req = urllib.request.Request(url, headers={"Cache-Control": "no-cache"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()

def _sha(data):
    return hashlib.sha256(data).hexdigest().lower()

# ---------- version files ----------
def current_version():
    try:
        with open(VERF) as f:
            return f.read().strip()
    except FileNotFoundError:
        return "0"

def current_device_version():
    try:
        with open(DEV_VERF) as f:
            return f.read().strip()
    except FileNotFoundError:
        return "0"

# ---------- self-update (safe: verify hash + compiles, atomic swap, rollback) ----------
def check_for_update():
    try:
        man = json.loads(_get(BASE + "/helper-manifest.json"))
        want_ver = str(man["version"]); want_sha = man["sha256"].lower()
    except Exception:
        return False
    if want_ver == current_version():
        _update_extras(man)
        return False
    try:
        blob = _get(BASE + "/helper.py")
    except Exception:
        return False
    if _sha(blob) != want_sha:
        return False
    tmp = LIVE + ".tmp"
    with open(tmp, "wb") as f:
        f.write(blob); f.flush(); os.fsync(f.fileno())
    if subprocess.run([sys.executable, "-m", "py_compile", tmp]).returncode != 0:
        os.remove(tmp); return False
    try:
        shutil.copyfile(LIVE, BAK)
    except FileNotFoundError:
        pass
    os.replace(tmp, LIVE)
    with open(VERF, "w") as f:
        f.write(want_ver)
    # Also update extras before restarting
    _update_extras(man)
    os._exit(75)

# ---------- extras: user-space files (launch-home.sh etc.) ----------
def _update_extras(man):
    """Update non-helper files listed in the manifest's 'extras' array."""
    extras = man.get("extras", [])
    for entry in extras:
        name = entry.get("name", "")
        want_sha = entry.get("sha256", "").lower()
        if not name or not want_sha:
            continue
        dest = os.path.join(HERE, name)
        # Check if the local copy already matches
        try:
            with open(dest, "rb") as f:
                if _sha(f.read()) == want_sha:
                    continue
        except FileNotFoundError:
            pass
        # Download and verify
        try:
            blob = _get(BASE + "/" + name)
        except Exception:
            continue
        if _sha(blob) != want_sha:
            continue
        tmp = dest + ".tmp"
        with open(tmp, "wb") as f:
            f.write(blob); f.flush(); os.fsync(f.fileno())
        os.replace(tmp, dest)
        # Make scripts executable
        if name.endswith(".sh"):
            os.chmod(dest, 0o755)

# ---------- device manifest: system-level file pushes (needs sudo) ----------
def check_device_manifest():
    """Fetch the device manifest from GitHub and apply system-level changes."""
    if not os.path.isfile(ADMIN_BIN):
        return
    try:
        man = json.loads(_get(BASE + "/device-manifest.json"))
        want_ver = str(man.get("version", "0"))
    except Exception:
        return
    if want_ver == current_device_version() or want_ver == "0":
        return
    files = man.get("files", [])
    if not files:
        with open(DEV_VERF, "w") as f:
            f.write(want_ver)
        return
    # Download each file, verify SHA, stage into a temp directory
    workdir = tempfile.mkdtemp(prefix="qh-admin-")
    tsv_lines = []
    try:
        for entry in files:
            name = entry.get("name", "")
            dest = entry.get("dest", "")
            sha = entry.get("sha256", "").lower()
            mode = entry.get("mode", "644")
            if not name or not dest or not sha:
                continue
            blob = _get(BASE + "/" + name)
            if _sha(blob) != sha:
                shutil.rmtree(workdir, ignore_errors=True)
                return
            with open(os.path.join(workdir, name), "wb") as f:
                f.write(blob)
            tsv_lines.append(name + "\t" + dest + "\t" + mode)
        if not tsv_lines:
            shutil.rmtree(workdir, ignore_errors=True)
            return
        with open(os.path.join(workdir, "files.tsv"), "w") as f:
            f.write("\n".join(tsv_lines) + "\n")
        # Apply via the privileged admin script
        rc = subprocess.run(["sudo", "-n", ADMIN_BIN, workdir],
                            capture_output=True, timeout=30).returncode
        if rc == 0:
            with open(DEV_VERF, "w") as f:
                f.write(want_ver)
    except Exception:
        pass
    finally:
        shutil.rmtree(workdir, ignore_errors=True)

# ---------- update loop ----------
def update_loop():
    time.sleep(20)
    while True:
        check_for_update()
        check_device_manifest()
        time.sleep(UPDATE_EVERY_SEC)

# ---------- http ----------
class H(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", ALLOWED_ORIGIN)
        self.send_header("Access-Control-Allow-Private-Network", "true")
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

    def do_OPTIONS(self):
        self.send_response(204); self._cors(); self.end_headers()

    def do_GET(self):
        p = self.path.split("?")[0]
        if p in ("/status", "/ping"):
            self._send(body=("quill-helper " + current_version() + " ok").encode())
        elif p == "/network":
            ssid = ""
            try:
                out = subprocess.run(["nmcli", "-t", "-f", "active,ssid", "dev", "wifi"],
                                     capture_output=True, text=True, timeout=2).stdout
                for line in out.splitlines():
                    if line.startswith("yes:"):
                        ssid = line.split(":", 1)[1].strip(); break
            except Exception:
                pass
            body = json.dumps({"ssid": ssid}).encode()
            self.send_response(200); self._cors()
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers(); self.wfile.write(body)
        else:
            self._send(404, b"no")

    def do_POST(self):
        p = self.path.split("?")[0]
        if p in ACTIONS:
            subprocess.Popen(ACTIONS[p]); self._send()
        elif p == "/desktop":
            subprocess.Popen(["pkill", "-x", BROWSER]); self._send()
        elif p == "/go-home":
            subprocess.Popen(["pkill", "-x", BROWSER])
            if os.path.exists(LAUNCH):
                subprocess.Popen(["bash", LAUNCH])
            self._send()
        elif p == "/terminal":
            term = next((t for t in ("xfce4-terminal", "gnome-terminal", "mate-terminal", "xterm") if shutil.which(t)), None)
            if term:
                subprocess.Popen([term])
                self._send()
            else:
                self._send(500, b"no terminal installed")
        elif p == "/wifi-settings":
            tool = next((t for t in ("nm-connection-editor", "nm-applet") if shutil.which(t)), None)
            if tool:
                subprocess.Popen([tool])
                self._send()
            else:
                self._send(500, b"no wifi tool installed")
        else:
            self._send(404, b"no")

def main():
    threading.Thread(target=update_loop, daemon=True).start()
    ThreadingHTTPServer(("127.0.0.1", PORT), H).serve_forever()

if __name__ == "__main__":
    main()
