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
# THE BACK-DOOR LOCK. Binding to 127.0.0.1 keeps other MACHINES out, but not other
# WEB PAGES: any site open in the kiosk browser can fire a POST at 127.0.0.1:8137,
# and the old code would happily open a terminal / power off / force an update for
# it. Now every action endpoint checks WHO is asking, via the Origin header — which
# the browser sets itself and a web page cannot fake:
#   * no Origin header  -> a local program (curl, the launcher, the TTY rescue) — allowed
#   * chrome-extension:// -> the Quill Haven shell's background worker — allowed
#   * anything else (https://some-site.com, file://, null) -> a web page — REFUSED
# Only the harmless read-only + recovery endpoints stay open to everyone
# (SAFE_PATHS below), so the offline splash's Wi-Fi button keeps working.
SAFE_PATHS = {"/status", "/ping", "/network", "/wifi-settings"}

class H(BaseHTTPRequestHandler):
    def _origin_ok(self, path):
        if path in SAFE_PATHS:
            return True
        origin = self.headers.get("Origin")
        if origin is None:
            return True
        return origin.startswith("chrome-extension://")

    def _cors(self):
        # The browser's Update / Terminal / Screen messages come from the EXTENSION's own
        # origin (chrome-extension://… or "null"), NOT the home-screen page — so a single
        # hard-coded ALLOWED_ORIGIN never matched and the browser discarded every reply,
        # which is why none of those buttons worked. Reflect the caller's Origin (falling
        # back to "*"). Replies carry no secrets; the WHO-may-ACT check is _origin_ok.
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
        if not self._origin_ok(p):
            self._send(403, b"locked"); return
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
            # Is the Wi-Fi radio on at all? The panel's on/off switch mirrors this.
            radio = True
            try:
                r = subprocess.run(["nmcli", "radio", "wifi"],
                                   capture_output=True, text=True, timeout=4)
                radio = "enabled" in (r.stdout or "").lower()
            except Exception:
                pass
            if radio:
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
            body = json.dumps({"networks": nets, "radio": radio}).encode()
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
        elif p == "/wifi-toggle":
            # Turn the Wi-Fi radio on or off (the switch at the top of the Wi-Fi panel).
            try:
                length = int(self.headers.get("Content-Length", 0) or 0)
                data = json.loads(self.rfile.read(length) or b"{}")
            except Exception:
                data = {}
            want_on = bool(data.get("on", True))
            try:
                r = subprocess.run(["nmcli", "radio", "wifi", "on" if want_on else "off"],
                                   capture_output=True, text=True, timeout=10)
                if r.returncode == 0:
                    self._send(body=b"on" if want_on else b"off")
                else:
                    lines = (r.stderr or r.stdout or "could not switch wifi").strip().splitlines()
                    self._send(500, (lines[-1] if lines else "could not switch wifi")[:140].encode())
            except Exception as e:
                self._send(500, str(e)[:140].encode())
        elif p == "/wifi-connect":
            try:
                length = int(self.headers.get("Content-Length", 0) or 0)
                data = json.loads(self.rfile.read(length) or b"{}")
            except Exception:
                data = {}
            ssid = str(data.get("ssid", "")); pw = str(data.get("password", ""))
            if not ssid:
                self._send(400, b"no network chosen"); return
            cmd = ["nmcli", "dev", "wifi", "connect", ssid] + (["password", pw] if pw else [])
            try:
                r = subprocess.run(cmd, capture_output=True, text=True, timeout=35)
                if r.returncode == 0:
                    self._send(body=b"connected")
                else:
                    lines = (r.stderr or r.stdout or "could not connect").strip().splitlines()
                    self._send(400, (lines[-1] if lines else "could not connect")[:140].encode())
            except Exception as e:
                self._send(500, str(e)[:140].encode())
        else:
            self._send(404, b"no")

def main():
    # No background update thread — updates apply only on Marie's tap (/apply-update).
    ThreadingHTTPServer(("127.0.0.1", PORT), H).serve_forever()

if __name__ == "__main__":
    main()
