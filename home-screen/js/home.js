// ── Boot splash ──
// Loader bar tracks REAL progress: ~30% on DOMContentLoaded, ~70% when fonts are
// ready, 100% on window load. The splash fades after the bar reaches the end.
(function() {
  var typeEl = document.getElementById('bootType');
  var full = 'Your writing sanctuary';
  if (location.hash === '#frozen') {
    if (typeEl) typeEl.textContent = full;
    var f = document.querySelector('.boot-loader-fill'); if (f) { f.style.width = '100%'; }
    var t = document.querySelector('.boot-text'); if (t) { t.style.animation = 'none'; t.style.opacity = '1'; }
    var q = document.querySelector('.boot-quill'); if (q) { q.style.animation = 'none'; q.style.opacity = '1'; q.style.transform = 'none'; }
    var g = document.querySelector('.boot-tagline'); if (g) { g.style.animation = 'none'; g.style.opacity = '1'; }
    return;
  }
  var i = 0;
  var pageStart = Date.now();
  var TYPE_DELAY = 600;                                  // small pause so quill + title render first
  var TYPE_DURATION = 62 * full.length + 250;            // ~1550ms to finish typing
  var MIN_SPLASH_MS = TYPE_DELAY + TYPE_DURATION + 500;  // ~2650ms — fade no earlier than this
  setTimeout(function startTyping() {
    var iv = setInterval(function() {
      i++;
      if (typeEl) typeEl.textContent = full.slice(0, i);
      if (i >= full.length) clearInterval(iv);
    }, 62);
  }, TYPE_DELAY);
  function setLoader(pct) { var f = document.querySelector('.boot-loader-fill'); if (f) f.style.width = pct + '%'; }
  setLoader(15);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setLoader(35); });
  else setLoader(35);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setLoader(75); });
  function finishLoad() {
    setLoader(100);
    // Wait for window.load AND for the typing animation to actually finish
    // (otherwise on a fast preview the splash fades before the tagline starts).
    var elapsed = Date.now() - pageStart;
    var wait = Math.max(400, MIN_SPLASH_MS - elapsed);
    setTimeout(function () {
      var splash = document.getElementById('bootSplash');
      if (splash) { splash.classList.add('fade-out'); setTimeout(function () { splash.remove(); }, 900); }
    }, wait);
  }
  if (document.readyState === 'complete') finishLoad();
  else window.addEventListener('load', finishLoad);
  // Hard ceiling so the splash never gets stuck
  setTimeout(function () { var s = document.getElementById('bootSplash'); if (s && !s.classList.contains('fade-out')) { setLoader(100); s.classList.add('fade-out'); setTimeout(function () { s.remove(); }, 900); } }, 8000);
})();

// ── Timezone ──
function getTz() { try { return localStorage.getItem('qh-tz') || ''; } catch (e) { return ''; } }
function setTimezone(v) { try { if (v) localStorage.setItem('qh-tz', v); else localStorage.removeItem('qh-tz'); } catch (e) {} updateClock(); }
// Common zones — kept short on purpose. "Auto" follows the browser/device.
var TZ_OPTIONS = [
  ['', 'Auto (device)'],
  ['America/Los_Angeles', 'Los Angeles (Pacific)'],
  ['America/Denver', 'Denver (Mountain)'],
  ['America/Chicago', 'Chicago (Central)'],
  ['America/New_York', 'New York (Eastern)'],
  ['America/Toronto', 'Toronto (Eastern)'],
  ['America/Halifax', 'Halifax (Atlantic)'],
  ['Atlantic/Reykjavik', 'Reykjavík'],
  ['Europe/London', 'London'],
  ['Europe/Paris', 'Paris / Berlin / Rome'],
  ['Europe/Athens', 'Athens / Helsinki'],
  ['Europe/Moscow', 'Moscow'],
  ['Asia/Dubai', 'Dubai'],
  ['Asia/Kolkata', 'India (Kolkata)'],
  ['Asia/Singapore', 'Singapore / Hong Kong'],
  ['Asia/Shanghai', 'Shanghai / Beijing'],
  ['Asia/Tokyo', 'Tokyo / Seoul'],
  ['Australia/Sydney', 'Sydney / Melbourne'],
  ['Pacific/Auckland', 'Auckland'],
  ['UTC', 'UTC']
];
function buildTzSelect() {
  var sel = document.getElementById('tzSelect'); if (!sel) return;
  if (sel.options.length) return; // already built
  var current = getTz();
  TZ_OPTIONS.forEach(function (pair) {
    var o = document.createElement('option');
    o.value = pair[0]; o.textContent = pair[1];
    if (pair[0] === current) o.selected = true;
    sel.appendChild(o);
  });
}

// ── Clock ──
var DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
var MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function partsInZone(now, tz) {
  if (!tz) return { h: now.getHours(), m: now.getMinutes(), day: now.getDay(), mon: now.getMonth(), date: now.getDate() };
  try {
    var fmt = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: 'numeric', weekday: 'short', month: 'short', day: 'numeric', hour12: false });
    var p = {}; fmt.formatToParts(now).forEach(function (x) { p[x.type] = x.value; });
    // Build a Date by parsing the formatted parts; for day-of-week we map back
    var dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    var monMap = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
    var h = parseInt(p.hour, 10); if (h === 24) h = 0;
    return { h: h, m: parseInt(p.minute, 10), day: dayMap[p.weekday] || 0, mon: monMap[p.month] || 0, date: parseInt(p.day, 10) };
  } catch (e) {
    return { h: now.getHours(), m: now.getMinutes(), day: now.getDay(), mon: now.getMonth(), date: now.getDate() };
  }
}
function updateClock() {
  var now = new Date();
  var p = partsInZone(now, getTz());
  var mStr = String(p.m).padStart(2, '0');
  var h12 = p.h % 12 || 12, ampm = p.h >= 12 ? 'PM' : 'AM';
  document.getElementById('clock').textContent = h12 + ':' + mStr;
  document.getElementById('greeting').textContent = '';
  document.getElementById('dateLine').textContent = DAY_NAMES[p.day] + ', ' + MONTH_NAMES[p.mon] + ' ' + p.date;
  document.getElementById('topBarTime').textContent = DAY_NAMES[p.day].slice(0, 3) + ', ' + MONTH_NAMES[p.mon] + ' ' + p.date + '  ' + h12 + ':' + mStr + ' ' + ampm;
  var emojiEl = document.getElementById('topEmoji');
  if (emojiEl) emojiEl.textContent = LOCAL_EMOJI;
}
updateClock(); setInterval(updateClock, 1000);

// ── Live Wi-Fi (uses the helper for the real network name; falls back to online/offline) ──
function updateOnline(extra) {
  var on = (typeof navigator !== 'undefined' && navigator.onLine !== false);
  var icon = document.getElementById('topWifi');
  var sub = document.getElementById('wifiSub');
  var label = on ? (extra && extra.ssid ? extra.ssid : 'Connected') : 'Offline';
  if (icon) { icon.style.opacity = on ? '' : '0.35'; icon.title = label; }
  if (sub) { sub.textContent = label; }
}
function refreshWifi() {
  if (!navigator.onLine) { updateOnline(); return; }
  fetch('http://127.0.0.1:8137/network', { method: 'GET', mode: 'cors' })
    .then(function(r) { return r.ok ? r.json() : null; })
    .then(function(j) { updateOnline(j || {}); })
    .catch(function() { updateOnline(); });   // no helper (preview/website) -> plain "Connected"
}
window.addEventListener('online', refreshWifi);
window.addEventListener('offline', refreshWifi);
refreshWifi();
setInterval(refreshWifi, 15000);
// Tap the Wi-Fi row in Settings to open the network picker (only works on the device)
function openWifiPicker() { qhSystem('wifi-settings'); }

// ── Live battery (uses navigator.getBattery if the browser exposes it) ──
function updateBatteryUI(level, charging) {
  var fill = document.getElementById('topBatteryFill');
  var icon = document.getElementById('topBattery');
  if (fill) { fill.setAttribute('width', String(Math.max(0.5, Math.min(15, 15 * level)))); fill.setAttribute('opacity', charging ? '0.95' : '0.7'); }
  if (icon) { var pct = Math.round(level * 100); icon.title = pct + '%' + (charging ? ' (charging)' : ''); }
}
(function initBattery() {
  if (!navigator.getBattery) return; // Older Safari etc — leave the static icon
  navigator.getBattery().then(function (b) {
    function sync() { updateBatteryUI(b.level || 0, b.charging); }
    b.addEventListener('levelchange', sync);
    b.addEventListener('chargingchange', sync);
    sync();
  }).catch(function () {});
})();

