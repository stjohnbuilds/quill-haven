/* ═══════════════════════════════════════════════════════════
   Quill Haven — overlay.
   Two floating pieces that ride on top of EVERY page so Marie can
   always see the time and never gets stuck inside an app:
     • a status pill (top-right)
     • an app switcher (bottom-right)
   plus a settings popup that matches the home screen.

   EVERYTHING visual here is reused from the home screen — the app
   icons, the colours, the status icons, the settings styling all
   come straight from home-screen/. Nothing new is invented.
   ═══════════════════════════════════════════════════════════ */
(function () {
  if (window.__qhOverlay) return;
  window.__qhOverlay = true;

  // The site root redirects to home-screen/, so the real home screen and its
  // local apps (Writing, Files) live under .../quill-haven/home-screen/.
  var HOME_BASE = 'https://stjohnbuilds.github.io/quill-haven/home-screen/';
  var HOME_URL = HOME_BASE;
  var VERSION_URL = 'https://raw.githubusercontent.com/stjohnbuilds/quill-haven/main/version.json';
  var LOCAL_VERSION = '4.9';
  var localEmoji = '🔖';
  var updateInfo = null;

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;').replace(/"/g, '&quot;');
  }

  // ── App icons + colours: copied verbatim from home.js BUILTIN_APPS ──
  var BUILTIN = [
    { id: 'docs', name: 'Google Docs', kind: 'site', url: 'https://docs.google.com', host: 'docs.google.com',
      c1: '#f7cfe6', c2: '#eeb1cf', vb: '0 0 28 28',
      icon: '<rect x="6" y="2" width="16" height="22" rx="2.5" fill="none" stroke="white" stroke-width="1.4" opacity="0.9"/><path d="M18 2L22 6L18 6Z" fill="white" opacity="0.35"/><line x1="9" y1="10" x2="19" y2="10" stroke="white" stroke-width="1.4" stroke-linecap="round" opacity="0.7"/><line x1="9" y1="13.5" x2="16" y2="13.5" stroke="white" stroke-width="1.4" stroke-linecap="round" opacity="0.55"/><line x1="9" y1="17" x2="18" y2="17" stroke="white" stroke-width="1.4" stroke-linecap="round" opacity="0.45"/>' },
    { id: 'writing', name: 'Local Writing', kind: 'local', src: 'apps/writing/index.html?v=24',
      c1: '#c2e8c9', c2: '#97d6a4', vb: '0 0 24 24',
      icon: '<path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" fill="none" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity="0.92"/><path d="M16 8 2 22" stroke="white" stroke-width="1.6" stroke-linecap="round" opacity="0.7"/><path d="M17.5 15H9" stroke="white" stroke-width="1.6" stroke-linecap="round" opacity="0.7"/>' },
    { id: 'files', name: 'Files', kind: 'local', src: 'apps/files/index.html?v=8',
      c1: '#c4d4f7', c2: '#a0bcee', vb: '0 0 24 24',
      icon: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="none" stroke="white" stroke-width="1.5" stroke-linejoin="round" opacity="0.92"/>' }
  ];
  // The "Home" button uses the home screen's own purple swatch.
  var HOME_ICON = '<path d="M3 10.5 12 3l9 7.5" fill="none" stroke="white" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" fill="none" stroke="white" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>';
  var HOME_GRAD = 'linear-gradient(145deg,#d9c2f5,#b083e0)';
  // Six-dot drag handle. viewBox matches the 12x16 display box so the dots stay
  // perfectly ROUND and evenly spaced (the old 24x24 viewBox stretched them oval).
  var GRIP_SVG = '<svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor"><circle cx="4" cy="3.5" r="1.4"/><circle cx="8" cy="3.5" r="1.4"/><circle cx="4" cy="8" r="1.4"/><circle cx="8" cy="8" r="1.4"/><circle cx="4" cy="12.5" r="1.4"/><circle cx="8" cy="12.5" r="1.4"/></svg>';

  function gradOf(app) { return 'linear-gradient(145deg,' + app.c1 + ',' + app.c2 + ')'; }
  // Same icon logic as home.js: built-in SVG, or the app's first letter.
  function iconHtml(app, px) {
    if (app.icon) return '<svg width="' + px + '" height="' + px + '" viewBox="' + (app.vb || '0 0 24 24') + '" fill="none" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + app.icon + '</svg>';
    var letter = (app.name || '?').trim().charAt(0).toUpperCase() || '?';
    return '<span style="color:#fff;font-weight:600;line-height:1;font-size:' + Math.round(px * 0.5) + 'px;">' + esc(letter) + '</span>';
  }

  // ── Settings: chrome.storage is the single source of truth. ──
  var settings = { theme: 'purple', tz: '', addons: '[]', apps: '{}', order: '[]', posPill: null, posDock: null };
  function loadSettings() {
    return new Promise(function (resolve) {
      try {
        chrome.storage.local.get(['theme', 'tz', 'addons', 'apps', 'order', 'posPill', 'posDock'], function (got) {
          if (got) for (var k in got) if (got[k] != null) settings[k] = got[k];
          resolve();
        });
      } catch (e) { resolve(); }
    });
  }
  function saveSettings(patch) {
    for (var k in patch) settings[k] = patch[k];
    try { chrome.storage.local.set(patch); } catch (e) {}
  }
  function parseJSON(s, fallback) { try { var v = JSON.parse(s); return v == null ? fallback : v; } catch (e) { return fallback; } }

  // ── Which app are we on? ──
  function detectCurrentId() {
    var host = location.hostname, path = location.pathname;
    if (host === 'stjohnbuilds.github.io') {
      if (/\/apps\/writing\//.test(path)) return 'writing';
      if (/\/apps\/files\//.test(path)) return 'files';
      return '__home__';
    }
    var list = allApps();
    for (var i = 0; i < list.length; i++) {
      var a = list[i];
      if (a.kind !== 'site' || !a.url) continue;
      var h; try { h = new URL(a.url).hostname.replace(/^www\./, ''); } catch (e) { continue; }
      if (host === h || host.endsWith('.' + h)) return a.id;
    }
    return null;
  }
  function isHome() { return detectCurrentId() === '__home__'; }

  // ── The app list (built-ins + the user's own apps), ordered like home. ──
  function allApps() { return BUILTIN.concat(parseJSON(settings.addons, [])); }
  function isVisible(id) { var m = parseJSON(settings.apps, {}); return m[id] !== false; }
  function appUrl(app) { return app.kind === 'local' ? (HOME_BASE + app.src) : app.url; }
  function orderedVisible() {
    var apps = allApps();
    var order = parseJSON(settings.order, []);
    var pos = {}; order.forEach(function (id, i) { pos[id] = i; });
    return apps.slice().sort(function (a, b) {
      var pa = (a.id in pos) ? pos[a.id] : order.length + apps.indexOf(a);
      var pb = (b.id in pos) ? pos[b.id] : order.length + apps.indexOf(b);
      return pa - pb;
    }).filter(function (a) { return isVisible(a.id); });
  }
  function appById(id) { var l = allApps(); for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; return null; }

  // ── Talk to the local helper (via the background worker, so it works anywhere) ──
  // The MV3 background worker can be ASLEEP, so the first message sometimes fails
  // with lastError — which used to make Power/Restart "do nothing". So we retry a
  // few times (200ms apart) to wake the worker before giving up. The actions are
  // idempotent (power off / go home), so a retry is safe.
  function helperOnce(path, opts) {
    return new Promise(function (resolve, reject) {
      try {
        chrome.runtime.sendMessage({ type: 'qh-helper', path: path, method: (opts && opts.method) || 'POST', json: !!(opts && opts.json) }, function (resp) {
          if (chrome.runtime.lastError) { reject(chrome.runtime.lastError); return; }
          if (resp && resp.ok) resolve(resp.data); else reject(resp && resp.err);
        });
      } catch (e) { reject(e); }
    });
  }
  function helper(path, opts) {
    var maxTries = (opts && opts.noRetry) ? 1 : 4;
    return new Promise(function (resolve, reject) {
      var tries = 0;
      (function attempt() {
        helperOnce(path, opts).then(resolve, function (err) {
          if (++tries >= maxTries) { reject(err); return; }
          setTimeout(attempt, 200);
        });
      })();
    });
  }
  function helperAction(path) {
    helper(path).catch(function () {
      window.qhConfirm({ title: 'Only on the Quill Haven laptop', message: 'Power, restart, sleep, terminal and Wi-Fi work on the installed device — not in a preview or plain browser.', confirmText: 'OK', noCancel: true });
    });
  }

  // ── Auto screen-off on idle (saves battery; avoids the flaky system sleep) ──
  // After SCREEN_OFF_MIN minutes with no typing/touch on any page, ask the helper
  // to power the display off. The next touch or key wakes it instantly (the
  // display wakes at the hardware level, and that same input re-arms the timer).
  var SCREEN_OFF_MIN = 5;
  function startIdleWatch() {
    if (!SCREEN_OFF_MIN) return;
    var lastActivity = Date.now();
    ['pointerdown', 'keydown', 'mousemove', 'touchstart', 'wheel'].forEach(function (ev) {
      window.addEventListener(ev, function () { lastActivity = Date.now(); }, { passive: true, capture: true });
    });
    setInterval(function () {
      if ((Date.now() - lastActivity) >= SCREEN_OFF_MIN * 60000) {
        helper('/screen-off').catch(function () {});
        lastActivity = Date.now();   // don't re-fire until another full idle stretch passes
      }
    }, 30000);
  }

  // ════════════ TOP PILL ════════════
  var pill = document.createElement('div');
  pill.id = 'qh-pill';

  function statusIcon(inner, attrs) {
    return '<span class="qhp-icon"' + (attrs || '') + '>' + inner + '</span>';
  }
  var WIFI_SVG = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="currentColor" stroke="none"/></svg>';
  var BATTERY_SVG = '<svg width="20" height="14" viewBox="0 0 28 14" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="2" width="22" height="10" rx="2.5"/><rect id="qh-batt-fill" x="3.5" y="4.5" width="15" height="5" rx="1" fill="currentColor" stroke="none" opacity="0.6"/><rect x="23" y="5" width="3" height="4" rx="1" fill="currentColor" stroke="none" opacity="0.4"/></svg>';
  var POWER_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v9"/><path d="M18.4 6.6a9 9 0 1 1-12.8 0"/></svg>';
  var GEAR_SVG = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';

  function buildPill() {
    pill.innerHTML =
      '<span class="qhp-grip" id="qh-pill-grip" title="Drag to move">' + GRIP_SVG + '</span>'
      + '<span class="qhp-icons">'
      + statusIcon(WIFI_SVG, ' id="qh-pill-wifi" title="Wi-Fi"')
      + statusIcon(BATTERY_SVG, ' id="qh-pill-battery" title="Battery"')
      + statusIcon(POWER_SVG, ' id="qh-pill-power" title="Power"')
      + statusIcon(GEAR_SVG, ' id="qh-pill-gear" title="Settings"')
      + '</span>'
      + '<span id="qh-pill-emoji">' + esc(localEmoji) + '<span class="qhp-tip"></span></span>'
      + '<span id="qh-pill-time"></span>';

    // The pill stays full length (icons always shown), so a tap never changes
    // its size. The grip drags; each icon below has its own tap handler.
    var grip = pill.querySelector('#qh-pill-grip');
    if (grip) grip.addEventListener('click', function (e) { e.stopPropagation(); });
    function iconClick(id, fn) {
      var el = pill.querySelector(id);
      if (el) el.addEventListener('click', function (e) { e.stopPropagation(); fn(e); });
    }
    iconClick('#qh-pill-wifi', function () { helperAction('/wifi-settings'); });
    iconClick('#qh-pill-power', function (e) { togglePowerMenu(e); });
    iconClick('#qh-pill-gear', function () { openSettings(); });
    iconClick('#qh-pill-emoji', function () { if (updateInfo) doUpdate(); });

    updateTime();
    setInterval(updateTime, 10000);
    initBattery();
    updateWifi();
    window.addEventListener('online', updateWifi);
    window.addEventListener('offline', updateWifi);
  }

  var TZ_OPTIONS = [
    ['', 'Auto (device)'], ['America/Los_Angeles', 'Los Angeles (Pacific)'], ['America/Denver', 'Denver (Mountain)'],
    ['America/Chicago', 'Chicago (Central)'], ['America/New_York', 'New York (Eastern)'], ['America/Toronto', 'Toronto (Eastern)'],
    ['America/Halifax', 'Halifax (Atlantic)'], ['Atlantic/Reykjavik', 'Reykjavík'], ['Europe/London', 'London'],
    ['Europe/Paris', 'Paris / Berlin / Rome'], ['Europe/Athens', 'Athens / Helsinki'], ['Europe/Moscow', 'Moscow'],
    ['Asia/Dubai', 'Dubai'], ['Asia/Kolkata', 'India (Kolkata)'], ['Asia/Singapore', 'Singapore / Hong Kong'],
    ['Asia/Shanghai', 'Shanghai / Beijing'], ['Asia/Tokyo', 'Tokyo / Seoul'], ['Australia/Sydney', 'Sydney / Melbourne'],
    ['Pacific/Auckland', 'Auckland'], ['UTC', 'UTC']
  ];
  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function nowParts() {
    var now = new Date(), tz = settings.tz;
    if (!tz) return { h: now.getHours(), m: now.getMinutes(), day: now.getDay(), mon: now.getMonth(), date: now.getDate() };
    try {
      var fmt = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: 'numeric', weekday: 'short', month: 'short', day: 'numeric', hour12: false });
      var p = {}; fmt.formatToParts(now).forEach(function (x) { p[x.type] = x.value; });
      var dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      var monMap = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
      var h = parseInt(p.hour, 10); if (h === 24) h = 0;
      return { h: h, m: parseInt(p.minute, 10), day: dayMap[p.weekday] || 0, mon: monMap[p.month] || 0, date: parseInt(p.day, 10) };
    } catch (e) { return { h: now.getHours(), m: now.getMinutes(), day: now.getDay(), mon: now.getMonth(), date: now.getDate() }; }
  }
  function updateTime() {
    var p = nowParts();
    var t = pill.querySelector('#qh-pill-time');
    if (t) t.textContent = DAYS[p.day] + ', ' + MONTHS[p.mon] + ' ' + p.date + '  ' + pad(p.h) + ':' + pad(p.m);
  }
  function updateWifi() {
    var w = pill.querySelector('#qh-pill-wifi');
    if (!w) return;
    var on = navigator.onLine !== false;
    w.style.opacity = on ? '' : '0.3';
    w.title = on ? 'Wi-Fi — tap to choose a network' : 'Offline';
  }
  function initBattery() {
    if (!navigator.getBattery) return;
    navigator.getBattery().then(function (b) {
      function sync() {
        var fill = pill.querySelector('#qh-batt-fill');
        var icon = pill.querySelector('#qh-pill-battery');
        if (fill) { fill.setAttribute('width', String(Math.max(0.5, Math.min(15, 15 * (b.level || 0))))); fill.setAttribute('opacity', b.charging ? '0.95' : '0.7'); }
        if (icon) icon.title = Math.round((b.level || 0) * 100) + '%' + (b.charging ? ' (charging)' : '');
      }
      b.addEventListener('levelchange', sync); b.addEventListener('chargingchange', sync); sync();
    }).catch(function () {});
  }

  // Power menu off the pill (matches the home screen's power menu)
  var powerMenu = null;
  function hidePowerMenu() { if (powerMenu) { powerMenu.remove(); powerMenu = null; document.removeEventListener('click', hidePowerMenu); } }
  function togglePowerMenu() {
    if (powerMenu) { hidePowerMenu(); return; }
    var m = document.createElement('div');
    m.id = 'qh-power-menu';
    m.style.cssText = 'position:fixed;z-index:2147483641;background:var(--qh-panel-bg);border:1px solid var(--qh-card-border);border-radius:12px;box-shadow:0 16px 40px rgba(0,0,0,0.22);padding:6px;min-width:168px;display:flex;flex-direction:column;gap:2px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;visibility:hidden;';
    m.innerHTML =
      '<button type="button" data-act="sleep">Sleep</button>'
      + '<button type="button" data-act="reboot">Restart</button>'
      + '<button type="button" data-act="poweroff" class="danger">Power off</button>';
    [].forEach.call(m.querySelectorAll('button'), function (b) {
      b.style.cssText = 'text-align:left;background:none;border:none;cursor:pointer;font:inherit;font-size:13px;color:' + (b.classList.contains('danger') ? '#e06a6a' : 'var(--qh-text-strong)') + ';padding:9px 12px;border-radius:8px;';
      b.addEventListener('mouseenter', function () { b.style.background = 'var(--qh-row-hover)'; });
      b.addEventListener('mouseleave', function () { b.style.background = 'none'; });
    });
    m.querySelector('[data-act="sleep"]').addEventListener('click', function () { hidePowerMenu(); helperAction('/sleep'); });
    m.querySelector('[data-act="reboot"]').addEventListener('click', function () { hidePowerMenu(); window.qhConfirm({ title: 'Restart?', confirmText: 'Restart', danger: true, onConfirm: function () { helperAction('/reboot'); } }); });
    m.querySelector('[data-act="poweroff"]').addEventListener('click', function () { hidePowerMenu(); window.qhConfirm({ title: 'Power off?', confirmText: 'Power off', danger: true, onConfirm: function () { helperAction('/poweroff'); } }); });
    document.documentElement.appendChild(m);
    // Anchor the menu to the pill's CURRENT position, and flip it ABOVE the pill
    // when the pill is near the bottom of the screen, so it follows the pill and
    // never runs off-screen.
    (function () {
      var r = pill.getBoundingClientRect();
      var mw = m.offsetWidth, mh = m.offsetHeight;
      var left = Math.min(Math.max(8, r.right - mw), Math.max(8, window.innerWidth - mw - 8));
      var below = r.bottom + 6;
      var top = (below + mh <= window.innerHeight - 8) ? below : (r.top - 6 - mh);
      top = Math.min(Math.max(8, top), Math.max(8, window.innerHeight - mh - 8));
      m.style.left = left + 'px'; m.style.top = top + 'px'; m.style.right = 'auto';
      m.style.visibility = 'visible';
    })();
    powerMenu = m;
    setTimeout(function () { document.addEventListener('click', hidePowerMenu); }, 0);
  }

  // ════════════ BOTTOM-RIGHT APP SWITCHER ════════════
  var dock = document.createElement('div');
  dock.id = 'qh-dock';

  function buildDock() {
    var curId = detectCurrentId();
    var home = curId === '__home__';
    var current = (!home && curId) ? appById(curId) : null;

    var grip = document.createElement('span');
    grip.id = 'qh-dock-grip';
    grip.title = 'Drag to move';
    grip.innerHTML = GRIP_SVG;

    var cur = document.createElement('div');
    cur.id = 'qh-dock-current';
    if (home) {
      cur.style.background = HOME_GRAD;
      cur.innerHTML = '<span style="width:24px;height:24px;color:#fff;display:flex;"><svg width="24" height="24" viewBox="0 0 24 24">' + HOME_ICON + '</svg></span>';
      cur.title = 'Apps';
    } else if (current) {
      cur.style.background = gradOf(current);
      cur.innerHTML = iconHtml(current, 26);
      cur.title = current.name;
    } else {
      cur.style.background = HOME_GRAD;
      cur.innerHTML = '<span style="width:22px;height:22px;color:#fff;display:flex;"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg></span>';
      cur.title = 'Apps';
    }
    cur.addEventListener('click', function (e) { e.stopPropagation(); toggleDockPanel(); });

    dock.innerHTML = '';
    dock.appendChild(grip);
    dock.appendChild(cur);
  }

  // The pop-out panel: a clear card of apps (icon + name), opened by tapping the bubble.
  var dockPanel = null;
  function closeDockPanel() {
    if (dockPanel) { dockPanel.remove(); dockPanel = null; document.removeEventListener('click', onDockAway); }
  }
  function onDockAway(e) { if (dockPanel && !dockPanel.contains(e.target) && !dock.contains(e.target)) closeDockPanel(); }
  function dockRow(label, grad, iconInner, onClick) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'qh-dock-row';
    b.innerHTML = '<span class="qh-dock-row-icon" style="background:' + grad + ';">' + iconInner + '</span><span class="qh-dock-row-name">' + esc(label) + '</span>';
    b.addEventListener('click', function (e) { e.stopPropagation(); closeDockPanel(); onClick(); });
    return b;
  }
  function toggleDockPanel() {
    if (dockPanel) { closeDockPanel(); return; }
    var curId = detectCurrentId(), home = curId === '__home__';
    var p = document.createElement('div');
    p.id = 'qh-dock-panel';
    orderedVisible().forEach(function (a) {
      if (curId === a.id) return;
      p.appendChild(dockRow(a.name, gradOf(a), iconHtml(a, 20), function () { window.location.href = appUrl(a); }));
    });
    if (!home) {
      if (p.childNodes.length) { var sep = document.createElement('div'); sep.className = 'qh-dock-panel-sep'; p.appendChild(sep); }
      p.appendChild(dockRow('Home', HOME_GRAD, '<span style="width:20px;height:20px;color:#fff;display:flex;"><svg width="20" height="20" viewBox="0 0 24 24">' + HOME_ICON + '</svg></span>', function () { window.location.href = HOME_URL; }));
    }
    if (!p.childNodes.length) {
      p.appendChild(dockRow('Home', HOME_GRAD, '<span style="width:20px;height:20px;color:#fff;display:flex;"><svg width="20" height="20" viewBox="0 0 24 24">' + HOME_ICON + '</svg></span>', function () { window.location.href = HOME_URL; }));
    }
    document.documentElement.appendChild(p);
    // Position just above the current bubble, right-aligned, clamped on screen.
    var cr = dock.querySelector('#qh-dock-current').getBoundingClientRect();
    var pr = p.getBoundingClientRect();
    var left = clamp(cr.right - pr.width, 6, Math.max(6, window.innerWidth - pr.width - 6));
    var top = cr.top - pr.height - 8;
    if (top < 6) top = cr.bottom + 8;   // no room above → drop below
    p.style.left = left + 'px'; p.style.top = top + 'px';
    dockPanel = p;
    setTimeout(function () { document.addEventListener('click', onDockAway); }, 0);
  }

  // ════════════ SETTINGS POPUP ════════════
  var settingsEl = document.createElement('div');
  settingsEl.id = 'qh-settings-overlay';

  var ROW_GLOBE = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15 15 0 0 1 0 20"/><path d="M12 2a15 15 0 0 0 0 20"/><path d="M2 12h20"/></svg>';
  var ROW_WIFI = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="white" stroke="none"/></svg>';
  var ROW_MOON = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  var ROW_RESTART = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v6h6"/></svg>';
  var ROW_POWER = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v9"/><path d="M18.4 6.6a9 9 0 1 1-12.8 0"/></svg>';
  var ROW_TERM = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>';
  var ROW_MORE = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>';
  var THEME_DOTS = {
    purple: 'linear-gradient(135deg,#d9c2f5,#b083e0)',
    wood: 'linear-gradient(135deg,#d8b88c,#a9743c)',
    grey: 'linear-gradient(135deg,#c2c8d0,#7c8694)',
    dark: 'linear-gradient(135deg,#3a3448,#1e1a28)'
  };
  var arrow = '<span class="qhx-row-arrow">&#x203A;</span>';

  function buildSettings() {
    var themeBtns = ['purple', 'wood', 'grey', 'dark'].map(function (t) {
      return '<button class="qhx-theme-btn' + (settings.theme === t ? ' active' : '') + '" data-theme="' + t + '" title="' + t + '"><span class="qhx-theme-dot" style="background:' + THEME_DOTS[t] + (t === 'dark' ? ';border:1px solid rgba(255,255,255,0.15)' : '') + '"></span></button>';
    }).join('');
    var tzOpts = TZ_OPTIONS.map(function (p) { return '<option value="' + p[0] + '"' + (p[0] === settings.tz ? ' selected' : '') + '>' + esc(p[1]) + '</option>'; }).join('');

    settingsEl.innerHTML =
      '<div class="qhx-panel">'
      + '<div class="qhx-header"><div><div class="qhx-title">Settings</div><div class="qhx-subtitle">Quick settings · all settings on Home</div></div><button class="qhx-close" title="Close">&#x2715;</button></div>'

      + '<div class="qhx-section">Look</div>'
      + '<div class="qhx-card"><div class="qhx-row" style="flex-direction:column;align-items:stretch;gap:8px;">'
      + '<div class="qhx-row-label">Theme</div><div class="qhx-themes">' + themeBtns + '</div>'
      + '</div></div>'

      + '<div class="qhx-section">Connection</div>'
      + '<div class="qhx-card">'
      + '<div class="qhx-row clickable" data-act="wifi"><div class="qhx-row-icon">' + ROW_WIFI + '</div><div class="qhx-row-text"><div class="qhx-row-label">Wi-Fi</div><div class="qhx-row-sub" id="qhx-wifi-sub">Connected</div></div>' + arrow + '</div>'
      + '<div class="qhx-row"><div class="qhx-row-icon">' + ROW_GLOBE + '</div><div class="qhx-row-text"><div class="qhx-row-label">Region</div><div class="qhx-row-sub">Time zone — keeps the clock right</div></div><select class="qhx-select" id="qhx-tz">' + tzOpts + '</select></div>'
      + '</div>'

      + '<div class="qhx-section">Power</div>'
      + '<div class="qhx-card">'
      + '<div class="qhx-row clickable" data-act="sleep"><div class="qhx-row-icon">' + ROW_MOON + '</div><div class="qhx-row-text"><div class="qhx-row-label">Sleep</div><div class="qhx-row-sub">Rest the screen</div></div>' + arrow + '</div>'
      + '<div class="qhx-row clickable" data-act="reboot"><div class="qhx-row-icon">' + ROW_RESTART + '</div><div class="qhx-row-text"><div class="qhx-row-label">Restart</div><div class="qhx-row-sub">Turn it off and on again</div></div>' + arrow + '</div>'
      + '<div class="qhx-row clickable danger" data-act="poweroff"><div class="qhx-row-icon">' + ROW_POWER + '</div><div class="qhx-row-text"><div class="qhx-row-label">Power off</div><div class="qhx-row-sub">Shut the laptop down</div></div>' + arrow + '</div>'
      + '</div>'

      + '<div class="qhx-section">More</div>'
      + '<div class="qhx-card">'
      + '<div class="qhx-row clickable" data-act="terminal"><div class="qhx-row-icon">' + ROW_TERM + '</div><div class="qhx-row-text"><div class="qhx-row-label">Open terminal</div><div class="qhx-row-sub">For paste-and-run fixes</div></div>' + arrow + '</div>'
      + '<div class="qhx-row clickable" data-act="more"><div class="qhx-row-icon">' + ROW_MORE + '</div><div class="qhx-row-text"><div class="qhx-row-label">All settings &amp; backups</div><div class="qhx-row-sub">Apps, brightness, Drive, restore — on the home screen</div></div>' + arrow + '</div>'
      + '</div>'

      + '<div class="qhx-footer">Quill Haven v' + esc(LOCAL_VERSION) + ' ' + esc(localEmoji) + '</div>'
      + '</div>';

    settingsEl.querySelector('.qhx-close').addEventListener('click', closeSettings);
    settingsEl.addEventListener('click', function (e) { if (e.target === settingsEl) closeSettings(); });

    [].forEach.call(settingsEl.querySelectorAll('.qhx-theme-btn'), function (b) {
      b.addEventListener('click', function () { setTheme(b.dataset.theme); });
    });
    settingsEl.querySelector('#qhx-tz').addEventListener('change', function () { saveSettings({ tz: this.value }); updateTime(); bridgeHome(); });

    function act(name, fn) { var r = settingsEl.querySelector('[data-act="' + name + '"]'); if (r) r.addEventListener('click', fn); }
    act('wifi', function () { helperAction('/wifi-settings'); });
    act('sleep', function () { helperAction('/sleep'); });
    act('reboot', function () { window.qhConfirm({ title: 'Restart?', confirmText: 'Restart', danger: true, onConfirm: function () { helperAction('/reboot'); } }); });
    act('poweroff', function () { window.qhConfirm({ title: 'Power off?', confirmText: 'Power off', danger: true, onConfirm: function () { helperAction('/poweroff'); } }); });
    act('terminal', function () { helperAction('/terminal'); });
    act('more', openAllSettings);
  }

  function openSettings() {
    // On the home screen, open the REAL full settings panel (theme, brightness,
    // Drive, storage, restore, apps, clipboard — all already there and wired).
    // Clicking the home's own (now-hidden) gear runs its toggleSettings(), which
    // also refreshes storage/drive/region. Off-home we show the quick panel.
    if (isHome()) {
      var btn = document.querySelector('.settings-btn[onclick="toggleSettings()"]')
             || document.querySelector('.settings-btn[onclick*="toggleSettings"]');
      if (btn) { btn.click(); return; }
      var ov = document.querySelector('.settings-overlay'); if (ov) { ov.classList.add('open'); return; }
    }
    buildSettings(); refreshWifiSub(); settingsEl.classList.add('open');
  }
  function closeSettings() { settingsEl.classList.remove('open'); }
  function refreshWifiSub() {
    var s = settingsEl.querySelector('#qhx-wifi-sub'); if (s) s.textContent = navigator.onLine !== false ? 'Connected' : 'Offline';
  }
  // "All settings & backups" → on the home page, open the home screen's own
  // full settings panel; on any other page, go home (the rich settings live there).
  function openAllSettings() {
    closeSettings();
    if (isHome()) {
      var ov = document.querySelector('.settings-overlay');
      if (ov) { ov.classList.add('open'); return; }
    }
    window.location.href = HOME_URL;
  }

  // ════════════ THEME ════════════
  function applyTheme(name) {
    var html = document.documentElement;
    html.classList.remove('qh-theme-wood', 'qh-theme-grey', 'qh-theme-dark');
    if (name && name !== 'purple') html.classList.add('qh-theme-' + name);
    // On the home page, re-skin the home UI too (its wallpaper + clock read the
    // same theme classes), and keep its localStorage in step.
    if (isHome()) {
      try {
        document.body.classList.remove('theme-wood', 'theme-grey', 'theme-dark');
        if (name && name !== 'purple') document.body.classList.add('theme-' + name);
        localStorage.setItem('qh-theme', name);
      } catch (e) {}
    }
    [].forEach.call(settingsEl.querySelectorAll('.qhx-theme-btn'), function (b) {
      b.classList.toggle('active', b.dataset.theme === name);
    });
  }
  function setTheme(name) {
    if (['purple', 'wood', 'grey', 'dark'].indexOf(name) < 0) name = 'purple';
    saveSettings({ theme: name });
    applyTheme(name);
  }

  // ════════════ HOME-PAGE BRIDGE ════════════
  // chrome.storage is the master for look/clock; the home screen's localStorage
  // is the master for the app list. Each setting syncs one way so they never fight.
  function bridgeHome() {
    if (!isHome()) return;
    try {
      if (settings.theme != null) localStorage.setItem('qh-theme', settings.theme);
      if (settings.tz) localStorage.setItem('qh-tz', settings.tz); else localStorage.removeItem('qh-tz');
    } catch (e) {}
    var patch = {};
    try { var a = localStorage.getItem('qh-addons'); if (a != null) patch.addons = a; } catch (e) {}
    try { var v = localStorage.getItem('qh-apps'); if (v != null) patch.apps = v; } catch (e) {}
    try { var o = localStorage.getItem('qh-order'); if (o != null) patch.order = o; } catch (e) {}
    // First run: seed look settings from the home screen if we have none yet.
    if (settings.theme == null) { try { var t = localStorage.getItem('qh-theme'); if (t) patch.theme = t; } catch (e) {} }
    if (!settings.tz) { try { var tz = localStorage.getItem('qh-tz'); if (tz) patch.tz = tz; } catch (e) {} }
    if (Object.keys(patch).length) saveSettings(patch);
  }

  // ════════════ UPDATE CHECK ════════════
  function checkForUpdate() {
    fetch(VERSION_URL, { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d.emoji) {
          localEmoji = d.emoji;
          var em = pill.querySelector('#qh-pill-emoji');
          if (em) em.childNodes[0].textContent = localEmoji;
        }
        if (d.version && d.version !== LOCAL_VERSION) {
          updateInfo = d;
          var em2 = pill.querySelector('#qh-pill-emoji');
          if (em2) { em2.classList.add('qhp-update'); var tip = em2.querySelector('.qhp-tip'); if (tip) tip.textContent = 'Update to v' + d.version + ' ' + (d.emoji || ''); }
        }
      })
      .catch(function () {});
  }
  function doUpdate() {
    var go = function () { window.location.href = HOME_URL + '?v=' + Date.now(); };
    var p1 = window.caches ? caches.keys().then(function (ks) { return Promise.all(ks.map(function (k) { return caches.delete(k); })); }) : Promise.resolve();
    var p2 = navigator.serviceWorker ? navigator.serviceWorker.getRegistrations().then(function (rs) { return Promise.all(rs.map(function (r) { return r.unregister(); })); }) : Promise.resolve();
    Promise.all([p1, p2]).then(go).catch(go);
  }

  // ════════════ DRAG TO REPOSITION ════════════
  // The pill and the app switcher can be dragged anywhere and stay put, so they
  // never cover something important on the page underneath. Positions are saved
  // per-widget (chrome.storage) and restored on every page.
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function applyPos(el, pos) {
    if (!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number') return;
    var w = el.offsetWidth || 0, h = el.offsetHeight || 0;
    el.style.left = clamp(pos.x, 4, Math.max(4, window.innerWidth - w - 4)) + 'px';
    el.style.top = clamp(pos.y, 4, Math.max(4, window.innerHeight - h - 4)) + 'px';
    el.style.right = 'auto'; el.style.bottom = 'auto';
  }
  // Drag is started ONLY from the small grip handle, so every other tap on the
  // widget (buttons, the app bubble) is a normal click — nothing gets stolen.
  function setupDrag(el, handle, key) {
    applyPos(el, settings[key]);
    if (!handle) return;
    var startX, startY, origX, origY, dragging = false;
    handle.addEventListener('pointerdown', function (e) {
      if (e.button && e.button !== 0) return;
      e.preventDefault();
      var r = el.getBoundingClientRect();
      origX = r.left; origY = r.top; startX = e.clientX; startY = e.clientY;
      dragging = true;
    });
    document.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var w = el.offsetWidth, h = el.offsetHeight;
      el.style.left = clamp(origX + (e.clientX - startX), 4, window.innerWidth - w - 4) + 'px';
      el.style.top = clamp(origY + (e.clientY - startY), 4, window.innerHeight - h - 4) + 'px';
      el.style.right = 'auto'; el.style.bottom = 'auto';
    });
    function end() {
      if (!dragging) return;
      dragging = false;
      var patch = {}; patch[key] = { x: parseFloat(el.style.left), y: parseFloat(el.style.top) };
      saveSettings(patch);
    }
    document.addEventListener('pointerup', end);
    document.addEventListener('pointercancel', end);
  }

  // ════════════ INIT ════════════
  loadSettings().then(function () {
    try {
      bridgeHome();               // sync look ⇄ apps with the home screen
      applyTheme(settings.theme); // skin the overlay (and the home UI if we're home)
      buildPill();
      buildDock();
      buildSettings();
      document.documentElement.appendChild(pill);
      document.documentElement.appendChild(dock);
      document.documentElement.appendChild(settingsEl);
      window.__qhOverlayUp = true;   // tell qh-early.js the overlay is up, so its
                                     // safety-net timer leaves the native hide in place

      setupDrag(pill, pill.querySelector('#qh-pill-grip'), 'posPill');   // drag from the grip
      setupDrag(dock, dock.querySelector('#qh-dock-grip'), 'posDock');   // drag from the grip
      // Only hide the home screen's OWN top bar + dock AFTER our overlay is safely
      // on the page. If anything above threw, we skip this — so a glitch can never
      // leave the home screen with no overlay AND no way to open apps.
      if (isHome()) document.documentElement.classList.add('qh-ext-home');
      checkForUpdate();
      startIdleWatch();   // turn the screen off after a few idle minutes (battery)
      // Live app-list sync (no reload needed): when the home screen changes its
      // apps, re-bridge localStorage -> chrome.storage; and keep our in-memory
      // settings fresh from chrome.storage so the switcher always lists the latest.
      window.addEventListener('qh-apps-changed', function () { try { bridgeHome(); } catch (e) {} });
      try {
        chrome.storage.onChanged.addListener(function (changes, area) {
          if (area !== 'local') return;
          ['addons', 'apps', 'order', 'theme', 'tz'].forEach(function (k) {
            if (changes[k]) settings[k] = changes[k].newValue;
          });
        });
      } catch (e) {}
    } catch (e) {
      // Last resort: make sure the home screen's native buttons are still there.
      document.documentElement.classList.remove('qh-ext-home');
      var eh = document.getElementById('qh-early-hide'); if (eh) eh.remove();
    }
  });
})();
