// Quill Haven — background service worker.
// The overlay (a content script) lives on docs.google.com, Dabble, Typing &
// Tomes, etc. Those pages can't talk to the local helper directly (the helper
// only trusts the home screen's origin). So the overlay sends a message here,
// and this worker — which DOES have permission for 127.0.0.1 — makes the call.
// That's how Power / Restart / Sleep / Terminal / Wi-Fi work from any page.

const HELPER = 'http://127.0.0.1:8137';

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (!msg || msg.type !== 'qh-helper') return;
  var opts = { method: msg.method || 'POST', mode: 'cors' };
  fetch(HELPER + msg.path, opts)
    .then(function (r) {
      if (!r.ok) throw new Error('helper ' + r.status);
      return msg.json ? r.json() : r.text();
    })
    .then(function (data) { sendResponse({ ok: true, data: data }); })
    .catch(function (err) { sendResponse({ ok: false, err: String(err) }); });
  return true; // keep the message channel open for the async reply
});
