/* ───────────────────────────────────────────────
   Local Writing app — logic.
   - contentEditable editor with a small format toolbar
   - chapters in the sidebar
   - autosaves to the device (localStorage)
   - matches the home screen's theme
─────────────────────────────────────────────── */
(function () {
  'use strict';

  // ── Match the home screen skin ──
  var THEMES = ['purple', 'wood', 'grey', 'dark'];
  function applyTheme() {
    var t = 'purple';
    try { t = localStorage.getItem('qh-theme') || 'purple'; } catch (e) {}
    if (THEMES.indexOf(t) < 0) t = 'purple';
    document.body.classList.remove('theme-wood', 'theme-grey', 'theme-dark');
    if (t !== 'purple') document.body.classList.add('theme-' + t);
  }

  // ── Storage ──
  var STORE = 'qh-writing';   // { chapters: [{id,title,html}], activeId }
  function newId() { return 'c' + Math.random().toString(36).slice(2, 9); }
  function loadData() {
    try { return JSON.parse(localStorage.getItem(STORE)); } catch (e) { return null; }
  }
  function persist() {
    try { localStorage.setItem(STORE, JSON.stringify(data)); } catch (e) {}
  }

  var data = loadData();
  if (!data || !Array.isArray(data.chapters) || !data.chapters.length) {
    var first = { id: newId(), title: 'Chapter One', html: '' };
    data = { chapters: [first], activeId: first.id };
    persist();
  }
  if (!data.activeId) data.activeId = data.chapters[0].id;

  // ── Elements ──
  var editor = document.getElementById('editor');
  var titleEl = document.getElementById('chapterTitle');
  var listEl = document.getElementById('chapterList');
  var wordEl = document.getElementById('wordCount');
  var saveEl = document.getElementById('saveState');

  function activeChapter() {
    for (var i = 0; i < data.chapters.length; i++) {
      if (data.chapters[i].id === data.activeId) return data.chapters[i];
    }
    return data.chapters[0];
  }

  function renderList() {
    listEl.innerHTML = '';
    data.chapters.forEach(function (c) {
      var b = document.createElement('button');
      b.className = 'chapter' + (c.id === data.activeId ? ' active' : '');
      b.textContent = c.title || 'Untitled';
      b.addEventListener('click', function () { selectChapter(c.id); });
      listEl.appendChild(b);
    });
  }

  function loadIntoEditor() {
    var c = activeChapter();
    titleEl.textContent = c.title || '';
    editor.innerHTML = c.html || '';
    updateWordCount();
  }

  // Copy what's on screen back into the active chapter object
  function flush() {
    var c = activeChapter();
    if (!c) return;
    c.title = (titleEl.textContent || '').trim() || 'Untitled';
    c.html = editor.innerHTML;
  }

  function selectChapter(cid) {
    flush();
    data.activeId = cid;
    persist();
    renderList();
    loadIntoEditor();
  }

  function addChapter() {
    flush();
    var c = { id: newId(), title: 'New chapter', html: '' };
    data.chapters.push(c);
    data.activeId = c.id;
    persist();
    renderList();
    loadIntoEditor();
    titleEl.focus();
  }

  var saveTimer = null;
  function scheduleSave() {
    if (saveEl) saveEl.textContent = 'Saving…';
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      flush();
      persist();
      renderList();   // reflect any title change in the sidebar
      if (saveEl) saveEl.textContent = 'Saved';
    }, 500);
  }

  function updateWordCount() {
    var text = (editor.textContent || '').replace(/\s+/g, ' ').trim();
    var n = text ? text.split(' ').length : 0;
    wordEl.textContent = n + (n === 1 ? ' word' : ' words');
  }

  function refreshToolbar() {
    ['bold', 'italic', 'underline'].forEach(function (cmd) {
      var b = document.querySelector('.toolbar button[data-cmd="' + cmd + '"]');
      if (!b) return;
      var on = false;
      try { on = document.queryCommandState(cmd); } catch (e) {}
      b.classList.toggle('on', on);
    });
  }

  // ── Toolbar ──
  document.querySelector('.toolbar').addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('button') : null;
    if (!btn) return;
    editor.focus();
    if (btn.dataset.cmd) {
      document.execCommand(btn.dataset.cmd, false, null);
    } else if (btn.dataset.block) {
      var cur = '';
      try { cur = String(document.queryCommandValue('formatBlock')).toLowerCase(); } catch (e2) {}
      document.execCommand('formatBlock', false, cur === btn.dataset.block ? 'p' : btn.dataset.block);
    }
    refreshToolbar();
    scheduleSave();
  });

  // ── Events ──
  editor.addEventListener('input', function () { updateWordCount(); scheduleSave(); });
  editor.addEventListener('keyup', refreshToolbar);
  editor.addEventListener('mouseup', refreshToolbar);
  titleEl.addEventListener('input', scheduleSave);
  titleEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); editor.focus(); }
  });
  document.getElementById('addChapter').addEventListener('click', addChapter);
  window.addEventListener('beforeunload', function () { flush(); persist(); });

  // ── Theme sync (update live if the home screen changes theme) ──
  applyTheme();
  window.addEventListener('storage', function (e) { if (e.key === 'qh-theme') applyTheme(); });

  // ── Init ──
  renderList();
  loadIntoEditor();
  if (saveEl) saveEl.textContent = 'Saved';
})();