// ── Custom background (picture set from the Files app, tuned in Settings) ──
function applyBg() {
  var bg = '', fit = 'cover', dim = '0';
  try { bg = localStorage.getItem('qh-bg') || ''; } catch (e) {}
  try { fit = localStorage.getItem('qh-bg-fit') || 'cover'; } catch (e) {}
  try { var d = localStorage.getItem('qh-bg-dim'); if (d !== null) dim = d; } catch (e) {}
  var el = document.getElementById('customBg');
  if (!el) { el = document.createElement('div'); el.id = 'customBg'; document.body.insertBefore(el, document.body.firstChild); }
  document.documentElement.style.setProperty('--bg-dim', dim);
  if (bg) {
    el.style.backgroundImage = 'url("' + bg + '")';
    el.style.backgroundSize = (fit === 'contain' ? 'contain' : 'cover');
    document.body.classList.add('has-bg');
  } else {
    el.style.backgroundImage = '';
    document.body.classList.remove('has-bg');
  }
  syncBgRow();
}
// Pick a background here in Settings, from the pictures in the Files app.
function setBg(dataUrl) {
  try { if (dataUrl) localStorage.setItem('qh-bg', dataUrl); else localStorage.removeItem('qh-bg'); } catch (e) {}
  applyBg();
}
function renderBgGallery() {
  var g = document.getElementById('bgGallery'); if (!g) return;
  var bg = ''; try { bg = localStorage.getItem('qh-bg') || ''; } catch (e) {}
  var pics = [];
  try { var f = JSON.parse(localStorage.getItem('qh-files') || '{}'); if (f && Array.isArray(f.pictures)) pics = f.pictures; } catch (e) {}
  g.innerHTML = '';
  // "Default" tile — tap it to clear the picture and go back to the pastel background.
  var def = document.createElement('button');
  def.type = 'button';
  def.className = 'bg-tile bg-default' + (!bg ? ' active' : '');
  def.title = 'Default background';
  def.setAttribute('aria-label', 'Default background');
  def.onclick = function () { setBg(''); };
  g.appendChild(def);
  // One tile per picture saved in the Files app.
  pics.slice().reverse().forEach(function (p) {
    var t = document.createElement('button');
    t.type = 'button';
    t.className = 'bg-tile' + (bg && bg === p.data ? ' active' : '');
    t.style.backgroundImage = 'url("' + p.data + '")';
    t.title = p.name || 'Picture';
    t.setAttribute('aria-label', p.name || 'Picture');
    t.onclick = function () { setBg(p.data); };
    g.appendChild(t);
  });
  if (!pics.length) {
    var hint = document.createElement('span');
    hint.className = 'bg-hint';
    hint.textContent = 'Add pictures in the Files app';
    g.appendChild(hint);
  }
}
function syncBgRow() {
  var row = document.getElementById('bgRow'); if (!row) return;
  var bg = ''; try { bg = localStorage.getItem('qh-bg') || ''; } catch (e) {}
  renderBgGallery();
  // Fill/Fit + Dim only make sense once a picture is chosen.
  var fitToggle = document.getElementById('bgFitToggle'); if (fitToggle) fitToggle.hidden = !bg;
  var dimWrap = document.getElementById('bgDimWrap'); if (dimWrap) dimWrap.hidden = !bg;
  if (!bg) return;
  var fit = 'cover'; try { fit = localStorage.getItem('qh-bg-fit') || 'cover'; } catch (e) {}
  row.querySelectorAll('.mode-btn[data-fit]').forEach(function (b) { b.classList.toggle('active', b.dataset.fit === fit); });
  var dim = '0'; try { var d = localStorage.getItem('qh-bg-dim'); if (d !== null) dim = d; } catch (e) {}
  var sl = document.getElementById('bgDimSlider'); if (sl) sl.value = Math.round(parseFloat(dim) * 100);
}
function setBgFit(fit) { try { localStorage.setItem('qh-bg-fit', fit); } catch (e) {} applyBg(); }
function setBgDim(v) { var dim = (Math.max(0, Math.min(70, +v)) / 100).toFixed(2); try { localStorage.setItem('qh-bg-dim', dim); } catch (e) {} applyBg(); }
window.addEventListener('storage', function (e) {
  if (e.key === 'qh-bg' || e.key === 'qh-bg-fit' || e.key === 'qh-bg-dim') applyBg();
  else if (e.key === 'qh-files') renderBgGallery();
});
applyBg();

// ═══════════════════════════════════════════════
//  APPS — defined once here, rendered everywhere
//  (dock, top bar, app windows, settings list)
// ═══════════════════════════════════════════════

// Built-in apps: always present, can't be removed.
var BUILTIN_APPS = [
  { id:'docs', name:'Google Docs', kind:'site', url:'https://docs.google.com',
    c1:'#f7cfe6', c2:'#eeb1cf', vb:'0 0 28 28',
    icon:'<rect x="6" y="2" width="16" height="22" rx="2.5" fill="none" stroke="white" stroke-width="1.4" opacity="0.9"/><path d="M18 2L22 6L18 6Z" fill="white" opacity="0.35"/><line x1="9" y1="10" x2="19" y2="10" stroke="white" stroke-width="1.4" stroke-linecap="round" opacity="0.7"/><line x1="9" y1="13.5" x2="16" y2="13.5" stroke="white" stroke-width="1.4" stroke-linecap="round" opacity="0.55"/><line x1="9" y1="17" x2="18" y2="17" stroke="white" stroke-width="1.4" stroke-linecap="round" opacity="0.45"/>' },
  { id:'writing', name:'Local Writing', kind:'local', src:'apps/writing/index.html?v=24',
    c1:'#c2e8c9', c2:'#97d6a4', vb:'0 0 24 24', sub:'Saves to device, not the cloud',
    icon:'<path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" fill="none" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity="0.92"/><path d="M16 8 2 22" stroke="white" stroke-width="1.6" stroke-linecap="round" opacity="0.7"/><path d="M17.5 15H9" stroke="white" stroke-width="1.6" stroke-linecap="round" opacity="0.7"/>' },
  { id:'files', name:'Files', kind:'local', src:'apps/files/index.html?v=8',
    c1:'#c4d4f7', c2:'#a0bcee', vb:'0 0 24 24', sub:'Documents, pictures, USB',
    icon:'<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="none" stroke="white" stroke-width="1.5" stroke-linejoin="round" opacity="0.92"/>' }
];

// Add-ons ship by default but can be removed (and the user can add their own).
// No forced add-ons. Dabble / Typing & Tomes are added by the user via "Add App"
// (Marie's call — she didn't want them shoved in as defaults).
var DEFAULT_ADDONS = [];

function loadAddons() {
  var a = null;
  try { a = JSON.parse(localStorage.getItem('qh-addons')); } catch(e) {}
  if (!Array.isArray(a)) { a = DEFAULT_ADDONS.slice(); saveAddons(a); return a; }   // seed Dabble on first run
  // keep default add-ons (e.g. Dabble) showing their latest colour / icon / name
  var byId = {}; DEFAULT_ADDONS.forEach(function(d){ byId[d.id] = d; });
  return a.map(function(app){ return byId[app.id] || app; });
}
function saveAddons(a) { try { localStorage.setItem('qh-addons', JSON.stringify(a)); } catch(e) {} }

var addons = loadAddons();
function allApps() { return BUILTIN_APPS.concat(addons); }
function isBuiltin(id) { return BUILTIN_APPS.some(function(a){ return a.id === id; }); }

// Custom display order (set by dragging rows in Settings). Stored as a list of
// app ids; any app not listed keeps its natural place at the end.
function loadOrder() { try { var o = JSON.parse(localStorage.getItem('qh-order')); return Array.isArray(o) ? o : []; } catch(e) { return []; } }
function saveOrder(ids) { try { localStorage.setItem('qh-order', JSON.stringify(ids)); } catch(e) {} }
function orderedApps() {
  var apps = allApps();
  var order = loadOrder();
  var pos = {}; order.forEach(function(id, i) { pos[id] = i; });
  return apps.slice().sort(function(a, b) {
    var pa = (a.id in pos) ? pos[a.id] : order.length + apps.indexOf(a);
    var pb = (b.id in pos) ? pos[b.id] : order.length + apps.indexOf(b);
    return pa - pb;
  });
}
// Per-theme colours for the APP icons. The default (Purple) theme uses each
// app's own colour; Wood/Slate shift the known apps toward the theme palette.
var currentTheme = 'purple';
var THEME_APP_COLORS = {
  wood: {
    docs:    ['#c7c3bd', '#aea89e'],
    writing: ['#c2c2ba', '#a9a99d'],
    files:   ['#c3c0b9', '#a8a399'],
    dabble:  ['#c5c0ba', '#aaa49b']
  },
  grey: {
    docs:    ['#c0d4ee', '#9fbce4'],
    writing: ['#c2ccc6', '#a4b1aa'],
    files:   ['#bfceea', '#9fb3d6'],
    dabble:  ['#c6cad6', '#abb1c0']
  }
};
function appColors(app) {
  var pal = THEME_APP_COLORS[currentTheme];
  if (pal && pal[app.id]) return pal[app.id];
  return [app.c1, app.c2];
}
function gradOf(app) { var c = appColors(app); return 'linear-gradient(145deg,' + c[0] + ',' + c[1] + ')'; }
function isVisible(id) {
  try { var m = JSON.parse(localStorage.getItem('qh-apps') || '{}'); return m[id] !== false; } catch(e) { return true; }
}

