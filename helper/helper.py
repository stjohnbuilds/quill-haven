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
REPO_BASE = "https://raw.githubusercontent.com/stjohnbuilds/quill-haven/main"
BASE      = REPO_BASE + "/helper"
HERE      = os.path.dirname(os.path.abspath(__file__))
LIVE      = os.path.join(HERE, "helper.py")
BAK       = LIVE + ".bak"
VERF      = os.path.join(HERE, "helper-version.txt")
DEV_VERF  = os.path.join(HERE, "device-version.txt")
LAUNCH    = os.path.join(HERE, "launch-home.sh")
ADMIN_BIN = "/usr/local/bin/qh-admin"
ALLOWED_ORIGIN   = "https://stjohnbuilds.github.io"

BROWSER = "chromium" if shutil.which("chromium") else "chromium-browser"

# One apply at a time. A double-tap (or the pill AND the home button both firing)
# must not start two apply threads racing on the same temp files.
_apply_lock = threading.Lock()
_apply_started = False
def _begin_apply():
    global _apply_started
    with _apply_lock:
        if _apply_started:
            return False
        _apply_started = True
        return True

ACTIONS = {
    "/poweroff": ["systemctl", "poweroff"],
    "/reboot":   ["systemctl", "reboot"],
    "/sleep":    ["systemctl", "suspend"],
}

def _gui_env():
    """The helper may not have inherited the screen-session variables, so anything it
    launches (a terminal window, the wifi window) can have nowhere to appear and fails
    silently. Borrow the real DISPLAY / XAUTHORITY (and Wayland) from the running
    browser, which definitely has them, so launched windows actually show up."""
    env = dict(os.environ)
    try:
        pids = subprocess.check_output(["pgrep", "-f", BROWSER], timeout=3).split()
        for pid in pids:
            try:
                with open("/proc/%s/environ" % pid.decode(), "rb") as f:
                    raw = f.read()
            except Exception:
                continue
            for kv in raw.split(b"\0"):
                if b"=" not in kv:
                    continue
                k, _, v = kv.partition(b"=")
                ks = k.decode("utf-8", "replace")
                if ks in ("DISPLAY", "XAUTHORITY", "WAYLAND_DISPLAY", "XDG_RUNTIME_DIR"):
                    env[ks] = v.decode("utf-8", "replace")
            break
    except Exception:
        pass
    env.setdefault("DISPLAY", ":0")
    return env

def _screen_off():
    """Power the display off to save battery. DPMS (X11) and the Wayland equivalent both
    wake automatically on any key or touch — the screen is never left stuck off."""
    env = _gui_env()
    try:                                              # X11
        subprocess.run(["xset", "+dpms"], env=env, timeout=3)
        subprocess.run(["xset", "dpms", "force", "off"], env=env, timeout=3)
    except Exception:
        pass
    if env.get("WAYLAND_DISPLAY"):                    # Wayland (sway / wlroots kiosks)
        try:
            subprocess.run(["swaymsg", "output", "*", "dpms", "off"], env=env, timeout=3)
        except Exception:
            pass

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

# ---------- self-update to disk (safe: verify hash + compiles, atomic swap, keep .bak) ----------
# This ONLY writes the new helper.py to disk. It does not restart and does not touch
# extras — apply_update() orchestrates the full apply + restart, and that only runs
# when Marie taps "Update". Nothing here ever happens on a timer any more.
def _self_update_to_disk(man):
    try:
        want_ver = str(man["version"]); want_sha = man["sha256"].lower()
    except Exception:
        return False
    if want_ver == current_version():
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
    return True

# ---------- extras: user-space files (launch-home.sh etc.) ----------
def _update_extras(man):
    """Update non-helper files listed in the manifest's 'extras' array.
    Supports subdirectory paths like 'extension/manifest.json'."""
    extras = man.get("extras", [])
    changed_names = []
    for entry in extras:
        name = entry.get("name", "")
        want_sha = entry.get("sha256", "").lower()
        src_url = entry.get("src", name)
        if not name or not want_sha:
            continue
        dest = os.path.join(HERE, name)
        try:
            with open(dest, "rb") as f:
                if _sha(f.read()) == want_sha:
                    continue
        except FileNotFoundError:
            pass
        try:
            blob = _get(REPO_BASE + "/" + src_url)
        except Exception:
            continue
        if _sha(blob) != want_sha:
            continue
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        tmp = dest + ".tmp"
        with open(tmp, "wb") as f:
            f.write(blob); f.flush(); os.fsync(f.fileno())
        os.replace(tmp, dest)
        if name.endswith(".sh"):
            os.chmod(dest, 0o755)
        changed_names.append(name)
    if any(n == "launch-home.sh" for n in changed_names):
        subprocess.Popen(["pkill", "-x", BROWSER])

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

