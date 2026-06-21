// ── Boot splash ──
(function() {
  var typeEl = document.getElementById('bootType');
  var full = 'Your writing sanctuary';
  // #frozen holds the final composed frame (for previewing the design)
  if (location.hash === '#frozen') {
    if (typeEl) typeEl.textContent = full;
    var f = document.querySelector('.boot-loader-fill'); if (f) { f.style.animation = 'none'; f.style.width = '100%'; }
    var t = document.querySelector('.boot-text'); if (t) { t.style.animation = 'none'; t.style.opacity = '1'; }
    var q = document.querySelector('.boot-quill'); if (q) { q.style.animation = 'none'; q.style.opacity = '1'; q.style.transform = 'none'; }
    var g = document.querySelector('.boot-tagline'); if (g) { g.style.animation = 'none'; g.style.opacity = '1'; }
    return;
  }
  var i = 0;
  setTimeout(function startTyping() {
    var iv = setInterval(function() {
      i++;
      if (typeEl) typeEl.textContent = full.slice(0, i);
      if (i >= full.length) clearInterval(iv);
    }, 62);
  }, 2700);
  setTimeout(function() {
    var splash = document.getElementById('bootSplash');
    if (splash) {
      splash.classList.add('fade-out');
      setTimeout(function() { splash.remove(); }, 900);
    }
  }, 4600);
})();

// ── Clock ──
function updateClock() {
  var now = new Date(), h = now.getHours(), m = now.getMinutes().toString().padStart(2,'0');
  var h12 = h % 12 || 12, ampm = h >= 12 ? 'PM' : 'AM';
  document.getElementById('clock').textContent = h12 + ':' + m;
  var g = 'Good evening';
  if (h < 12) g = 'Good morning'; else if (h < 17) g = 'Good afternoon';
  document.getElementById('greeting').textContent = g;
  var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  document.getElementById('dateLine').textContent = days[now.getDay()] + ', ' + months[now.getMonth()] + ' ' + now.getDate();
  document.getElementById('topBarTime').textContent = days[now.getDay()].slice(0,3) + ', ' + months[now.getMonth()] + ' ' + now.getDate() + '  ' + h12 + ':' + m + ' ' + ampm;
}
updateClock(); setInterval(updateClock, 1000);

// ═══════════════════════════════════════════════
//  APPS — defined once here, rendered everywhere
//  (dock, top bar, app windows, settings list)
// ═══════════════════════════════════════════════

// Built-in apps: always present, can't be removed.
var BUILTIN_APPS = [
  { id:'docs', name:'Google Docs', kind:'site', url:'https://docs.google.com',
    c1:'#f5d0e5', c2:'#ebbad0', vb:'0 0 28 28',
    icon:'<rect x="6" y="2" width="16" height="22" rx="2.5" fill="none" stroke="white" stroke-width="1.4" opacity="0.9"/><path d="M18 2L22 6L18 6Z" fill="white" opacity="0.35"/><line x1="9" y1="10" x2="19" y2="10" stroke="white" stroke-width="1.4" stroke-linecap="round" opacity="0.7"/><line x1="9" y1="13.5" x2="16" y2="13.5" stroke="white" stroke-width="1.4" stroke-linecap="round" opacity="0.55"/><line x1="9" y1="17" x2="18" y2="17" stroke="white" stroke-width="1.4" stroke-linecap="round" opacity="0.45"/>' },
  { id:'writing', name:'Local Writing', kind:'local', src:'apps/writing/index.html',
    c1:'#bfe3c4', c2:'#9ed0a8', vb:'0 0 24 24', sub:'Saves to device, not the cloud',
    icon:'<path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" fill="none" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity="0.92"/><path d="M16 8 2 22" stroke="white" stroke-width="1.6" stroke-linecap="round" opacity="0.7"/><path d="M17.5 15H9" stroke="white" stroke-width="1.6" stroke-linecap="round" opacity="0.7"/>' }
];

// Add-ons ship by default but can be removed (and the user can add their own).
var DEFAULT_ADDONS = [
  { id:'dabble', name:'Dabble Writer', kind:'site', url:'https://app.dabblewriter.com',
    c1:'#ddd0f0', c2:'#ccbbe5', vb:'0 0 28 28',
    icon:'<path d="M14 7C12 6 7.5 5.5 4 6.8L4 22C7.5 21 12 21.5 14 23" fill="none" stroke="white" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/><path d="M14 7C16 6 20.5 5.5 24 6.8L24 22C20.5 21 16 21.5 14 23" fill="none" stroke="white" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/><line x1="14" y1="7" x2="14" y2="23" stroke="white" stroke-width="1.1" opacity="0.5"/>' }
];

function loadAddons() {
  var a = null;
  try { a = JSON.parse(localStorage.getItem('qh-addons')); } catch(e) {}
  if (!Array.isArray(a)) { a = DEFAULT_ADDONS.slice(); saveAddons(a); }   // seed Dabble on first run
  return a;
}
function saveAddons(a) { try { localStorage.setItem('qh-addons', JSON.stringify(a)); } catch(e) {} }