// An app's icon: a built-in SVG, or the first letter for a user-added app.
function iconHtml(app, px) {
  if (app.icon) return '<svg width="'+px+'" height="'+px+'" viewBox="'+(app.vb||'0 0 24 24')+'" fill="none" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'+app.icon+'</svg>';
  var letter = (app.name || '?').trim().charAt(0).toUpperCase() || '?';
  return '<span style="color:#fff;font-weight:600;line-height:1;font-size:'+Math.round(px*0.5)+'px;">'+esc(letter)+'</span>';
}

var currentApp = null;

function openApp(name) {
  if (currentApp === name) { goHome(); return; }
  var siteApp = allApps().filter(function(a) { return a.id === name; })[0];
  if (siteApp && siteApp.kind !== 'local' && siteApp.url) {
    flushOpenApps();
    var view = document.getElementById('view-' + name);
    if (view) view.classList.add('active');
    document.getElementById('homeScreen').style.display = 'none';
    document.querySelectorAll('[data-app]').forEach(function(a) {
      a.classList.toggle('active', a.dataset.app === name);
    });
    var nm = document.getElementById('openAppName');
    if (nm) nm.textContent = siteApp.name;
    var tag = document.getElementById('openAppTag');
    if (tag) tag.classList.add('show');
    document.body.classList.add('app-open');
    currentApp = name;
    return;
  }
  document.querySelectorAll('.app-view').forEach(function(v) { v.classList.remove('active'); });
  document.getElementById('homeScreen').style.display = 'none';
  var view = document.getElementById('view-' + name);
  if (view) view.classList.add('active');
  document.querySelectorAll('[data-app]').forEach(function(a) {
    a.classList.toggle('active', a.dataset.app === name);
  });
  var app = allApps().filter(function(a) { return a.id === name; })[0];
  var nm = document.getElementById('openAppName');
  if (nm) nm.textContent = app ? app.name : '';
  var tag = document.getElementById('openAppTag');
  if (tag) tag.classList.add('show');
  document.body.classList.add('app-open');
  currentApp = name;
}

function goHome() {
  document.querySelectorAll('.app-view').forEach(function(v) { v.classList.remove('active'); });
  document.getElementById('homeScreen').style.display = 'flex';
  document.querySelectorAll('[data-app]').forEach(function(a) { a.classList.remove('active'); });
  var tag = document.getElementById('openAppTag'); if (tag) tag.classList.remove('show');
  document.body.classList.remove('app-open');
  currentApp = null;
}

// Right-click an app icon for a small menu (restart / close)
var appMenu = null;
function hideAppMenu() {
  if (appMenu) { appMenu.remove(); appMenu = null; }
  document.removeEventListener('click', hideAppMenu);
}
function restartApp(id) {
  var view = document.getElementById('view-' + id);
  if (view) {
    var ifr = view.querySelector('iframe');
    if (ifr) {
      try { var w = ifr.contentWindow; if (w && typeof w.flushAndPersist === 'function') w.flushAndPersist(); } catch (e) {}
      ifr.src = ifr.src;
    }
  }
  openApp(id);
}
function showAppMenu(e, id) {
  hideAppMenu();
  var m = document.createElement('div');
  m.className = 'app-menu';
  m.innerHTML = '<button type="button" data-act="restart">Restart app</button><button type="button" data-act="close">Close</button>';
  m.style.left = e.clientX + 'px';
  if (e.clientY > window.innerHeight / 2) { m.style.top = (e.clientY - 6) + 'px'; m.style.transform = 'translateY(-100%)'; }
  else { m.style.top = (e.clientY + 6) + 'px'; }
  m.addEventListener('click', function(ev) {
    var b = ev.target.closest('button'); if (!b) return;
    if (b.dataset.act === 'restart') restartApp(id); else goHome();
    hideAppMenu();
  });
  document.body.appendChild(m);
  appMenu = m;
  setTimeout(function() { document.addEventListener('click', hideAppMenu); }, 0);
}

function refreshDockEmpty() {
  var dock = document.getElementById('dock');
  var vis = dock.querySelectorAll('.app:not(.hidden)');
  dock.classList.toggle('is-empty', vis.length === 0);
}

function buildView(app) {
  var v = document.createElement('div');
  v.className = 'app-view';
  v.id = 'view-' + app.id;
  if (app.kind === 'local') {
    v.innerHTML = '<iframe class="app-frame" src="' + app.src + '" title="' + esc(app.name) + '"></iframe>';
  } else {
    v.innerHTML = '<div class="app-launch">'
      + '<div class="app-body">'
      + '<div class="app-body-icon" style="background:' + gradOf(app) + ';">' + iconHtml(app, 36) + '</div>'
      + '<div class="app-body-name">' + esc(app.name) + '</div>'
      + '<button class="app-open-btn" onclick="window.location.href=\'' + esc(app.url) + '\'">Open ' + esc(app.name) + '</button>'
      + '<div class="app-body-note">To come home, close this window:<br><b>Alt + F4</b> on the keyboard</div>'
      + '<button class="app-home-btn" onclick="goHome()">← Back to Home</button>'
      + '</div></div>';
  }
  return v;
}

// Build one row in the Settings → Apps list.
function buildSettingsRow(app) {
  var row = document.createElement('div');
  row.className = 'settings-row app-row';
  row.dataset.appid = app.id;
  row.innerHTML =
    '<span class="drag-grip" title="Drag to reorder" aria-label="Drag to reorder"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="1.6"/><circle cx="15" cy="5" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="19" r="1.6"/><circle cx="15" cy="19" r="1.6"/></svg></span>'
    + '<div class="app-mini-icon" data-appicon="' + app.id + '" style="background:' + gradOf(app) + ';">' + iconHtml(app, 14) + '</div>'
    + '<div class="settings-row-text"><div class="settings-row-label">' + esc(app.name) + '</div>'
    + (app.sub ? '<div class="settings-row-sub">' + esc(app.sub) + '</div>' : '') + '</div>'
    + (isBuiltin(app.id) ? '' : '<button class="app-remove" title="Remove this app">&#x2715;</button>')
    + '<label class="toggle"><input type="checkbox" data-appvis="' + app.id + '"><div class="toggle-track"></div><div class="toggle-thumb"></div></label>';
  var cb = row.querySelector('input[data-appvis]');
  cb.checked = isVisible(app.id);
  cb.addEventListener('change', function() { toggleAppVis(app.id, cb.checked); });
  var rb = row.querySelector('.app-remove');
  if (rb) rb.addEventListener('click', function() { removeApp(app.id); });
  // Drag to reorder — only starts when you grab the grip handle
  var grip = row.querySelector('.drag-grip');
  grip.addEventListener('mousedown', function() { row.draggable = true; });
  grip.addEventListener('touchstart', function() { row.draggable = true; }, { passive: true });
  row.addEventListener('dragstart', onRowDragStart);
  row.addEventListener('dragover', onRowDragOver);
  row.addEventListener('dragend', onRowDragEnd);
  return row;
}

// ── Drag-to-reorder helpers (Settings → Apps) ──
var _dragRow = null;
function onRowDragStart(e) {
  _dragRow = this;
  this.classList.add('dragging');
  if (e.dataTransfer) { e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', this.dataset.appid || ''); } catch(_) {} }
}
function rowAfterPoint(list, y) {
  var rows = [].slice.call(list.querySelectorAll('.app-row:not(.dragging)'));
  var closest = { offset: -Infinity, el: null };
  rows.forEach(function(r) {
    var box = r.getBoundingClientRect();
    var offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) closest = { offset: offset, el: r };
  });
  return closest.el;
}
function onRowDragOver(e) {
  e.preventDefault();
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
  if (!_dragRow) return;
  var list = document.getElementById('appsList');
  var after = rowAfterPoint(list, e.clientY);
  if (after == null) list.appendChild(_dragRow);
  else list.insertBefore(_dragRow, after);
}
function onRowDragEnd() {
  this.classList.remove('dragging');
  this.draggable = false;
  _dragRow = null;
  var ids = [].slice.call(document.querySelectorAll('#appsList .app-row')).map(function(r) { return r.dataset.appid; }).filter(Boolean);
  saveOrder(ids);
  renderApps();
}

