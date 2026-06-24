(function() {
  if (window.__qhOverlay) return;
  window.__qhOverlay = true;

  var APPS = [
    { id: 'docs', name: 'Google Docs', url: 'https://docs.google.com', color: '#e8a0b4', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/></svg>' },
    { id: 'dabble', name: 'Dabble Writer', url: 'https://app.dabblewriter.com', color: '#9cc584', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l-7-7 1.4-1.4L12 16.2l5.6-5.6L19 12z"/><path d="M5 5h14"/></svg>' },
    { id: 'typing', name: 'Typing & Tomes', url: 'https://typingandtomes.vercel.app', color: '#a4b4d4', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="6" y1="10" x2="18" y2="10"/><line x1="6" y1="14" x2="14" y2="14"/></svg>' }
  ];

  var HOME_URL = 'https://stjohnbuilds.github.io/quill-haven/';
  var VERSION_URL = 'https://raw.githubusercontent.com/stjohnbuilds/quill-haven/main/version.json';

  var localEmoji = '';
  var updateInfo = null;

  function currentAppId() {
    var host = location.hostname;
    for (var i = 0; i < APPS.length; i++) {
      if (host.indexOf(APPS[i].url.replace('https://', '').split('/')[0]) !== -1) return APPS[i].id;
    }
    return null;
  }

  function currentApp() {
    var id = currentAppId();
    for (var i = 0; i < APPS.length; i++) {
      if (APPS[i].id === id) return APPS[i];
    }
    return null;
  }

  function otherApps() {
    var id = currentAppId();
    var out = [];
    for (var i = 0; i < APPS.length; i++) {
      if (APPS[i].id !== id) out.push(APPS[i]);
    }
    return out;
  }

  function isHome() {
    return location.hostname === 'stjohnbuilds.github.io';
  }

  // --- Top pill ---
  var pill = document.createElement('div');
  pill.id = 'qh-pill';

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  var DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  function updateTime() {
    var now = new Date();
    var day = DAYS[now.getDay()].slice(0, 3);
    var mon = MONTHS[now.getMonth()];
    var date = now.getDate();
    var h = pad(now.getHours());
    var m = pad(now.getMinutes());
    var timeEl = pill.querySelector('#qh-pill-time');
    if (timeEl) timeEl.textContent = day + ', ' + mon + ' ' + date + '  ' + h + ':' + m;
  }

  function buildPill() {
    var emojiSpan = '<span id="qh-pill-emoji">' + (localEmoji || '') + '<span class="qh-update-tip" id="qh-update-tip"></span></span>';

    var wifiSvg = '<svg class="qh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="currentColor" stroke="none"/></svg>';

    var batterySvg = '<svg class="qh-icon" viewBox="0 0 28 14" fill="none" stroke="currentColor" stroke-width="1.5" style="width:18px;"><rect x="1" y="2" width="22" height="10" rx="2.5"/><rect x="3.5" y="4.5" width="15" height="5" rx="1" fill="currentColor" stroke="none" opacity="0.6"/><rect x="23" y="5" width="3" height="4" rx="1" fill="currentColor" stroke="none" opacity="0.4"/></svg>';

    var powerSvg = '<svg class="qh-icon" id="qh-pill-power" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="cursor:pointer;"><path d="M12 2v9"/><path d="M18.4 6.6a9 9 0 1 1-12.8 0"/></svg>';

    var settingsSvg = '<svg class="qh-icon" id="qh-pill-settings" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="cursor:pointer;"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';

    var timeSpan = '<span id="qh-pill-time"></span>';

    pill.innerHTML = emojiSpan + wifiSvg + batterySvg + powerSvg + settingsSvg + timeSpan;

    pill.querySelector('#qh-pill-settings').addEventListener('click', toggleSettings);
    pill.querySelector('#qh-pill-power').addEventListener('click', function() {
      fetch('http://127.0.0.1:8137/power', { method: 'POST', mode: 'cors' }).catch(function() {});
    });
    pill.querySelector('#qh-pill-emoji').addEventListener('click', function() {
      if (updateInfo) doUpdate();
    });

    updateTime();
    setInterval(updateTime, 1000);
  }

  // --- Bottom dock ---
  var dock = document.createElement('div');
  dock.id = 'qh-dock';

  var trayOpen = false;

  function buildDock() {
    var app = currentApp();
    var cur = document.createElement('div');
    cur.id = 'qh-dock-current';

    if (app) {
      cur.style.background = app.color;
      cur.innerHTML = '<div style="width:22px;height:22px;">' + app.icon + '</div>';
    } else {
      cur.style.background = 'linear-gradient(135deg, #c9a0e0, #a0c4e0)';
      cur.innerHTML = '<div style="width:22px;height:22px;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg></div>';
    }

    var tray = document.createElement('div');
    tray.id = 'qh-dock-tray';

    var others = otherApps();
    if (!app) {
      others = APPS.slice();
    }

    for (var i = 0; i < others.length; i++) {
      (function(a) {
        var btn = document.createElement('div');
        btn.className = 'qh-dock-app';
        btn.style.background = a.color;
        btn.title = a.name;
        btn.innerHTML = '<div style="width:18px;height:18px;">' + a.icon + '</div>';
        btn.addEventListener('click', function() { window.location.href = a.url; });
        tray.appendChild(btn);
      })(others[i]);
    }

    if (!isHome()) {
      var homeBtn = document.createElement('div');
      homeBtn.className = 'qh-dock-app';
      homeBtn.style.background = 'linear-gradient(135deg, #c9a0e0, #a0c4e0)';
      homeBtn.title = 'Home';
      homeBtn.innerHTML = '<div style="width:18px;height:18px;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg></div>';
      homeBtn.addEventListener('click', function() { window.location.href = HOME_URL; });
      tray.appendChild(homeBtn);
    }

    cur.addEventListener('click', function() {
      trayOpen = !trayOpen;
      tray.classList.toggle('open', trayOpen);
    });

    dock.innerHTML = '';
    dock.appendChild(tray);
    dock.appendChild(cur);
  }

  // --- Settings overlay ---
  var settingsEl = document.createElement('div');
  settingsEl.id = 'qh-settings-overlay';

  function buildSettings() {
    settingsEl.innerHTML =
      '<div id="qh-settings-panel">'
      + '<div class="qh-s-header"><div class="qh-s-title">Settings</div><button class="qh-s-close" id="qh-s-close">&times;</button></div>'

      + '<div class="qh-s-section">Display</div>'
      + '<div class="qh-s-card">'
      + '<div class="qh-s-row"><div class="qh-s-row-icon" style="background:#7c6fa0;">&#9788;</div><div><div class="qh-s-row-label">Theme</div><div class="qh-s-row-sub">Quill Haven default</div></div></div>'
      + '<div class="qh-s-row"><div class="qh-s-row-icon" style="background:#6a9fd8;">&#128247;</div><div><div class="qh-s-row-label">Background</div><div class="qh-s-row-sub">Soft gradient</div></div></div>'
      + '</div>'

      + '<div class="qh-s-section">System</div>'
      + '<div class="qh-s-card">'
      + '<div class="qh-s-row"><div class="qh-s-row-icon" style="background:#e8a87c;">&#9881;</div><div><div class="qh-s-row-label">Terminal</div><div class="qh-s-row-sub">Open a terminal window</div></div></div>'
      + '<div class="qh-s-row"><div class="qh-s-row-icon" style="background:#85b79d;">&#8635;</div><div><div class="qh-s-row-label">Restart</div><div class="qh-s-row-sub">Restart Quill Haven</div></div></div>'
      + '</div>'

      + '<div class="qh-s-section">About</div>'
      + '<div class="qh-s-card">'
      + '<div class="qh-s-row"><div><div class="qh-s-row-label">Version</div><div class="qh-s-row-sub" id="qh-s-version">Loading...</div></div></div>'
      + '</div>'

      + '<div class="qh-s-footer">Quill Haven</div>'
      + '</div>';

    settingsEl.querySelector('#qh-s-close').addEventListener('click', toggleSettings);
    settingsEl.addEventListener('click', function(e) {
      if (e.target === settingsEl) toggleSettings();
    });

    var termRow = settingsEl.querySelectorAll('.qh-s-row')[2];
    if (termRow) termRow.style.cursor = 'pointer';
    if (termRow) termRow.addEventListener('click', function() {
      fetch('http://127.0.0.1:8137/terminal', { method: 'POST', mode: 'cors' }).catch(function() {});
    });

    var restartRow = settingsEl.querySelectorAll('.qh-s-row')[3];
    if (restartRow) restartRow.style.cursor = 'pointer';
    if (restartRow) restartRow.addEventListener('click', function() {
      fetch('http://127.0.0.1:8137/restart', { method: 'POST', mode: 'cors' }).catch(function() {});
    });
  }

  function toggleSettings() {
    settingsEl.classList.toggle('open');
  }

  // --- Update check ---
  function checkForUpdate() {
    fetch(VERSION_URL, { cache: 'no-store' })
      .then(function(r) { return r.json(); })
      .then(function(d) {
        localEmoji = d.emoji || '';
        var emojiEl = pill.querySelector('#qh-pill-emoji');
        if (emojiEl) {
          emojiEl.childNodes[0].textContent = localEmoji;
        }

        var versionEl = settingsEl.querySelector('#qh-s-version');
        if (versionEl) versionEl.textContent = 'v' + d.version + ' ' + (d.emoji || '');

        var currentVersion = null;
        try {
          var metaEl = document.querySelector('meta[name="qh-version"]');
          if (metaEl) currentVersion = metaEl.getAttribute('content');
        } catch(e) {}

        if (currentVersion && d.version && d.version !== currentVersion) {
          updateInfo = d;
          if (emojiEl) {
            emojiEl.classList.add('has-update');
            emojiEl.style.cursor = 'pointer';
            var tip = emojiEl.querySelector('.qh-update-tip');
            if (tip) tip.textContent = 'Update to v' + d.version + ' ' + (d.emoji || '');
          }
        }
      })
      .catch(function() {});
  }

  function doUpdate() {
    if (window.caches) {
      caches.keys().then(function(ks) {
        return Promise.all(ks.map(function(k) { return caches.delete(k); }));
      }).then(function() {
        if (navigator.serviceWorker) {
          navigator.serviceWorker.getRegistrations().then(function(regs) {
            return Promise.all(regs.map(function(r) { return r.unregister(); }));
          }).then(function() {
            window.location.href = HOME_URL + '?v=' + Date.now();
          });
        } else {
          window.location.href = HOME_URL + '?v=' + Date.now();
        }
      });
    } else {
      window.location.href = HOME_URL + '?v=' + Date.now();
    }
  }

  // --- Close tray on outside click ---
  document.addEventListener('click', function(e) {
    if (trayOpen && !dock.contains(e.target)) {
      trayOpen = false;
      var tray = dock.querySelector('#qh-dock-tray');
      if (tray) tray.classList.remove('open');
    }
  });

  // --- Init ---
  buildPill();
  buildDock();
  buildSettings();

  document.documentElement.appendChild(pill);
  document.documentElement.appendChild(dock);
  document.documentElement.appendChild(settingsEl);

  checkForUpdate();
})();
