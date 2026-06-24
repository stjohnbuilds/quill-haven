// Quill Haven — runs at document_start on the home screen ONLY.
// It hides the home screen's own top bar + dock immediately, before the page
// paints, so there's no flash of the old buttons/apps in the split-second
// before the main overlay loads and takes over. The main overlay removes this
// again if it ever fails to start, so the native buttons can come back.
(function () {
  try {
    if (/\/apps\//.test(location.pathname)) return; // only the home page, not the app pages
    var s = document.createElement('style');
    s.id = 'qh-early-hide';
    s.textContent = '.top-bar,.dock{display:none!important}';
    (document.head || document.documentElement).appendChild(s);
  } catch (e) {}
})();