// Save any in-flight typing in the local apps BEFORE we tear their windows
// down. Without this, toggling/reordering/removing an app mid-sentence (which
// rebuilds the iframes) would drop the last few seconds of unsaved text.
function flushOpenApps() {
  document.querySelectorAll('#appViews iframe.app-frame').forEach(function(ifr) {
    try {
      var w = ifr.contentWindow;
      if (w && typeof w.flushAndPersist === 'function') w.flushAndPersist();
    } catch (e) {}
  });
}

// Render the whole app list into the dock, top bar, windows, and settings.
function renderApps() {
  flushOpenApps();   // never lose in-flight typing when the windows rebuild
  var dock = document.getElementById('dock');
  var top = document.getElementById('topApps');
  var views = document.getElementById('appViews');
  var list = document.getElementById('appsList');
  dock.querySelectorAll('.app').forEach(function(el) { el.remove(); });
  top.innerHTML = '';
  views.innerHTML = '';
  list.innerHTML = '';

  orderedApps().forEach(function(app) {
    var hidden = !isVisible(app.id);

    var d = document.createElement('a');
    d.href = '#'; d.className = 'app' + (hidden ? ' hidden' : '');
    d.dataset.app = app.id; d.dataset.name = app.name;
    d.addEventListener('click', function(e) { e.preventDefault(); openApp(app.id); });
    d.addEventListener('contextmenu', function(e) { e.preventDefault(); showAppMenu(e, app.id); });
    d.innerHTML = '<div class="app-icon" style="background:' + gradOf(app) + ';">' + iconHtml(app, 26) + '</div>';
    dock.appendChild(d);

    var t = document.createElement('a');
    t.href = '#'; t.className = 'top-app' + (hidden ? ' hidden' : '');
    t.dataset.app = app.id; t.dataset.name = app.name;
    t.addEventListener('click', function(e) { e.preventDefault(); openApp(app.id); });
    t.addEventListener('contextmenu', function(e) { e.preventDefault(); showAppMenu(e, app.id); });
    t.innerHTML = '<div class="top-app-icon" style="background:' + gradOf(app) + ';">' + iconHtml(app, 12) + '</div>';
    top.appendChild(t);

    views.appendChild(buildView(app));
    list.appendChild(buildSettingsRow(app));
  });

  // keep the current app open across a re-render, if it still exists
  if (currentApp) {
    var v = document.getElementById('view-' + currentApp);
    if (v) {
      v.classList.add('active');
      document.querySelectorAll('[data-app="' + currentApp + '"]').forEach(function(a) { a.classList.add('active'); });
      document.getElementById('homeScreen').style.display = 'none';
    } else {
      currentApp = null;
    }
  }
  refreshDockEmpty();
}

// Show/hide an app without removing it.
function toggleAppVis(name, visible) {
  document.querySelectorAll('[data-app="' + name + '"]').forEach(function(el) {
    el.classList.toggle('hidden', !visible);
  });
  var cb = document.querySelector('input[data-appvis="' + name + '"]');
  if (cb) cb.checked = visible;
  if (!visible && currentApp === name) goHome();
  refreshDockEmpty();
  try { var a = JSON.parse(localStorage.getItem('qh-apps') || '{}'); a[name] = visible; localStorage.setItem('qh-apps', JSON.stringify(a)); } catch(e) {}
}

// Recolour app icons in place when the theme changes (no view/iframe rebuild).
function recolorAppIcons() {
  allApps().forEach(function(app) {
    var g = gradOf(app);
    document.querySelectorAll('[data-app="' + app.id + '"] .app-icon, [data-app="' + app.id + '"] .top-app-icon').forEach(function(el) { el.style.background = g; });
    var mini = document.querySelector('.app-mini-icon[data-appicon="' + app.id + '"]');
    if (mini) mini.style.background = g;
    var view = document.getElementById('view-' + app.id);
    if (view) { var bi = view.querySelector('.app-body-icon'); if (bi) bi.style.background = g; }
  });
}

// Common distraction sites — refused by Add App so they can't sneak onto the home screen.
var DISTRACTION_HOSTS = [
  'facebook.com', 'instagram.com', 'x.com', 'twitter.com', 'tiktok.com',
  'reddit.com', 'snapchat.com', 'pinterest.com', 'threads.net', 'linkedin.com',
  'youtube.com', 'netflix.com', 'hulu.com', 'disneyplus.com', 'hbomax.com',
  'twitch.tv', 'peacocktv.com', 'paramountplus.com', 'tumblr.com',
  'gmail.com', 'mail.google.com', 'mail.yahoo.com', 'outlook.com', 'outlook.live.com'
];
function isDistractionUrl(url) {
  try {
    var u = new URL(url);
    var host = u.hostname.toLowerCase().replace(/^www\./, '');
    return DISTRACTION_HOSTS.some(function (d) { return host === d || host.endsWith('.' + d); });
  } catch (e) { return false; }
}

// Add a user app (name + website + colour).
function addApp(name, url, c1, c2, icon, vb) {
  name = (name || '').trim();
  url = (url || '').trim();
  if (!name || !url) return false;
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  if (isDistractionUrl(url)) {
    if (window.qhConfirm) window.qhConfirm({
      title: 'That one’s a distraction',
      message: 'Quill Haven keeps social media, video sites and email off the home screen on purpose. Try a writing or research site instead.',
      confirmText: 'OK'
    });
    return false;
  }
  var id = 'app' + Math.random().toString(36).slice(2, 8);
  var app = { id:id, name:name, kind:'site', url:url, c1:c1, c2:c2 };
  if (icon) { app.icon = icon; app.vb = vb || '0 0 24 24'; }
  addons.push(app);
  saveAddons(addons);
  renderApps();
  return true;
}

// Remove a user app or a default add-on (built-ins can't be removed).
function removeApp(id) {
  if (isBuiltin(id)) return;
  var app = allApps().filter(function(a) { return a.id === id; })[0];
  var nm = app ? app.name : 'this app';
  showConfirm('Remove ' + nm + '?', 'It comes off your home screen. You can add it again later.', function() {
    if (currentApp === id) goHome();
    addons = addons.filter(function(a) { return a.id !== id; });
    saveAddons(addons);
    try { var m = JSON.parse(localStorage.getItem('qh-apps') || '{}'); delete m[id]; localStorage.setItem('qh-apps', JSON.stringify(m)); } catch(e) {}
    renderApps();
  });
}

// Small confirmation popup (used before removing an app)
// Uses the shared confirm dialog (shared/confirm.js) so there's one popup everywhere.
function showConfirm(title, msg, onYes) {
  if (window.qhConfirm) { window.qhConfirm({ title: title, message: msg, confirmText: 'Remove', danger: true, onConfirm: onYes }); return; }
  if (window.confirm(title + (msg ? '\n' + msg : ''))) onYes();
}

// ── Add-app form ──
// Colour choices for a new app — theme-aware (pastels by default, muted browns
// in Wood, cool slates/blues in Slate). About a dozen options each.
var PICKER_COLORS = {
  purple: [
    ['#f5d0e5','#ebbad0'], ['#f1c6d4','#e4adbd'], ['#f7c1c1','#ec9f9f'], ['#f9c9b0','#eeb08c'],
    ['#f0cbbf','#e3aa9c'], ['#f3d9b8','#e6c191'], ['#f3e3b0','#e6cf8e'], ['#f6e6a8','#e8d27e'],
    ['#e7edba','#d2da98'], ['#d6ecb0','#bcd98e'], ['#bfe3c4','#9ed0a8'], ['#aee6cf','#8fd6b6'],
    ['#bde6df','#9cd3ca'], ['#a9dbe9','#88c4d8'], ['#bcd6f0','#9ec0e6'], ['#b0c4f0','#90a8e4'],
    ['#c4caef','#a8b1e0'], ['#cdbfe6','#b6a3da'], ['#d9bff0','#c29fe2'], ['#e8c9ef','#d4a9e0']
  ],
  wood: [
    ['#d6c4ac','#bda584'], ['#cda883','#b88e63'], ['#cbb083','#b39563'], ['#cbb59b','#b09a7d'],
    ['#c79a72','#b07f55'], ['#c3ad95','#a68d72'], ['#c2a596','#a8846f'], ['#bba488','#9e8568'],
    ['#b89a78','#9c7e5c'], ['#b3a294','#968172'], ['#c8bbab','#ab9c89'], ['#bfb3a3','#a2937f'],
    ['#c9bcb2','#ac9c90'], ['#bdb0a6','#9f9085'], ['#b6b083','#988f5f'], ['#a9b58f','#8a9970'],
    ['#bdc0b2','#a0a48f'], ['#b6c0ba','#98a69e'], ['#c2bdb4','#a59f94'], ['#cabfb8','#ada199']
  ],
  grey: [
    ['#cfd6df','#b3bdc9'], ['#c3cdd9','#a7b4c3'], ['#b7c4d4','#9aabc0'], ['#a9c0d8','#88a6c4'],
    ['#c0d4ee','#9fbce4'], ['#b0bcd0','#90a0bb'], ['#aec6e6','#8facd6'], ['#9fb8cc','#7f9cb6'],
    ['#aab6c4','#8b9bac'], ['#b4c4cf','#96abb8'], ['#b6c2d0','#98a8ba'], ['#a6c2c4','#86aaad'],
    ['#bccac8','#9eb1ad'], ['#bfc8c2','#a1ada6'], ['#c0c4c2','#a2a8a5'], ['#bcc0c9','#9ea4b1'],
    ['#c2c0bb','#a4a199'], ['#c8c6d2','#aaa8bc'], ['#ccccd5','#aeaebc'], ['#b9c6cd','#9bb0bb']
  ]
};
PICKER_COLORS.dark = PICKER_COLORS.purple;   // Dark shares the pastel set
function pickerColors() { return PICKER_COLORS[currentTheme] || PICKER_COLORS.purple; }
function defaultColor() { var l = pickerColors(); return l[Math.min(3, l.length - 1)]; }
var pickedColor = defaultColor();

