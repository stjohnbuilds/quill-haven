// ── Boot splash ──
(function() {
  var typeEl = document.getElementById('bootType');
  var full = 'Your writing sanctuary';
  // #frozen holds the final composed frame (for previewing the design)
  if (location.hash === '#frozen') {
    if (typeEl) typeEl.textContent = full;
    var f = document.querySelector('.boot-loader-fill'); if (f) { f.style.animation = 'none'; f.style.width = '100%'; }
    var t = document.querySelector('.boot-text'); if (t) { t.style.animation = 'none'; t.style.clipPath = 'inset(0 0 0 0)'; }
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

// ── App switching ──
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
  currentApp = name;
}

function goHome() {
  document.querySelectorAll('.app-view').forEach(function(v) { v.classList.remove('active'); });
  document.getElementById('homeScreen').style.display = 'flex';
  document.querySelectorAll('[data-app]').forEach(function(a) { a.classList.remove('active'); });
  currentApp = null;
}

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

// ── App visibility ──
function toggleAppVis(name, visible) {
  document.querySelectorAll('[data-app="' + name + '"]').forEach(function(el) {
    el.classList.toggle('hidden', !visible);
  });
  var cb = document.querySelector('input[data-appvis="' + name + '"]');
  if (cb) cb.checked = visible;
  if (!visible && currentApp === name) goHome();
  var dock = document.getElementById('dock');
  var vis = dock.querySelectorAll('.app:not(.hidden)');
  dock.classList.toggle('is-empty', vis.length === 0);
  try { var a = JSON.parse(localStorage.getItem('qh-apps') || '{}'); a[name] = visible; localStorage.setItem('qh-apps', JSON.stringify(a)); } catch(e) {}
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
var currentTheme = 'purple';
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

// Restore all saved settings on load
(function() {
  var savedTheme=null, savedNight=null, savedBright=null, savedMode=null, savedApps=null, savedClip=null;
  try {
    savedTheme  = localStorage.getItem('qh-theme');
    savedNight  = localStorage.getItem('qh-night');
    savedBright = localStorage.getItem('qh-brightness');
    savedMode   = localStorage.getItem('qh-mode');
    savedApps   = localStorage.getItem('qh-apps');
    savedClip   = localStorage.getItem('qh-clip');
  } catch(e) {}

  setTheme(savedTheme || 'purple');

  // brightness — set the slider first, then night/brightness filter reads it
  if (savedBright !== null) {
    var sl = document.querySelector('.brightness-slider');
    if (sl) sl.value = savedBright;
  }
  setNight(savedNight === '1');

  // app bar position (dock / top)
  if (savedMode) setMode(savedMode);

  // which apps are shown
  if (savedApps) {
    try {
      var a = JSON.parse(savedApps);
      Object.keys(a).forEach(function(name) { if (a[name] === false) toggleAppVis(name, false); });
    } catch(e) {}
  }

  // clipboard history
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
      // Safety check: make sure we actually got our home screen, not an error page
      if (html.indexOf('Quill Haven') === -1) throw new Error('unexpected content');
      btn.textContent = 'Loading new version...';
      // Swap the running page over to the freshly downloaded version
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