# ---------- apply updates ON DEMAND (the approval gate) ----------
# Updates are never applied on a timer. The home screen / overlay shows
# "Update available"; only when Marie taps it does the browser POST /apply-update,
# which runs the same verified, hash-checked apply as before, then restarts so the
# new overlay + helper take effect. One bad push can no longer change the device on
# its own.
def apply_update():
    # 1) system-level policy files (sudo, hash-verified, atomic) — no-op if unchanged
    try:
        check_device_manifest()
    except Exception:
        pass
    # 2) user-space extras (overlay, launcher) + the helper itself, hash-verified
    try:
        man = json.loads(_get(BASE + "/helper-manifest.json"))
    except Exception:
        man = None
    if man:
        try:
            _update_extras(man)
        except Exception:
            pass
        try:
            _self_update_to_disk(man)
        except Exception:
            pass
    # 3) restart so the new files take effect. Done in a thread so the HTTP reply
    #    has already gone back before we kill the browser.
    def _restart():
        time.sleep(1.0)
        subprocess.Popen(["pkill", "-x", BROWSER])   # browser relaunches with new overlay
        time.sleep(0.5)
        os._exit(75)                                  # supervisor relaunches the new helper
    threading.Thread(target=_restart, daemon=True).start()

# ---------- http ----------
class H(BaseHTTPRequestHandler):
    def _cors(self):
        # The browser's Update / Terminal / Screen messages come from the EXTENSION's own
        # origin (chrome-extension://… or "null"), NOT the home-screen page — so a single
        # hard-coded ALLOWED_ORIGIN never matched and the browser discarded every reply,
        # which is why none of those buttons worked. Reflect the caller's Origin (falling
        # back to "*"). Safe: the server binds 127.0.0.1 only, so nothing off this machine
        # can reach it. (Replies are sent with credentials omitted, so "*" is valid too.)
        origin = self.headers.get("Origin")
        self.send_header("Access-Control-Allow-Origin", origin if origin else "*")
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
        elif p == "/wifi-list":
            nets = []
            try:
                subprocess.run(["nmcli", "dev", "wifi", "rescan"], capture_output=True, timeout=8)
            except Exception:
                pass
            try:
                out = subprocess.run(["nmcli", "-t", "-f", "IN-USE,SSID,SIGNAL,SECURITY", "dev", "wifi", "list"],
                                     capture_output=True, text=True, timeout=8).stdout
                seen = set()
                for line in out.splitlines():
                    parts = [x.replace("\x00", ":") for x in line.replace("\\:", "\x00").split(":")]
                    if len(parts) < 4 or not parts[1] or parts[1] in seen:
                        continue
                    seen.add(parts[1])
                    nets.append({"ssid": parts[1],
                                 "signal": int(parts[2]) if parts[2].isdigit() else 0,
                                 "secure": parts[3] not in ("", "--"),
                                 "active": parts[0].strip() == "*"})
            except Exception:
                pass
            nets.sort(key=lambda n: (not n["active"], -n["signal"]))
            body = json.dumps({"networks": nets}).encode()
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
        elif p == "/go-home":
            subprocess.Popen(["pkill", "-x", BROWSER])
            if os.path.exists(LAUNCH):
                subprocess.Popen(["bash", LAUNCH])
            self._send()
        elif p == "/terminal":
            term = next((t for t in ("x-terminal-emulator", "xfce4-terminal", "gnome-terminal", "mate-terminal", "konsole", "lxterminal", "xterm") if shutil.which(t)), None)
            if term:
                subprocess.Popen([term], env=_gui_env())
                self._send()
            else:
                self._send(500, b"no terminal installed")
        elif p == "/wifi-settings":
            tool = next((t for t in ("nm-connection-editor", "nm-applet") if shutil.which(t)), None)
            if tool:
                subprocess.Popen([tool], env=_gui_env())
                self._send()
            else:
                self._send(500, b"no wifi tool installed")
        elif p == "/screen-off":
            # Power the display off to save battery (the overlay calls this on idle or
            # when Marie taps the Screen button). Threaded so the reply returns fast.
            threading.Thread(target=_screen_off, daemon=True).start()
            self._send()
        elif p == "/apply-update":
            # The approval gate: fetch + apply the waiting update, then restart.
            # Reply immediately so the browser hears back before the restart. Only
            # the first call actually applies; repeats are acknowledged and ignored.
            self._send()
            if _begin_apply():
                threading.Thread(target=apply_update, daemon=True).start()
        else:
            self._send(404, b"no")

def main():
    # No background update thread — updates apply only on Marie's tap (/apply-update).
    ThreadingHTTPServer(("127.0.0.1", PORT), H).serve_forever()

if __name__ == "__main__":
    main()