// Icon choices for a user-added app (or a letter if none picked).
var ICON_CHOICES = [
  { id:'quill',    vb:'0 0 24 24', paths:'<path d="M20 4 C12 5 7 10 6 17 L12 17 C18 12 20 8 20 4 Z"/><path d="M20 4 L3 21"/><path d="M10 12 H15"/>' },
  { id:'book',     vb:'0 0 24 24', paths:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>' },
  { id:'heart',    vb:'0 0 24 24', paths:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1.1-1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>' },
  { id:'star',     vb:'0 0 24 24', paths:'<path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>' },
  { id:'pencil',   vb:'0 0 24 24', paths:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>' },
  { id:'clover',   vb:'0 0 24 24', paths:'<g transform="translate(12 10.6)"><path d="M0 0 C -1 -1.6 -3.4 -2.4 -3.4 -4.3 C -3.4 -6 -1.4 -6.6 0 -5 C 1.4 -6.6 3.4 -6 3.4 -4.3 C 3.4 -2.4 1 -1.6 0 0 Z"/><path transform="rotate(120)" d="M0 0 C -1 -1.6 -3.4 -2.4 -3.4 -4.3 C -3.4 -6 -1.4 -6.6 0 -5 C 1.4 -6.6 3.4 -6 3.4 -4.3 C 3.4 -2.4 1 -1.6 0 0 Z"/><path transform="rotate(240)" d="M0 0 C -1 -1.6 -3.4 -2.4 -3.4 -4.3 C -3.4 -6 -1.4 -6.6 0 -5 C 1.4 -6.6 3.4 -6 3.4 -4.3 C 3.4 -2.4 1 -1.6 0 0 Z"/></g><path d="M12 11 C 12.5 14.5 11.5 18.5 12.8 21.6"/>' },
  { id:'notebook', vb:'0 0 24 24', paths:'<rect x="7" y="3" width="13" height="18" rx="1.5"/><path d="M4.5 6H9"/><path d="M4.5 9.5H9"/><path d="M4.5 13H9"/><path d="M4.5 16.5H9"/><path d="M12 8H17"/><path d="M12 11.5H17"/><path d="M12 15H15"/>' }
];
var pickedIcon = null;

function renderColorSwatches() {
  var box = document.getElementById('addAppColors');
  if (!box) return;
  box.classList.add('picker');
  var list = pickerColors();
  if (list.indexOf(pickedColor) === -1) pickedColor = defaultColor();
  box.innerHTML = '';

  // The pill: shows the chosen colour; tap to open the dropdown
  var pill = document.createElement('button');
  pill.type = 'button';
  pill.className = 'picker-pill';
  pill.innerHTML = '<span class="pill-label">Colour</span>' +
    '<span class="pill-swatch" style="background:linear-gradient(145deg,' + pickedColor[0] + ',' + pickedColor[1] + ')"></span>' +
    '<svg class="pill-chev" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
  pill.addEventListener('click', function(e) { e.stopPropagation(); closeIconMenu(); box.classList.toggle('open'); });
  box.appendChild(pill);

  // The dropdown grid of swatches
  var menu = document.createElement('div');
  menu.className = 'picker-menu';
  list.forEach(function(pair) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'color-swatch' + (pair === pickedColor ? ' active' : '');
    b.style.background = 'linear-gradient(145deg,' + pair[0] + ',' + pair[1] + ')';
    b.addEventListener('click', function(e) { e.stopPropagation(); pickedColor = pair; box.classList.remove('open'); renderColorSwatches(); });
    menu.appendChild(b);
  });
  box.appendChild(menu);
}
function closeColorMenu() { var b = document.getElementById('addAppColors'); if (b) b.classList.remove('open'); }
function closeIconMenu() { var b = document.getElementById('addAppIcons'); if (b) b.classList.remove('open'); }

// When no picture is picked, the app shows its own first letter — preview it live.
function currentLetter() {
  var el = document.getElementById('addAppName');
  var n = el ? el.value.trim() : '';
  return n ? n.charAt(0).toUpperCase() : '';
}
function letterHtml(px) {
  var l = currentLetter();
  return '<span class="pill-letter" style="font-size:' + Math.round(px * 0.95) + 'px;">' + (l ? esc(l) : '–') + '</span>';
}
function iconSvg(ch, px) {
  return '<svg width="' + px + '" height="' + px + '" viewBox="' + ch.vb + '" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + ch.paths + '</svg>';
}
function renderIconChoices() {
  var box = document.getElementById('addAppIcons');
  if (!box) return;
  box.classList.add('picker');
  box.innerHTML = '';

  // The pill: shows the chosen icon (or the letter A); tap to open the dropdown
  var pill = document.createElement('button');
  pill.type = 'button';
  pill.className = 'picker-pill';
  pill.innerHTML = '<span class="pill-label">Icon</span>' +
    '<span class="pill-icon">' + (pickedIcon ? iconSvg(pickedIcon, 18) : letterHtml(18)) + '</span>' +
    '<svg class="pill-chev" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
  pill.addEventListener('click', function(e) { e.stopPropagation(); closeColorMenu(); box.classList.toggle('open'); });
  box.appendChild(pill);

  // The dropdown grid of icon choices
  var menu = document.createElement('div');
  menu.className = 'picker-menu icons';

  var none = document.createElement('button');
  none.type = 'button';
  none.className = 'icon-choice' + (pickedIcon === null ? ' active' : '');
  none.title = "Use the app's first letter";
  none.innerHTML = letterHtml(16);
  none.addEventListener('click', function(e) { e.stopPropagation(); pickedIcon = null; box.classList.remove('open'); renderIconChoices(); });
  menu.appendChild(none);

  ICON_CHOICES.forEach(function(ch) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'icon-choice' + (pickedIcon === ch ? ' active' : '');
    b.innerHTML = iconSvg(ch, 16);
    b.addEventListener('click', function(e) { e.stopPropagation(); pickedIcon = ch; box.classList.remove('open'); renderIconChoices(); });
    menu.appendChild(b);
  });
  box.appendChild(menu);
}

function openAddForm() {
  pickedColor = defaultColor();          // match the current theme
  renderColorSwatches();
  document.getElementById('addAppForm').classList.add('open');
  document.getElementById('addAppBtn').style.display = 'none';
  document.getElementById('addAppName').focus();
}
function closeAddForm() {
  document.getElementById('addAppForm').classList.remove('open');
  document.getElementById('addAppBtn').style.display = '';
  document.getElementById('addAppName').value = '';
  document.getElementById('addAppUrl').value = '';
  closeColorMenu();
  pickedIcon = null;
  renderIconChoices();
}
// Click anywhere else closes the open colour dropdown
document.addEventListener('click', closeColorMenu);

document.getElementById('addAppBtn').addEventListener('click', openAddForm);
document.getElementById('addAppCancel').addEventListener('click', closeAddForm);
// As you type the app name, the "letter" preview updates to your first letter
document.getElementById('addAppName').addEventListener('input', function() {
  document.querySelectorAll('#addAppIcons .pill-letter').forEach(function(el) {
    el.textContent = currentLetter() || '–';
  });
});
document.getElementById('addAppSave').addEventListener('click', function() {
  var ic = pickedIcon ? pickedIcon.paths : null;
  var vb = pickedIcon ? pickedIcon.vb : null;
  var ok = addApp(document.getElementById('addAppName').value, document.getElementById('addAppUrl').value, pickedColor[0], pickedColor[1], ic, vb);
  if (ok) closeAddForm();
});

// First render
renderApps();
renderColorSwatches();
renderIconChoices();

// ── Settings ──
function toggleSettings() {
  var open = document.getElementById('settingsOverlay').classList.toggle('open');
  if (open) { updateStorage(); syncBgRow(); syncDriveRow(); buildTzSelect(); }
}
document.addEventListener('keydown', function(e) { if (e.key === 'Escape') document.getElementById('settingsOverlay').classList.remove('open'); });

// ── Storage indicator ──
// Shows how much of this device's writing storage is used (saved docs, settings).
function updateStorage() {
  var fill = document.getElementById('storageFill');
  var text = document.getElementById('storageText');
  if (!fill || !text) return;
  function fmt(bytes) {
    if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + ' GB';
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(0) + ' MB';
    return Math.max(1, Math.round(bytes / 1024)) + ' KB';
  }
  if (navigator.storage && navigator.storage.estimate) {
    navigator.storage.estimate().then(function(est) {
      var used = est.usage || 0;
      var quota = est.quota || 0;
      var pct = quota ? Math.min(100, Math.max(2, Math.round(used / quota * 100))) : 2;
      fill.style.width = pct + '%';
      text.textContent = quota ? (fmt(used) + ' used of ' + fmt(quota)) : (fmt(used) + ' used');
    }).catch(function() { fill.style.width = '2%'; text.textContent = 'Plenty of room'; });
  } else {
    fill.style.width = '2%';
    text.textContent = 'Plenty of room';
  }
}

// ── Google Drive ──
// Setup is in two parts:
//   (1) Owner pastes a Google OAuth Client ID once (stored in qh-drive-client).
//       Get one from console.cloud.google.com -> Create OAuth client (Web).
//   (2) User clicks "Sign in with Google" — token cached in memory + sessionStorage.
// Without a Client ID the framework stays inactive but visible. Other code calls
// QHDrive.requireConnection() to block uploads until the chain is set up.
window.QHDrive = (function () {
  var GIS_URL = 'https://accounts.google.com/gsi/client';
  var SCOPE = 'https://www.googleapis.com/auth/drive.file';
  var tokenClient = null, gisReady = false, gisLoading = null;
  function clientId() { try { return localStorage.getItem('qh-drive-client') || ''; } catch(e) { return ''; } }
  function setClientId(v) { try { v ? localStorage.setItem('qh-drive-client', v) : localStorage.removeItem('qh-drive-client'); } catch(e) {} }
  function getToken() { try { var raw = sessionStorage.getItem('qh-drive-token'); return raw ? JSON.parse(raw) : null; } catch(e) { return null; } }
  function setToken(t) { try { t ? sessionStorage.setItem('qh-drive-token', JSON.stringify(t)) : sessionStorage.removeItem('qh-drive-token'); } catch(e) {} }
  function getEmail() { try { return localStorage.getItem('qh-drive-email') || ''; } catch(e) { return ''; } }
  function setEmail(v) { try { v ? localStorage.setItem('qh-drive-email', v) : localStorage.removeItem('qh-drive-email'); } catch(e) {} }
  function isSignedIn() { var t = getToken(); return !!(t && t.access_token && t.expires_at && t.expires_at > Date.now()); }
  function loadGIS() {
    if (gisReady) return Promise.resolve();
    if (gisLoading) return gisLoading;
    gisLoading = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = GIS_URL; s.async = true; s.defer = true;
      s.onload = function () { gisReady = true; resolve(); };
      s.onerror = function () { reject(new Error('Couldn\'t load Google sign-in. Check your internet.')); };
      document.head.appendChild(s);
    });
    return gisLoading;
  }
  function ensureTokenClient() {
    var cid = clientId();
    if (!cid) return Promise.reject(new Error('Paste your Google OAuth Client ID in Settings first.'));
    return loadGIS().then(function () {
      if (tokenClient) return tokenClient;
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: cid, scope: SCOPE, callback: function () {}
      });
      return tokenClient;
    });
  }
  function signIn() {
    return ensureTokenClient().then(function (tc) {
      return new Promise(function (resolve, reject) {
        tc.callback = function (resp) {
          if (resp.error) { reject(resp); return; }
          var t = { access_token: resp.access_token, expires_at: Date.now() + (resp.expires_in - 60) * 1000 };
          setToken(t);
          // Fetch the user's email for display (drive.file scope doesn't include profile,
          // so use the userinfo endpoint with the access token)
          fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: 'Bearer ' + t.access_token } })
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (info) { if (info && info.email) setEmail(info.email); resolve(t); })
            .catch(function () { resolve(t); });
        };
        tc.requestAccessToken({ prompt: getEmail() ? '' : 'consent' });
      });
    });
  }
  function signOut() {
    var t = getToken();
    if (t && t.access_token && window.google && window.google.accounts && window.google.accounts.oauth2) {
      try { window.google.accounts.oauth2.revoke(t.access_token, function () {}); } catch (e) {}
    }
    setToken(null); setEmail('');
  }
  function uploadFile(name, blob, mimeType) {
    if (!isSignedIn()) return signIn().then(function () { return uploadFile(name, blob, mimeType); });
    var t = getToken();
    var metadata = { name: name, mimeType: mimeType || blob.type || 'application/octet-stream' };
    var form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', blob);
    return fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
      method: 'POST', headers: { Authorization: 'Bearer ' + t.access_token }, body: form
    }).then(function (r) {
      if (r.status === 401) { setToken(null); throw new Error('Drive session expired — sign in again.'); }
      if (!r.ok) return r.text().then(function (txt) { throw new Error('Drive upload failed: ' + (txt || r.status)); });
      return r.json();
    });
  }
  return {
    hasClientId: function () { return !!clientId(); },
    clientId: clientId, setClientId: setClientId,
    isSignedIn: isSignedIn, signIn: signIn, signOut: signOut,
    email: getEmail, uploadFile: uploadFile
  };
})();
function driveState() {
  if (!window.QHDrive) return 'unconnected';
  if (!QHDrive.hasClientId()) return 'no-client-id';
  if (!QHDrive.isSignedIn()) return 'signed-out';
  return 'connected';
}
function syncDriveRow() {
  var sub = document.getElementById('driveSub');
  if (!sub) return;
  var st = driveState();
  if (st === 'connected') sub.textContent = 'Connected as ' + (QHDrive.email() || 'Google') + ' — back up your writing';
  else if (st === 'signed-out') sub.textContent = 'Ready — tap to sign in to Google';
  else sub.textContent = 'Not connected — back up your writing';
  // Auto-backup row is only meaningful when connected
  var ab = document.getElementById('autoBackupRow');
  if (ab) {
    ab.hidden = st !== 'connected';
    var t = document.getElementById('autoBackupToggle');
    if (t) t.checked = autoBackupEnabled();
    var s = document.getElementById('autoBackupSub');
    if (s) {
      var last = lastAutoBackupAt();
      s.textContent = autoBackupEnabled()
        ? ('On — every 30 minutes' + (last ? ' · last: ' + new Date(last).toLocaleString() : ''))
        : 'Off — turn on for a silent backup every 30 min';
    }
  }
}
// ── Auto-backup to Drive (silent every 30 min when signed in) ──
var AUTO_BACKUP_KEY = 'qh-drive-autobackup';
var LAST_BACKUP_KEY = 'qh-drive-autobackup-last';
var AUTO_BACKUP_MS = 30 * 60 * 1000;
function autoBackupEnabled() { try { return localStorage.getItem(AUTO_BACKUP_KEY) === '1'; } catch(e) { return false; } }
function lastAutoBackupAt() { try { return parseInt(localStorage.getItem(LAST_BACKUP_KEY), 10) || 0; } catch(e) { return 0; } }
function setAutoBackup(v) {
  try { localStorage.setItem(AUTO_BACKUP_KEY, v ? '1' : '0'); } catch(e) {}
  syncDriveRow();
  if (v) scheduleAutoBackup();
  else if (autoBackupTimer) { clearTimeout(autoBackupTimer); autoBackupTimer = null; }
}
var autoBackupTimer = null;
function scheduleAutoBackup() {
  if (autoBackupTimer) clearTimeout(autoBackupTimer);
  if (!autoBackupEnabled() || !window.QHDrive || !QHDrive.isSignedIn()) return;
  var since = Date.now() - lastAutoBackupAt();
  var wait = Math.max(60 * 1000, AUTO_BACKUP_MS - since); // at least 1 minute after load
  autoBackupTimer = setTimeout(runAutoBackup, wait);
}
function buildAutoBackupBlob() {
  // The lean version of the .zip Marie's manual backup makes: just the raw
  // restorable JSON. Manuscripts can be regenerated from it on restore.
  var payload = { format: 'quill-haven-backup', version: 1, exportedAt: new Date().toISOString(), auto: true };
  try { var w = JSON.parse(localStorage.getItem('qh-writing2') || 'null'); if (w) payload.writing = w; } catch(e) {}
  try { var f = JSON.parse(localStorage.getItem('qh-files') || 'null'); if (f) payload.files = f; } catch(e) {}
  return new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
}
function runAutoBackup() {
  if (!autoBackupEnabled() || !window.QHDrive || !QHDrive.isSignedIn()) { scheduleAutoBackup(); return; }
  var when = new Date();
  var stamp = when.getFullYear() + '-' + String(when.getMonth() + 1).padStart(2, '0') + '-' + String(when.getDate()).padStart(2, '0') + '_' + String(when.getHours()).padStart(2, '0') + String(when.getMinutes()).padStart(2, '0');
  var name = 'quill-haven-autobackup-' + stamp + '.json';
  QHDrive.uploadFile(name, buildAutoBackupBlob(), 'application/json').then(function () {
    try { localStorage.setItem(LAST_BACKUP_KEY, String(Date.now())); } catch(e) {}
    syncDriveRow();
  }).catch(function () {
    // Silent failure — next tick will retry. Don't pop a dialog mid-typing.
  }).then(function () { scheduleAutoBackup(); });
}
// Kick off the timer on page load if conditions are met
setTimeout(scheduleAutoBackup, 2000);
function openDriveConnect() {
  if (!window.qhConfirm) return;
  var st = driveState();
  if (st === 'no-client-id') {
    var cid = window.prompt('Paste your Google OAuth Client ID (looks like 1234-abcd.apps.googleusercontent.com).\n\nDon\'t have one? Open docs/DRIVE_SETUP.md for the 10-minute setup.', '');
    if (cid && cid.trim()) { QHDrive.setClientId(cid.trim()); syncDriveRow(); openDriveConnect(); }
    return;
  }
  if (st === 'signed-out') {
    QHDrive.signIn().then(syncDriveRow).catch(function (err) {
      window.qhConfirm({ title: 'Sign-in didn\'t work', message: String(err && (err.message || err.error_description) || err), confirmText: 'OK' });
    });
    return;
  }
  // Connected — offer Sign out / Disconnect (forget Client ID too)
  window.qhConfirm({
    title: 'Google Drive connected', message: 'Signed in as ' + (QHDrive.email() || 'your Google account') + '. Sign out keeps the Client ID; Disconnect forgets it too.',
    confirmText: 'Sign out', cancelText: 'Close',
    onConfirm: function () { QHDrive.signOut(); syncDriveRow(); }
  });
}

