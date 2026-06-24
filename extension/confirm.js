/* ───────────────────────────────────────────────
   Shared confirm dialog — bundled into the extension.
   This is the SAME popup used by the home screen
   (home-screen/shared/confirm.js). It lives here too
   because a content script runs in its own world and
   can't see the page's copy. Two deliberate differences
   from the home-screen copy: (1) the z-index is raised so
   it sits above the overlay's pill / dock / settings, and
   (2) the CSS variables use the overlay's --qh- prefix so
   the popup is themed on every page, not just the home one.
─────────────────────────────────────────────── */
(function () {
  'use strict';
  if (window.qhConfirm) return;

  function injectStyle() {
    if (document.getElementById('qh-confirm-style')) return;
    var s = document.createElement('style');
    s.id = 'qh-confirm-style';
    s.textContent =
      '.qhc-overlay{position:fixed;inset:0;z-index:2147483646;background:rgba(0,0,0,0.28);' +
      'display:flex;align-items:center;justify-content:center;padding:20px;' +
      'backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);animation:qhcFade .15s ease;' +
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;}' +
      '.qhc-box{background:var(--qh-panel-bg,#fff);border:1px solid var(--qh-card-border,rgba(0,0,0,0.1));' +
      'border-radius:16px;max-width:330px;width:100%;padding:20px 22px;' +
      'box-shadow:0 20px 50px rgba(0,0,0,0.25);animation:qhcPop .15s ease;}' +
      '.qhc-title{font-size:16px;font-weight:600;color:var(--qh-text-strong,#333);}' +
      '.qhc-msg{font-size:13px;color:var(--qh-text-muted,#888);margin-top:8px;line-height:1.5;}' +
      '.qhc-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:20px;}' +
      '.qhc-cancel,.qhc-confirm{border:none;border-radius:9px;padding:8px 16px;font-family:inherit;' +
      'font-size:13px;font-weight:600;cursor:pointer;transition:opacity .15s;}' +
      '.qhc-cancel:hover,.qhc-confirm:hover{opacity:.85;}' +
      '.qhc-cancel{background:var(--qh-row-hover,#eee);color:var(--qh-label,#333);}' +
      '.qhc-confirm{background:var(--qh-accent,#c9a0e0);color:#fff;}' +
      '.qhc-confirm.danger{background:#e06a6a;}' +
      '@keyframes qhcFade{from{opacity:0}to{opacity:1}}' +
      '@keyframes qhcPop{from{transform:scale(.96);opacity:0}to{transform:scale(1);opacity:1}}';
    document.head.appendChild(s);
  }

  window.qhConfirm = function (opts) {
    opts = opts || {};
    injectStyle();
    var ov = document.createElement('div'); ov.className = 'qhc-overlay';
    var box = document.createElement('div'); box.className = 'qhc-box';
    var h = document.createElement('div'); h.className = 'qhc-title'; h.textContent = opts.title || 'Are you sure?';
    box.appendChild(h);
    if (opts.message) { var m = document.createElement('div'); m.className = 'qhc-msg'; m.textContent = opts.message; box.appendChild(m); }
    var acts = document.createElement('div'); acts.className = 'qhc-actions';
    var cancel = document.createElement('button'); cancel.type = 'button'; cancel.className = 'qhc-cancel'; cancel.textContent = opts.cancelText || 'Cancel';
    var ok = document.createElement('button'); ok.type = 'button'; ok.className = 'qhc-confirm' + (opts.danger ? ' danger' : ''); ok.textContent = opts.confirmText || 'OK';
    // Info-only popups (noCancel) get a single full-width OK — no pointless Cancel.
    if (!opts.noCancel) acts.appendChild(cancel);
    else ok.style.flex = '1';
    acts.appendChild(ok);
    box.appendChild(acts); ov.appendChild(box);

    function close() { ov.remove(); document.removeEventListener('keydown', onKey); }
    function doConfirm() { close(); if (opts.onConfirm) opts.onConfirm(); }
    // Escape cancels. Enter just activates whichever button is focused (below).
    function onKey(e) { if (e.key === 'Escape') close(); }
    cancel.addEventListener('click', close);
    ok.addEventListener('click', doConfirm);
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(ov);
    // Destructive prompts focus Cancel so a stray Enter can't confirm by accident.
    // Info-only (noCancel) prompts focus OK.
    setTimeout(function () { ((opts.danger && !opts.noCancel) ? cancel : ok).focus(); }, 0);
  };
})();