var addons = loadAddons();
function allApps() { return BUILTIN_APPS.concat(addons); }
function isBuiltin(id) { return BUILTIN_APPS.some(function(a){ return a.id === id; }); }
// Per-theme colours for the APP icons. The default (Purple) theme uses each
// app's own colour; Wood/Slate shift the known apps toward the theme palette.
var currentTheme = 'purple';
var THEME_APP_COLORS = {
  wood: {
    docs:    ['#d8c3a6', '#c6a87f'],
    writing: ['#c6c39c', '#aaa177'],
    dabble:  ['#d5c3b0', '#bfa78f']
  },
  grey: {
    docs:    ['#c0d4ee', '#9fbce4'],
    writing: ['#c2ccc6', '#a4b1aa'],
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
  if (app.icon) return '<svg width="'+px+'" height="'+px+'" viewBox="'+app.vb+'" fill="none">'+app.icon+'</svg>';
  var letter = (app.name || '?').trim().charAt(0).toUpperCase() || '?';
  return '<span style="color:#fff;font-weight:600;line-height:1;font-size:'+Math.round(px*0.5)+'px;">'+esc(letter)+'</span>';
}

var currentApp = null;

function openApp(name) {
  if (currentApp === name) { goHome(); return; }
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
  currentApp = name;
}

function goHome() {
  document.querySelectorAll('.app-view').forEach(function(v) { v.classList.remove('active'); });
  document.getElementById('homeScreen').style.display = 'flex';
  document.querySelectorAll('[data-app]').forEach(function(a) { a.classList.remove('active'); });
  var tag = document.getElementById('openAppTag'); if (tag) tag.classList.remove('show');
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
  if (view) { var ifr = view.querySelector('iframe'); if (ifr) ifr.src = ifr.src; }
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

// Build one app window (a local app gets an iframe; a website gets a placeholder card).
function buildView(app) {
  var v = document.createElement('div');
  v.className = 'app-view';
  v.id = 'view-' + app.id;
  if (app.kind === 'local') {
    v.innerHTML = '<iframe class="app-frame" src="' + app.src + '" title="' + esc(app.name) + '"></iframe>';
  } else {
    var host = '';
    if (app.url) host = app.url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    v.innerHTML = '<div class="app-body">'
      + '<div class="app-body-icon" style="background:' + gradOf(app) + ';">' + iconHtml(app, 36) + '</div>'
      + '<div class="app-body-name">' + esc(app.name) + '</div>'
      + (host ? '<div class="app-body-url">' + esc(host) + '</div>' : '')
      + '<div class="app-body-note">On your Chromebook, this opens<br>right here as a full window.</div>'
      + '</div>';
  }
  return v;
}

// Build one row in the Settings → Apps list.
function buildSettingsRow(app) {
  var row = document.createElement('div');
  row.className = 'settings-row';
  row.innerHTML =
    '<div class="app-mini-icon" data-appicon="' + app.id + '" style="background:' + gradOf(app) + ';">' + iconHtml(app, 14) + '</div>'
    + '<div class="settings-row-text"><div class="settings-row-label">' + esc(app.name) + '</div>'
    + (app.sub ? '<div class="settings-row-sub">' + esc(app.sub) + '</div>' : '') + '</div>'
    + (isBuiltin(app.id) ? '' : '<button class="app-remove" title="Remove this app">&#x2715;</button>')
    + '<label class="toggle"><input type="checkbox" data-appvis="' + app.id + '"><div class="toggle-track"></div><div class="toggle-thumb"></div></label>';
  var cb = row.querySelector('input[data-appvis]');
  cb.checked = isVisible(app.id);
  cb.addEventListener('change', function() { toggleAppVis(app.id, cb.checked); });
  var rb = row.querySelector('.app-remove');
  if (rb) rb.addEventListener('click', function() { removeApp(app.id); });
  return row;
}

// Render the whole app list into the dock, top bar, windows, and settings.
function renderApps() {
  var dock = document.getElementById('dock');
  var top = document.getElementById('topApps');
  var views = document.getElementById('appViews');
  var list = document.getElementById('appsList');
  dock.querySelectorAll('.app').forEach(function(el) { el.remove(); });
  top.innerHTML = '';
  views.innerHTML = '';
  list.innerHTML = '';

  allApps().forEach(function(app) {
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

// Add a user app (name + website + colour).
function addApp(name, url, c1, c2) {
  name = (name || '').trim();
  url = (url || '').trim();
  if (!name || !url) return false;
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  var id = 'app' + Math.random().toString(36).slice(2, 8);
  addons.push({ id:id, name:name, kind:'site', url:url, c1:c1, c2:c2 });
  saveAddons(addons);
  renderApps();
  return true;
}

// Remove a user app or a default add-on (built-ins can't be removed).
function removeApp(id) {
  if (isBuiltin(id)) return;
  if (currentApp === id) goHome();
  addons = addons.filter(function(a) { return a.id !== id; });
  saveAddons(addons);
  try { var m = JSON.parse(localStorage.getItem('qh-apps') || '{}'); delete m[id]; localStorage.setItem('qh-apps', JSON.stringify(m)); } catch(e) {}
  renderApps();
}

// ── Add-app form ──
var APP_COLORS = [
  ['#f5d0e5','#ebbad0'], ['#cdbfe6','#b6a3da'], ['#bfe3c4','#9ed0a8'],
  ['#bcd6f0','#9ec0e6'], ['#f3d9b8','#e6c191'], ['#cfd4da','#aeb6c0']
];
var pickedColor = APP_COLORS[1];

function renderColorSwatches() {
  var box = document.getElementById('addAppColors');
  box.innerHTML = '';
  APP_COLORS.forEach(function(pair) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'color-swatch' + (pair === pickedColor ? ' active' : '');
    b.style.background = 'linear-gradient(145deg,' + pair[0] + ',' + pair[1] + ')';
    b.addEventListener('click', function() { pickedColor = pair; renderColorSwatches(); });
    box.appendChild(b);
  });
}

function openAddForm() {
  document.getElementById('addAppForm').classList.add('open');
  document.getElementById('addAppBtn').style.display = 'none';
  document.getElementById('addAppName').focus();
}
function closeAddForm() {
  document.getElementById('addAppForm').classList.remove('open');
  document.getElementById('addAppBtn').style.display = '';
  document.getElementById('addAppName').value = '';
  document.getElementById('addAppUrl').value = '';
}

document.getElementById('addAppBtn').addEventListener('click', openAddForm);
document.getElementById('addAppCancel').addEventListener('click', closeAddForm);
document.getElementById('addAppSave').addEventListener('click', function() {
  var ok = addApp(document.getElementById('addAppName').value, document.getElementById('addAppUrl').value, pickedColor[0], pickedColor[1]);
  if (ok) closeAddForm();
});

// First render
renderApps();
renderColorSwatches();

// ── Settings ──
function toggleSettings() { document.getElementById('settingsOverlay').classList.toggle('open'); }
document.addEventListener('keydown', function(e) { if (e.key === 'Escape') document.getElementById('settingsOverlay').classList.remove('open'); });

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
var THEMES = ['purple', 'wood', 'grey', 'dark'];

function applyFilter() {
  var slider = document.querySelector('.brightness-slider');
  var b = slider ? slider.value : 100;
  var f = 'brightness(' + (b / 100) + ')';
  if (nightOn) f += ' sepia(0.35) saturate(0.9) brightness(0.96)';
  document.body.style.filter = f;
}

function setBrightness(val) { applyFilter(); try { localStorage.setItem('qh-brightness', val); } catch(e) {} }

function setTheme(name) {
  if (THEMES.indexOf(name) < 0) name = 'purple';
  document.body.classList.remove('theme-wood', 'theme-grey', 'theme-dark');
  if (name !== 'purple') document.body.classList.add('theme-' + name);
  currentTheme = name;
  recolorAppIcons();   // recolour app icons in place (no view/iframe rebuild)
  document.querySelectorAll('.theme-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.theme === name);
  });
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
  var savedTheme=null, savedNight=null, savedBright=null, savedMode=null, savedClip=null;
  try {
    savedTheme  = localStorage.getItem('qh-theme');
    savedNight  = localStorage.getItem('qh-night');
    savedBright = localStorage.getItem('qh-brightness');
    savedMode   = localStorage.getItem('qh-mode');
    savedClip   = localStorage.getItem('qh-clip');
  } catch(e) {}

  setTheme(savedTheme || 'purple');

  if (savedBright !== null) {
    var sl = document.querySelector('.brightness-slider');
    if (sl) sl.value = savedBright;
  }
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
var LOCAL_VERSION = '1.0';
function checkForUpdate() {
  fetch('https://raw.githubusercontent.com/stjohnbuilds/quill-haven/main/version.json')
    .then(function(r) { return r.json(); })
    .then(function(d) {
      if (d.version && d.version !== LOCAL_VERSION) {
        document.getElementById('updateBtn').classList.add('show');
      }
    })
    .catch(function() {});
}
function doUpdate() {
  var btn = document.getElementById('updateBtn');
  btn.textContent = 'Updating...';
  btn.style.pointerEvents = 'none';
  fetch('https://raw.githubusercontent.com/stjohnbuilds/quill-haven/main/home-screen/index.html', { cache: 'no-store' })
    .then(function(r) { if (!r.ok) throw new Error('fetch failed'); return r.text(); })
    .then(function(html) {
      if (html.indexOf('Quill Haven') === -1) throw new Error('unexpected content');
      btn.textContent = 'Loading new version...';
      document.open();
      document.write(html);
      document.close();
    })
    .catch(function() {
      btn.textContent = 'Update failed — try again';
      btn.style.pointerEvents = 'auto';
      setTimeout(function() { btn.innerHTML = '<span class="update-dot"></span> Update available'; }, 2800);
    });
}
setTimeout(checkForUpdate, 3000);