// ── Backup restore ──
// Reads a quill-haven-backup .json or pulls the .json out of a .zip we exported,
// confirms before REPLACING everything, then reloads.
function openRestoreBackup() {
  var inp = document.getElementById('restoreInput'); if (inp) inp.click();
}
function _zipFindBackupJson(buf) {
  var bytes = new Uint8Array(buf);
  var view = new DataView(buf);
  // Find EOCD signature 0x06054b50 by scanning backwards (zip comment may exist)
  var end = -1;
  var start = Math.max(0, bytes.length - 65557);
  for (var i = bytes.length - 22; i >= start; i--) {
    if (view.getUint32(i, true) === 0x06054b50) { end = i; break; }
  }
  if (end < 0) throw new Error('That doesn’t look like a .zip file.');
  var entries = view.getUint16(end + 10, true);
  var cdOffset = view.getUint32(end + 16, true);
  var p = cdOffset;
  for (var k = 0; k < entries; k++) {
    if (view.getUint32(p, true) !== 0x02014b50) throw new Error('Couldn’t read the .zip directory.');
    var method = view.getUint16(p + 10, true);
    var size = view.getUint32(p + 20, true);
    var nameLen = view.getUint16(p + 28, true);
    var extraLen = view.getUint16(p + 30, true);
    var commLen = view.getUint16(p + 32, true);
    var lhOff = view.getUint32(p + 42, true);
    var name = new TextDecoder().decode(bytes.slice(p + 46, p + 46 + nameLen));
    if (name === 'quill-haven-backup.json') {
      if (method !== 0) throw new Error('The .zip is compressed — please use the .json directly.');
      var lhNameLen = view.getUint16(lhOff + 26, true);
      var lhExtraLen = view.getUint16(lhOff + 28, true);
      var dataStart = lhOff + 30 + lhNameLen + lhExtraLen;
      return new TextDecoder().decode(bytes.slice(dataStart, dataStart + size));
    }
    p += 46 + nameLen + extraLen + commLen;
  }
  throw new Error('No quill-haven-backup.json inside that .zip — was it made by Quill Haven?');
}
// Apply a restore as all-or-nothing: snapshot both keys first, and if either
// write fails (e.g. no room), put the originals back so we never leave a
// half-applied backup (new writing + old files, or vice versa).
function _applyRestore(parsed) {
  var oldW = localStorage.getItem('qh-writing2');
  var oldF = localStorage.getItem('qh-files');
  try {
    if (parsed.writing) localStorage.setItem('qh-writing2', JSON.stringify(parsed.writing));
    if (parsed.files) localStorage.setItem('qh-files', JSON.stringify(parsed.files));
    return true;
  } catch (e) {
    try { if (oldW === null) localStorage.removeItem('qh-writing2'); else localStorage.setItem('qh-writing2', oldW); } catch (_) {}
    try { if (oldF === null) localStorage.removeItem('qh-files'); else localStorage.setItem('qh-files', oldF); } catch (_) {}
    if (window.qhConfirm) window.qhConfirm({
      title: 'Backup didn’t fit',
      message: 'There wasn’t enough room to load that backup, so nothing was changed. Try deleting some pictures first, then restore again.',
      confirmText: 'OK',
      noCancel: true
    });
    return false;
  }
}
(function wireRestore() {
  var inp = document.getElementById('restoreInput'); if (!inp) return;
  inp.addEventListener('change', function () {
    var file = inp.files && inp.files[0]; inp.value = '';
    if (!file) return;
    var rd = new FileReader();
    var isZip = /\.zip$/i.test(file.name) || file.type === 'application/zip';
    rd.onload = function () {
      var parsed;
      try {
        var text = isZip ? _zipFindBackupJson(rd.result) : rd.result;
        parsed = JSON.parse(text);
      } catch (e) {
        return window.qhConfirm({ title: 'Couldn’t read that file', message: String(e && e.message || e), confirmText: 'OK' });
      }
      if (!parsed || parsed.format !== 'quill-haven-backup') {
        return window.qhConfirm({ title: 'Not a Quill Haven backup', message: 'That file doesn’t look like a backup made by Quill Haven (no "quill-haven-backup" marker inside).', confirmText: 'OK' });
      }
      var bits = [];
      var w = parsed.writing || {};
      if (Array.isArray(w.projects)) bits.push(w.projects.length + ' project' + (w.projects.length === 1 ? '' : 's'));
      if (Array.isArray(w.notes)) bits.push(w.notes.length + ' note' + (w.notes.length === 1 ? '' : 's'));
      var f = parsed.files || {};
      if (Array.isArray(f.documents)) bits.push(f.documents.length + ' document' + (f.documents.length === 1 ? '' : 's'));
      if (Array.isArray(f.pictures)) bits.push(f.pictures.length + ' picture' + (f.pictures.length === 1 ? '' : 's'));
      var when = parsed.exportedAt ? new Date(parsed.exportedAt).toLocaleString() : 'unknown date';
      window.qhConfirm({
        title: 'Replace everything with this backup?',
        message: 'Backup from ' + when + ' — ' + (bits.join(', ') || 'no items') + '. This REPLACES all your current writing and files. It can’t be undone.',
        confirmText: 'Replace everything',
        danger: true,
        onConfirm: function () {
          if (!_applyRestore(parsed)) return;   // failed → originals kept, message already shown
          window.qhConfirm({
            title: 'Backup loaded',
            message: 'The app needs to reload to show the restored writing.',
            confirmText: 'Reload now',
            noCancel: true,
            onConfirm: function () { location.reload(); }
          });
        }
      });
    };
    if (isZip) rd.readAsArrayBuffer(file); else rd.readAsText(file);
  });
})();

