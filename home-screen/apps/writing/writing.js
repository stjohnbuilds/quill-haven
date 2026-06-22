/* ───────────────────────────────────────────────
   Local Writing app — logic.
   - Two tabs: Notes and Projects
   - Projects → Chapters → Scenes (each scene: header + sub-header + body)
   - Draggable to reorder; rename by double-click; autosaves to the device
   - Centred pill toolbar: bold / italic / underline / strikethrough / highlight
   - Matches the home screen's theme
─────────────────────────────────────────────── */
(function () {
  'use strict';

  // ── Match the home-screen skin ──
  var THEMES = ['purple', 'wood', 'grey', 'dark'];
  function applyTheme() {
    var t = 'purple';
    try { t = localStorage.getItem('qh-theme') || 'purple'; } catch (e) {}
    if (THEMES.indexOf(t) < 0) t = 'purple';
    document.body.classList.remove('theme-wood', 'theme-grey', 'theme-dark');
    if (t !== 'purple') document.body.classList.add('theme-' + t);
  }

  // ── Storage ──
  var STORE = 'qh-writing2';
  function newId() { return 'x' + Math.random().toString(36).slice(2, 9); }
  function persist() { try { localStorage.setItem(STORE, JSON.stringify(data)); } catch (e) {} }

  function migrateOrSeed() {
    // Carry any chapters from the old single-list app over as Notes.
    var old = null;
    try { old = JSON.parse(localStorage.getItem('qh-writing')); } catch (e) {}
    var notes = [];
    if (old && old.chapters && old.chapters.length) {
      old.chapters.forEach(function (ch) {
        notes.push({ id: newId(), title: (ch.title || 'Untitled'), body: ch.html || '' });
      });
    }
    var scene = { id: newId(), header: '', subheader: '', body: '' };
    var chap = { id: newId(), title: 'Chapter 1', scenes: [scene] };
    var proj = { id: newId(), name: 'My First Book', chapters: [chap] };
    var open = {}; open[proj.id] = true; open[chap.id] = true;
    return {
      tab: notes.length ? 'notes' : 'projects',
      notes: notes,
      projects: [proj],
      sel: { note: notes.length ? notes[0].id : null, scene: scene.id },
      open: open,
      collapsed: false
    };
  }

  var data;
  try { data = JSON.parse(localStorage.getItem(STORE)); } catch (e) { data = null; }
  if (!data || typeof data !== 'object') data = migrateOrSeed();
  // make sure the shape is whole
  if (!Array.isArray(data.notes)) data.notes = [];
  if (!Array.isArray(data.projects)) data.projects = [];
  if (!data.sel) data.sel = { note: null, scene: null };
  if (!data.open) data.open = {};
  if (data.tab !== 'notes' && data.tab !== 'projects') data.tab = 'projects';
  persist();

  // ── Lookups ──
  function findNote(id) { for (var i = 0; i < data.notes.length; i++) if (data.notes[i].id === id) return data.notes[i]; return null; }
  function findProject(id) { for (var i = 0; i < data.projects.length; i++) if (data.projects[i].id === id) return data.projects[i]; return null; }
  function findChapter(id) {
    for (var i = 0; i < data.projects.length; i++) {
      var ch = data.projects[i].chapters;
      for (var j = 0; j < ch.length; j++) if (ch[j].id === id) return ch[j];
    }
    return null;
  }
  function findSceneCtx(id) {
    for (var i = 0; i < data.projects.length; i++) {
      var p = data.projects[i];
      for (var j = 0; j < p.chapters.length; j++) {
        var c = p.chapters[j];
        for (var k = 0; k < c.scenes.length; k++) if (c.scenes[k].id === id) return { project: p, chapter: c, scene: c.scenes[k] };
      }
    }
    return null;
  }
  function findSceneObj(id) { var x = findSceneCtx(id); return x ? x.scene : null; }
  function firstScene() {
    for (var i = 0; i < data.projects.length; i++) {
      var p = data.projects[i];
      for (var j = 0; j < p.chapters.length; j++) if (p.chapters[j].scenes.length) return p.chapters[j].scenes[0];
    }
    return null;
  }

  // ── Elements ──
  var side = document.getElementById('side');
  var notesPanel = document.getElementById('notesPanel');
  var projectsPanel = document.getElementById('projectsPanel');
  var sideFoot = document.getElementById('sideFoot');
  var docEl = document.getElementById('doc');
  var emptyState = document.getElementById('emptyState');
  var emptyText = document.getElementById('emptyText');
  var docHeader = document.getElementById('docHeader');
  var docSubheader = document.getElementById('docSubheader');
  var editor = document.getElementById('editor');
  var wordEl = document.getElementById('wordCount');
  var saveEl = document.getElementById('saveState');
  var toolbar = document.getElementById('toolbar');
  var hlBtn = document.getElementById('hlBtn');
  var hlMenu = document.getElementById('hlMenu');

  function el(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }
  function txt(node) { return (node.textContent || '').replace(/ /g, ' ').trim(); }

  function confirmDanger(title, message, onYes) {
    if (window.qhConfirm) window.qhConfirm({ title: title, message: message, confirmText: 'Delete', danger: true, onConfirm: onYes });
    else if (window.confirm(title + (message ? '\n' + message : ''))) onYes();
  }

  // ═══ Sidebar rendering ═══
  function caretEl(leaf) {
    var s = el('span', 'row-caret' + (leaf ? ' leaf' : ''));
    s.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>';
    return s;
  }
  function addBtn(title) { var b = el('button', 'row-add'); b.type = 'button'; b.title = title; b.textContent = '+'; return b; }
  function delBtn(title) { var b = el('button', 'row-del'); b.type = 'button'; b.title = title; b.innerHTML = '&times;'; return b; }
  function editBtn(title) {
    var b = el('button', 'row-edit'); b.type = 'button'; b.title = title;
    b.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>';
    return b;
  }

  function renderAll() {
    document.querySelectorAll('.tab').forEach(function (t) { t.classList.toggle('active', t.dataset.tab === data.tab); });
    notesPanel.hidden = data.tab !== 'notes';
    projectsPanel.hidden = data.tab !== 'projects';
    renderNotes();
    renderProjects();
    renderFoot();
  }

  function renderFoot() {
    sideFoot.innerHTML = '';
    var b = el('button', 'add-btn'); b.type = 'button';
    if (data.tab === 'notes') { b.textContent = '+ New note'; b.addEventListener('click', addNote); }
    else { b.textContent = '+ New project'; b.addEventListener('click', addProject); }
    sideFoot.appendChild(b);
  }

  function renderNotes() {
    notesPanel.innerHTML = '';
    notesPanel.dataset.group = 'notes';
    if (!data.notes.length) { notesPanel.innerHTML = '<div class="tree-empty">No notes yet.<br>Jot anything — ideas, names, to-dos.</div>'; return; }
    data.notes.forEach(function (n) {
      var node = el('div', 'node'); node.dataset.id = n.id; node.draggable = true; wireDrag(node);
      var row = el('div', 'row note-row' + (data.sel.note === n.id ? ' active' : ''));
      var name = el('span', 'row-name'); name.textContent = n.title || 'Untitled note';
      var edit = editBtn('Rename note');
      var del = delBtn('Delete note');
      row.append(caretEl(true), el('span', 'row-dot'), name, edit, del);
      row.addEventListener('click', function (e) { if (e.target === del) return; selectNote(n.id); });
      name.addEventListener('dblclick', function (e) { e.stopPropagation(); startRename(name, node, n, 'title'); });
      edit.addEventListener('click', function (e) { e.stopPropagation(); startRename(name, node, n, 'title'); });
      del.addEventListener('click', function (e) { e.stopPropagation(); deleteNote(n.id); });
      node.appendChild(row);
      notesPanel.appendChild(node);
    });
  }

  function renderProjects() {
    projectsPanel.innerHTML = '';
    projectsPanel.dataset.group = 'projects';
    if (!data.projects.length) { projectsPanel.innerHTML = '<div class="tree-empty">No projects yet.<br>Make one below to start a book.</div>'; return; }
    data.projects.forEach(function (p) {
      var node = el('div', 'node'); node.dataset.id = p.id; node.draggable = true; wireDrag(node);
      var isOpen = !!data.open[p.id];
      var row = el('div', 'row project-row' + (isOpen ? ' open' : ''));
      var name = el('span', 'row-name'); name.textContent = p.name || 'Untitled project';
      var edit = editBtn('Rename project'); var add = addBtn('Add chapter'); var del = delBtn('Delete project');
      row.append(caretEl(false), name, edit, add, del);
      row.addEventListener('click', function (e) { if (e.target === add || e.target === del) return; toggleOpen(p.id); });
      name.addEventListener('dblclick', function (e) { e.stopPropagation(); startRename(name, node, p, 'name'); });
      edit.addEventListener('click', function (e) { e.stopPropagation(); startRename(name, node, p, 'name'); });
      add.addEventListener('click', function (e) { e.stopPropagation(); addChapter(p.id); });
      del.addEventListener('click', function (e) { e.stopPropagation(); deleteProject(p.id); });
      node.appendChild(row);
      if (isOpen) {
        var kids = el('div', 'children'); kids.dataset.group = 'chapters:' + p.id;
        if (!p.chapters.length) { var em = el('div', 'tree-empty'); em.textContent = 'No chapters yet'; kids.appendChild(em); }
        p.chapters.forEach(function (c) { kids.appendChild(chapterNode(c)); });
        node.appendChild(kids);
      }
      projectsPanel.appendChild(node);
    });
  }

  function chapterNode(c) {
    var node = el('div', 'node'); node.dataset.id = c.id; node.draggable = true; wireDrag(node);
    var isOpen = !!data.open[c.id];
    var row = el('div', 'row chapter-row' + (isOpen ? ' open' : ''));
    var name = el('span', 'row-name'); name.textContent = c.title || 'Untitled chapter';
    var edit = editBtn('Rename chapter'); var add = addBtn('Add scene'); var del = delBtn('Delete chapter');
    row.append(caretEl(false), name, edit, add, del);
    row.addEventListener('click', function (e) { if (e.target === add || e.target === del) return; toggleOpen(c.id); });
    name.addEventListener('dblclick', function (e) { e.stopPropagation(); startRename(name, node, c, 'title'); });
    edit.addEventListener('click', function (e) { e.stopPropagation(); startRename(name, node, c, 'title'); });
    add.addEventListener('click', function (e) { e.stopPropagation(); addScene(c.id); });
    del.addEventListener('click', function (e) { e.stopPropagation(); deleteChapter(c.id); });
    node.appendChild(row);
    if (isOpen) {
      var kids = el('div', 'children'); kids.dataset.group = 'scenes:' + c.id;
      if (!c.scenes.length) { var em = el('div', 'tree-empty'); em.textContent = 'No scenes yet'; kids.appendChild(em); }
      c.scenes.forEach(function (s) { kids.appendChild(sceneNode(s)); });
      node.appendChild(kids);
    }
    return node;
  }

  function sceneNode(s) {
    var node = el('div', 'node'); node.dataset.id = s.id; node.draggable = true; wireDrag(node);
    var row = el('div', 'row scene-row' + (data.sel.scene === s.id ? ' active' : ''));
    var name = el('span', 'row-name'); name.textContent = s.header || 'Untitled scene';
    var edit = editBtn('Rename scene');
    var del = delBtn('Delete scene');
    row.append(caretEl(true), el('span', 'row-dot'), name, edit, del);
    row.addEventListener('click', function (e) { if (e.target === del) return; selectScene(s.id); });
    name.addEventListener('dblclick', function (e) { e.stopPropagation(); startRename(name, node, s, 'header'); });
    edit.addEventListener('click', function (e) { e.stopPropagation(); startRename(name, node, s, 'header'); });
    del.addEventListener('click', function (e) { e.stopPropagation(); deleteScene(s.id); });
    node.appendChild(row);
    return node;
  }

  // ═══ Tree actions ═══
  function toggleOpen(id) { data.open[id] = !data.open[id]; persist(); renderProjects(); }

  function startRename(nameEl, node, obj, key) {
    node.draggable = false;
    nameEl.setAttribute('contenteditable', 'true');
    nameEl.focus();
    var r = document.createRange(); r.selectNodeContents(nameEl);
    var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
    function finish() {
      nameEl.removeEventListener('blur', finish);
      nameEl.removeEventListener('keydown', onKey);
      nameEl.removeAttribute('contenteditable');
      node.draggable = true;
      var v = txt(nameEl);
      obj[key] = v || obj[key] || 'Untitled';
      persist(); renderAll(); loadEditor();
    }
    function onKey(e) {
      if (e.key === 'Enter') { e.preventDefault(); nameEl.blur(); }
      else if (e.key === 'Escape') { nameEl.textContent = obj[key] || ''; nameEl.blur(); }
    }
    nameEl.addEventListener('blur', finish);
    nameEl.addEventListener('keydown', onKey);
  }

  function addNote() {
    flush();
    var n = { id: newId(), title: '', body: '' };
    data.notes.push(n);
    data.tab = 'notes'; data.sel.note = n.id;
    persist(); renderAll(); loadEditor(); docHeader.focus();
  }
  function addProject() {
    flush();
    var scene = { id: newId(), header: '', subheader: '', body: '' };
    var chap = { id: newId(), title: 'Chapter 1', scenes: [scene] };
    var proj = { id: newId(), name: 'Untitled project', chapters: [chap] };
    data.projects.push(proj);
    data.open[proj.id] = true; data.open[chap.id] = true;
    data.tab = 'projects'; data.sel.scene = scene.id;
    persist(); renderAll(); loadEditor(); docHeader.focus();
  }
  function addChapter(projectId) {
    flush();
    var p = findProject(projectId); if (!p) return;
    var scene = { id: newId(), header: '', subheader: '', body: '' };
    var chap = { id: newId(), title: 'Chapter ' + (p.chapters.length + 1), scenes: [scene] };
    p.chapters.push(chap);
    data.open[p.id] = true; data.open[chap.id] = true;
    data.tab = 'projects'; data.sel.scene = scene.id;
    persist(); renderAll(); loadEditor(); docHeader.focus();
  }
  function addScene(chapterId) {
    flush();
    var c = findChapter(chapterId); if (!c) return;
    var scene = { id: newId(), header: '', subheader: '', body: '' };
    c.scenes.push(scene);
    data.open[c.id] = true;
    data.tab = 'projects'; data.sel.scene = scene.id;
    persist(); renderAll(); loadEditor(); docHeader.focus();
  }

  function afterDelete() {
    if (data.sel.scene && !findSceneObj(data.sel.scene)) { var fs = firstScene(); data.sel.scene = fs ? fs.id : null; }
    if (data.sel.note && !findNote(data.sel.note)) { data.sel.note = data.notes.length ? data.notes[0].id : null; }
    persist(); renderAll(); loadEditor();
  }
  function deleteNote(id) { confirmDanger('Delete this note?', 'This note will be removed — you can’t undo this yet.', function () { data.notes = data.notes.filter(function (n) { return n.id !== id; }); afterDelete(); }); }
  function deleteProject(id) { confirmDanger('Delete this project?', 'The project and everything in it will be removed.', function () { data.projects = data.projects.filter(function (p) { return p.id !== id; }); afterDelete(); }); }
  function deleteChapter(id) { confirmDanger('Delete this chapter?', 'The chapter and its scenes will be removed.', function () { data.projects.forEach(function (p) { p.chapters = p.chapters.filter(function (c) { return c.id !== id; }); }); afterDelete(); }); }
  function deleteScene(id) { confirmDanger('Delete this scene?', 'This scene will be removed.', function () { data.projects.forEach(function (p) { p.chapters.forEach(function (c) { c.scenes = c.scenes.filter(function (s) { return s.id !== id; }); }); }); afterDelete(); }); }

  function selectNote(id) { flush(); data.sel.note = id; data.tab = 'notes'; persist(); renderAll(); loadEditor(); }
  function selectScene(id) {
    flush();
    var ctx = findSceneCtx(id);
    if (ctx) { data.open[ctx.project.id] = true; data.open[ctx.chapter.id] = true; }
    data.sel.scene = id; data.tab = 'projects';
    persist(); renderAll(); loadEditor();
  }

  // ═══ Drag to reorder (within the same sibling group) ═══
  var drag = null;
  function wireDrag(node) {
    node.addEventListener('dragstart', function (e) {
      e.stopPropagation();
      drag = { el: node, group: node.parentElement };
      node.classList.add('dragging');
      if (e.dataTransfer) { e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', ''); } catch (_) {} }
    });
    node.addEventListener('dragover', function (e) {
      if (!drag || node.parentElement !== drag.group) return;
      e.preventDefault(); e.stopPropagation();
      var after = afterNode(drag.group, e.clientY);
      if (after == null) drag.group.appendChild(drag.el);
      else drag.group.insertBefore(drag.el, after);
    });
    node.addEventListener('dragend', function (e) {
      e.stopPropagation();
      node.classList.remove('dragging');
      var g = drag ? drag.group : null; drag = null;
      if (g) commitOrder(g);
    });
  }
  function afterNode(group, y) {
    var nodes = [].slice.call(group.children).filter(function (c) { return c.classList && c.classList.contains('node') && !c.classList.contains('dragging'); });
    var closest = { off: -Infinity, el: null };
    nodes.forEach(function (nd) {
      var rowEl = nd.querySelector('.row') || nd;
      var b = rowEl.getBoundingClientRect();
      var off = y - b.top - b.height / 2;
      if (off < 0 && off > closest.off) closest = { off: off, el: nd };
    });
    return closest.el;
  }
  function reorder(arr, ids) {
    var byId = {}; arr.forEach(function (o) { byId[o.id] = o; });
    var res = []; ids.forEach(function (id) { if (byId[id]) { res.push(byId[id]); delete byId[id]; } });
    arr.forEach(function (o) { if (byId[o.id]) res.push(o); });
    return res;
  }
  function commitOrder(group) {
    var key = group.dataset.group;
    var ids = [].slice.call(group.children).filter(function (c) { return c.classList && c.classList.contains('node'); }).map(function (c) { return c.dataset.id; });
    if (key === 'notes') data.notes = reorder(data.notes, ids);
    else if (key === 'projects') data.projects = reorder(data.projects, ids);
    else if (key.indexOf('chapters:') === 0) { var p = findProject(key.slice(9)); if (p) p.chapters = reorder(p.chapters, ids); }
    else if (key.indexOf('scenes:') === 0) { var c = findChapter(key.slice(7)); if (c) c.scenes = reorder(c.scenes, ids); }
    persist();
  }

  // ═══ Editor ═══
  function loadEditor() {
    var mode = data.tab === 'notes' ? 'note' : 'scene';
    document.body.classList.toggle('mode-note', mode === 'note');
    var obj = mode === 'note' ? findNote(data.sel.note) : findSceneObj(data.sel.scene);
    if (!obj) {
      docEl.hidden = true; emptyState.hidden = false;
      emptyText.textContent = mode === 'note' ? 'No note open. Make one below to start jotting.' : 'No scene open. Pick one, or add a project below.';
      updateWordCount();
      return;
    }
    docEl.hidden = false; emptyState.hidden = true;
    if (mode === 'note') {
      docHeader.dataset.ph = 'Note title';
      docHeader.textContent = obj.title || '';
      editor.innerHTML = obj.body || '';
    } else {
      docHeader.dataset.ph = 'Scene title';
      docSubheader.dataset.ph = 'Subtitle';
      docHeader.textContent = obj.header || '';
      docSubheader.textContent = obj.subheader || '';
      editor.innerHTML = obj.body || '';
    }
    updateWordCount();
  }

  function flush() {
    if (docEl.hidden) return;
    if (document.body.classList.contains('mode-note')) {
      var n = findNote(data.sel.note);
      if (n) { n.title = txt(docHeader); n.body = editor.innerHTML; }
    } else {
      var s = findSceneObj(data.sel.scene);
      if (s) { s.header = txt(docHeader); s.subheader = txt(docSubheader); s.body = editor.innerHTML; }
    }
  }

  var saveTimer = null;
  function scheduleSave() {
    if (saveEl) saveEl.textContent = 'Saving…';
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      flush(); persist();
      renderNotes(); renderProjects();   // reflect title/header changes in the tree
      if (saveEl) saveEl.textContent = 'Saved';
    }, 500);
  }

  function updateWordCount() {
    var text = (editor.textContent || '').replace(/\s+/g, ' ').trim();
    var n = text ? text.split(' ').length : 0;
    wordEl.textContent = n + (n === 1 ? ' word' : ' words');
  }

  function refreshToolbar() {
    ['bold', 'italic', 'underline', 'strikeThrough'].forEach(function (cmd) {
      var b = toolbar.querySelector('button[data-cmd="' + cmd + '"]');
      if (!b) return;
      var on = false; try { on = document.queryCommandState(cmd); } catch (e) {}
      b.classList.toggle('on', on);
    });
  }

  function onEdit() { flush(); updateWordCount(); scheduleSave(); }
  editor.addEventListener('input', onEdit);
  docHeader.addEventListener('input', onEdit);
  docSubheader.addEventListener('input', onEdit);
  editor.addEventListener('keyup', refreshToolbar);
  editor.addEventListener('mouseup', refreshToolbar);
  docHeader.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); (document.body.classList.contains('mode-note') ? editor : docSubheader).focus(); }
  });
  docSubheader.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); editor.focus(); }
  });

  // ── Toolbar (keep the selection when a button is pressed) ──
  toolbar.addEventListener('mousedown', function (e) { if (e.target.closest('button')) e.preventDefault(); });
  toolbar.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.id === 'hlBtn') { hlMenu.hidden = !hlMenu.hidden; return; }
    if (b.dataset.cmd) { document.execCommand(b.dataset.cmd, false, null); refreshToolbar(); scheduleSave(); }
  });

  // ── Highlight popover ──
  var HL_COLORS = [
    { name: 'Butter', c: '#fef08a' }, { name: 'Peach', c: '#fed7aa' }, { name: 'Rose', c: '#fbcfe8' },
    { name: 'Lilac', c: '#e9d5ff' }, { name: 'Periwinkle', c: '#c7d2fe' }, { name: 'Sky', c: '#bae6fd' },
    { name: 'Aqua', c: '#a5f3fc' }, { name: 'Mint', c: '#bbf7d0' }, { name: 'Sage', c: '#d9f99d' },
    { name: 'Cream', c: '#fef3c7' }
  ];
  function buildHlMenu() {
    hlMenu.innerHTML = '';
    HL_COLORS.forEach(function (h) {
      var sw = el('button', 'hl-swatch'); sw.type = 'button'; sw.title = h.name; sw.style.background = h.c;
      sw.addEventListener('click', function () { applyHl(h.c); });
      hlMenu.appendChild(sw);
    });
    var none = el('button', 'hl-swatch none'); none.type = 'button'; none.textContent = 'Remove highlight';
    none.addEventListener('click', function () { applyHl('transparent'); });
    hlMenu.appendChild(none);
  }
  hlMenu.addEventListener('mousedown', function (e) { e.preventDefault(); });   // keep the selection
  function applyHl(color) {
    try { document.execCommand('styleWithCSS', false, true); } catch (e) {}
    try { document.execCommand('hiliteColor', false, color); } catch (e2) {}
    try { document.execCommand('backColor', false, color); } catch (e3) {}
    hlMenu.hidden = true;
    scheduleSave();
  }
  // close the popover on an outside click
  document.addEventListener('click', function (e) {
    if (hlMenu.hidden) return;
    if (e.target.closest('#hlMenu') || e.target.closest('#hlBtn')) return;
    hlMenu.hidden = true;
  });

  // ── Collapse / expand the panel ──
  function setCollapsed(v) { data.collapsed = v; document.body.classList.toggle('side-collapsed', v); persist(); }
  document.getElementById('collapseBtn').addEventListener('click', function () { setCollapsed(true); });
  document.getElementById('navQuill').addEventListener('click', function () { setCollapsed(false); });

  // ── Tabs ──
  document.querySelectorAll('.tab').forEach(function (t) {
    t.addEventListener('click', function () {
      flush();
      data.tab = t.dataset.tab;
      if (data.tab === 'notes' && !findNote(data.sel.note) && data.notes.length) data.sel.note = data.notes[0].id;
      if (data.tab === 'projects' && !findSceneObj(data.sel.scene)) { var fs = firstScene(); data.sel.scene = fs ? fs.id : null; }
      persist(); renderAll(); loadEditor();
    });
  });

  // ── Theme sync + leave ──
  applyTheme();
  window.addEventListener('storage', function (e) { if (e.key === 'qh-theme') applyTheme(); });
  window.addEventListener('beforeunload', function () { flush(); persist(); });

  // ── Init ──
  try { document.execCommand('defaultParagraphSeparator', false, 'p'); } catch (e) {}
  buildHlMenu();
  if (data.collapsed) document.body.classList.add('side-collapsed');
  renderAll();
  loadEditor();
  if (saveEl) saveEl.textContent = 'Saved';
})();