// ── Display mode ──
function setMode(mode) {
  document.body.classList.toggle('top-mode', mode === 'top');
  document.querySelectorAll('.mode-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.mode === mode);
  });
  try { localStorage.setItem('qh-mode', mode); } catch(e) {}
}

// ── Clipboard ──
var clipHist = [];
document.addEventListener('copy', function() {
  var t = window.getSelection().toString().trim();
  if (t) { clipHist = clipHist.filter(function(i){return i.t!==t;}); clipHist.unshift({t:t,d:new Date()}); if(clipHist.length>10)clipHist.pop(); renderClip(); saveClip(); }
});
function renderClip() {
  var c = document.getElementById('clipboardList');
  if (!clipHist.length) { c.innerHTML = '<div class="clipboard-empty">No items yet<br><span style="font-size:9px;opacity:0.7;">Copy text in any app to see it here</span></div>'; return; }
  c.innerHTML = clipHist.map(function(i, idx) {
    var p = i.t.length > 120 ? i.t.substring(0,120) + '...' : i.t;
    var s = Math.floor((new Date()-i.d)/1000); var a = s<60?'now':s<3600?Math.floor(s/60)+'m':Math.floor(s/3600)+'h';
    return '<div class="clipboard-item" onclick="copyClip('+idx+')"><span class="clipboard-text">'+esc(p)+'</span><span class="clipboard-time">'+a+'</span></div>';
  }).join('');
}
function copyClip(idx) {
  if (clipHist[idx]) {
    navigator.clipboard.writeText(clipHist[idx].t);
    var toast = document.getElementById('clipToast');
    toast.classList.add('show');
    setTimeout(function() { toast.classList.remove('show'); }, 1500);
  }
}
function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/'/g,'&#39;').replace(/"/g,'&quot;'); }
function saveClip() { try { localStorage.setItem('qh-clip', JSON.stringify(clipHist.map(function(i){ return {t:i.t, d:(i.d instanceof Date ? i.d.getTime() : i.d)}; }))); } catch(e) {} }

renderClip();

// ── Appearance: theme skin + night light + brightness ──
// A theme re-colours the whole UI (via CSS variables).
// Night Light is separate: a warm filter you switch on/off.
var nightOn = false;
var hueDeg = 0;
var THEMES = ['purple', 'wood', 'grey', 'dark'];

function applyFilter() {
  var slider = document.querySelector('.brightness-slider');
  var b = slider ? slider.value : 100;
  var f = 'brightness(' + (b / 100) + ')';
  if ((currentTheme === 'purple' || currentTheme === 'dark') && hueDeg) f += ' hue-rotate(' + hueDeg + 'deg)';
  if (nightOn) f += ' sepia(0.35) saturate(0.9) brightness(0.96)';
  document.body.style.filter = f;
}

function setHue(v) {
  hueDeg = parseInt(v, 10) || 0;
  applyFilter();
  try { localStorage.setItem('qh-hue', hueDeg); } catch(e) {}
}

function setBrightness(val) { applyFilter(); try { localStorage.setItem('qh-brightness', val); } catch(e) {} }

function setTheme(name) {
  if (THEMES.indexOf(name) < 0) name = 'purple';
  document.body.classList.remove('theme-wood', 'theme-grey', 'theme-dark');
  if (name !== 'purple') document.body.classList.add('theme-' + name);
  currentTheme = name;
  recolorAppIcons();   // recolour app icons in place (no view/iframe rebuild)
  renderColorSwatches();   // keep the Add-app colour choices matching the theme
  document.querySelectorAll('.theme-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.theme === name);
  });
  var hs = document.getElementById('hueSlider');
  if (hs) hs.classList.toggle('show', name === 'purple' || name === 'dark');  // hue slider for the colour + dark themes
  applyFilter();
  try { localStorage.setItem('qh-theme', name); } catch(e) {}
}

function setNight(on) {
  nightOn = !!on;
  var t = document.getElementById('nightToggle');
  if (t) t.checked = nightOn;
  applyFilter();
  try { localStorage.setItem('qh-night', nightOn ? '1' : '0'); } catch(e) {}
}

// Restore saved settings on load
(function() {
  var savedTheme=null, savedNight=null, savedBright=null, savedMode=null, savedClip=null, savedHue=null;
  try {
    savedTheme  = localStorage.getItem('qh-theme');
    savedNight  = localStorage.getItem('qh-night');
    savedBright = localStorage.getItem('qh-brightness');
    savedMode   = localStorage.getItem('qh-mode');
    savedClip   = localStorage.getItem('qh-clip');
    savedHue    = localStorage.getItem('qh-hue');
  } catch(e) {}

  // set the sliders first so applyFilter reads the right values
  if (savedBright !== null) {
    var sl = document.querySelector('.brightness-slider');
    if (sl) sl.value = savedBright;
  }
  if (savedHue !== null) {
    hueDeg = parseInt(savedHue, 10) || 0;
    var hsl = document.getElementById('hueSlider');
    if (hsl) hsl.value = hueDeg;
  }

  setTheme(savedTheme || 'purple');
  setNight(savedNight === '1');

  if (savedMode) setMode(savedMode);

  if (savedClip) {
    try {
      var c = JSON.parse(savedClip);
      if (c && c.length) { clipHist = c; renderClip(); }
    } catch(e) {}
  }
})();

// ── Update check ──
var LOCAL_VERSION = '4.1';
var LOCAL_EMOJI = '📝';

// Set the footer version + emoji dynamically so it always matches the code
(function() {
  var f = document.querySelector('.settings-footer');
  if (f) f.textContent = 'Quill Haven v' + LOCAL_VERSION + ' ' + LOCAL_EMOJI;
})();

function checkForUpdate() {
  fetch('https://raw.githubusercontent.com/stjohnbuilds/quill-haven/main/version.json', { cache: 'no-store' })
    .then(function(r) { return r.json(); })
    .then(function(d) {
      if (d.version && d.version !== LOCAL_VERSION) {
        var btn = document.getElementById('updateBtn');
        btn.innerHTML = '<span class="update-dot"></span> Update to v' + esc(d.version) + ' ' + (d.emoji || '');
        btn.classList.add('show');
      }
    })
    .catch(function() {});
}
function doUpdate() {
  if (!navigator.onLine) {
    if (window.qhConfirm) window.qhConfirm({
      title: 'Need Wi-Fi',
      message: 'Connect to Wi-Fi, then try the update again.',
      confirmText: 'OK', noCancel: true
    });
    return;
  }
  var btn = document.getElementById('updateBtn');
  btn.textContent = 'Updating…';
  btn.style.pointerEvents = 'none';
  var p1 = window.caches ? caches.keys().then(function(ks) {
    return Promise.all(ks.map(function(k) { return caches.delete(k); }));
  }) : Promise.resolve();
  var p2 = navigator.serviceWorker ? navigator.serviceWorker.getRegistrations().then(function(regs) {
    return Promise.all(regs.map(function(r) { return r.unregister(); }));
  }) : Promise.resolve();
  Promise.all([p1, p2]).then(function() {
    window.location.href = window.location.pathname + '?v=' + Date.now();
  }).catch(function() {
    window.location.href = window.location.pathname + '?v=' + Date.now();
  });
}
setTimeout(checkForUpdate, 3000);

// ── Power / Restart / Sleep / Exit-to-desktop ──
// These call the tiny local helper that setup.sh installs on the device
// (a web page can't power a computer off by itself). Off the device (preview /
// plain website) the helper isn't there, so we say so honestly.
var QH_HELPER = 'http://127.0.0.1:8137';
function qhSystem(action) {
  var done = false;
  function fail() {
    if (done) return; done = true;
    if (window.qhConfirm) window.qhConfirm({
      title: 'Only on the Quill Haven laptop',
      message: 'Power, restart, sleep and exit work on the installed device — not in the preview or plain website.',
      confirmText: 'OK', noCancel: true
    });
  }
  var t = setTimeout(fail, 1500);   // helper not answering (no device) → say so, don't hang
  fetch(QH_HELPER + '/' + action, { method: 'POST', mode: 'cors' })
    .then(function() { done = true; clearTimeout(t); })
    .catch(function() { clearTimeout(t); fail(); });
}
function powerAction(action, label, danger) {
  hidePowerMenu();
  if (action === 'poweroff' || action === 'reboot') {
    window.qhConfirm({ title: label + '?', confirmText: label, danger: !!danger, onConfirm: function() { qhSystem(action); } });
  } else {
    qhSystem(action);
  }
}
var _powerMenu = null;
function hidePowerMenu() {
  if (_powerMenu) { _powerMenu.remove(); _powerMenu = null; document.removeEventListener('click', hidePowerMenu); }
}
function togglePowerMenu(e) {
  if (e) e.stopPropagation();
  if (_powerMenu) { hidePowerMenu(); return; }
  var m = document.createElement('div');
  m.className = 'power-menu';
  // Exit-to-desktop deliberately removed — the whole point is "no escape hatch."
  // (Use the cog → "Open terminal" or the recovery escape if you actually need out.)
  m.innerHTML =
      '<button type="button" data-act="sleep">Sleep</button>'
    + '<button type="button" data-act="reboot">Restart</button>'
    + '<button type="button" data-act="poweroff" class="danger">Power off</button>';
  m.querySelector('[data-act="sleep"]').addEventListener('click', function() { powerAction('sleep', 'Sleep'); });
  m.querySelector('[data-act="reboot"]').addEventListener('click', function() { powerAction('reboot', 'Restart', true); });
  m.querySelector('[data-act="poweroff"]').addEventListener('click', function() { powerAction('poweroff', 'Power off', true); });
  document.body.appendChild(m);
  _powerMenu = m;
  setTimeout(function() { document.addEventListener('click', hidePowerMenu); }, 0);
}
