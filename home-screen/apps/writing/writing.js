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
  if (!Array.isArray(data.trash)) data.trash = [];
  data.projects.forEach(function (p) {
    if (!Array.isArray(p.chapters)) p.chapters = [];
    if (!Array.isArray(p.parts)) p.parts = [];
    p.parts.forEach(function (pt) { if (!Array.isArray(pt.chapters)) pt.chapters = []; });
  });
  if (!data.sel) data.sel = { note: null, scene: null };
  if (!data.open) data.open = {};
  if (data.tab !== 'notes' && data.tab !== 'projects' && data.tab !== 'trash') data.tab = 'projects';
  persist();

  // ── Lookups ──
  // Chapters can live at project.chapters (top-level) OR inside project.parts[i].chapters.
  // Walk every chapter in a project, with its containing part (null if top-level).
  function walkChapters(project, fn) {
    (project.chapters || []).forEach(function (c) { fn(c, null); });
    (project.parts || []).forEach(function (pt) {
      (pt.chapters || []).forEach(function (c) { fn(c, pt); });
    });
  }
  function findNote(id) { for (var i = 0; i < data.notes.length; i++) if (data.notes[i].id === id) return data.notes[i]; return null; }
  function findProject(id) { for (var i = 0; i < data.projects.length; i++) if (data.projects[i].id === id) return data.projects[i]; return null; }
  function findPartCtx(id) {
    for (var i = 0; i < data.projects.length; i++) {
      var pjs = data.projects[i].parts || [];
      for (var j = 0; j < pjs.length; j++) if (pjs[j].id === id) return { project: data.projects[i], part: pjs[j] };
    }
    return null;
  }
  function findPart(id) { var x = findPartCtx(id); return x ? x.part : null; }
  function findChapterCtx(id) {
    for (var i = 0; i < data.projects.length; i++) {
      var p = data.projects[i];
      var hit = null;
      walkChapters(p, function (c, pt) { if (!hit && c.id === id) hit = { project: p, part: pt, chapter: c }; });
      if (hit) return hit;
    }
    return null;
  }
  function findChapter(id) { var x = findChapterCtx(id); return x ? x.chapter : null; }
  function findSceneCtx(id) {
    for (var i = 0; i < data.projects.length; i++) {
      var p = data.projects[i];
      var hit = null;
      walkChapters(p, function (c, pt) {
        if (hit) return;
        for (var k = 0; k < c.scenes.length; k++) if (c.scenes[k].id === id) { hit = { project: p, part: pt, chapter: c, scene: c.scenes[k] }; return; }
      });
      if (hit) return hit;
    }
    return null;
  }
  function findSceneObj(id) { var x = findSceneCtx(id); return x ? x.scene : null; }
  function firstScene() {
    for (var i = 0; i < data.projects.length; i++) {
      var p = data.projects[i];
      var first = null;
      walkChapters(p, function (c) { if (!first && c.scenes && c.scenes.length) first = c.scenes[0]; });
      if (first) return first;
    }
    return null;
  }

  // ── Elements ──
  var side = document.getElementById('side');
  var notesPanel = document.getElementById('notesPanel');
  var projectsPanel = document.getElementById('projectsPanel');
  var trashPanel = document.getElementById('trashPanel');
  var trashTab = document.querySelector('.tab-trash');
  var trashCount = document.getElementById('trashCount');
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
  var downloadBtn = document.getElementById('downloadBtn');
  var dlMenu = document.getElementById('dlMenu');

  function el(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }
  function txt(node) { return (node.textContent || '').replace(/ /g, ' ').trim(); }

  function esc(s) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function dateStr(ms) { var d = new Date(ms); var mo = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; return mo[d.getMonth()] + ' ' + d.getDate(); }

  function confirmDanger(title, message, onYes) {
    if (window.qhConfirm) window.qhConfirm({ title: title, message: message, confirmText: 'Delete forever', danger: true, onConfirm: onYes });
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
    if (trashPanel) trashPanel.hidden = data.tab !== 'trash';
    renderNotes();
    renderProjects();
    renderTrash();
    renderFoot();
    syncDownloadBtn();
    syncTrashTab();
  }
  function syncTrashTab() {
    if (!trashTab) return;
    var n = data.trash.length;
    trashTab.hidden = !n && data.tab !== 'trash';
    if (trashCount) {
      trashCount.hidden = !n;
      trashCount.textContent = String(n);
    }
  }

  function currentProject() {
    var ctx = data.sel.scene ? findSceneCtx(data.sel.scene) : null;
    return ctx ? ctx.project : null;
  }
  function syncDownloadBtn() {
    if (!downloadBtn) return;
    // Visible on Notes (download current note OR backup) and Projects (download current book OR backup).
    downloadBtn.hidden = data.tab === 'trash';
    var nameEl = document.getElementById('dlNameThis');
    var subEl = document.getElementById('dlSubThis');
    if (data.tab === 'notes') {
      if (nameEl) nameEl.textContent = 'This note';
      if (subEl) subEl.textContent = 'Word file (.rtf) of the current note';
    } else {
      if (nameEl) nameEl.textContent = 'This book';
      if (subEl) subEl.textContent = 'Word file (.rtf) — also saved to Files';
    }
  }

  function renderFoot() {
    sideFoot.innerHTML = '';
    if (data.tab === 'trash') {
      if (!data.trash.length) return;
      var emp = el('button', 'add-btn ghost'); emp.type = 'button'; emp.textContent = 'Empty trash';
      emp.addEventListener('click', emptyTrash);
      sideFoot.appendChild(emp); return;
    }
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
      var edit = editBtn('Rename project'); var add = addBtn('Add chapter or part'); var del = delBtn('Delete project');
      row.append(caretEl(false), name, edit, add, del);
      row.addEventListener('click', function (e) { if (e.target === add || e.target === del) return; toggleOpen(p.id); });
      name.addEventListener('dblclick', function (e) { e.stopPropagation(); startRename(name, node, p, 'name'); });
      edit.addEventListener('click', function (e) { e.stopPropagation(); startRename(name, node, p, 'name'); });
      add.addEventListener('click', function (e) {
        e.stopPropagation();
        openAddMenu(add, [
          { label: 'Chapter', sub: 'A new chapter in this book', action: function () { addChapter(p.id, null); } },
          { label: 'Part',    sub: 'A group of chapters (Part 1, Part 2…)', action: function () { addPart(p.id); } }
        ]);
      });
      del.addEventListener('click', function (e) { e.stopPropagation(); deleteProject(p.id); });
      node.appendChild(row);
      if (isOpen) {
        var kids = el('div', 'children'); kids.dataset.group = 'projectChildren:' + p.id;
        // Top-level chapters first
        if (!p.chapters.length && !(p.parts || []).length) { var em = el('div', 'tree-empty'); em.textContent = 'No chapters yet'; kids.appendChild(em); }
        p.chapters.forEach(function (c) { kids.appendChild(chapterNode(c, p, null)); });
        (p.parts || []).forEach(function (pt) { kids.appendChild(partNode(pt, p)); });
        node.appendChild(kids);
      }
      projectsPanel.appendChild(node);
    });
  }
  function partNode(pt, project) {
    var node = el('div', 'node'); node.dataset.id = pt.id; node.draggable = true; wireDrag(node);
    var isOpen = !!data.open[pt.id];
    var row = el('div', 'row part-row' + (isOpen ? ' open' : ''));
    var name = el('span', 'row-name'); name.textContent = pt.name || 'Untitled part';
    var edit = editBtn('Rename part'); var add = addBtn('Add chapter'); var del = delBtn('Delete part');
    row.append(caretEl(false), name, edit, add, del);
    row.addEventListener('click', function (e) { if (e.target === add || e.target === del) return; toggleOpen(pt.id); });
    name.addEventListener('dblclick', function (e) { e.stopPropagation(); startRename(name, node, pt, 'name'); });
    edit.addEventListener('click', function (e) { e.stopPropagation(); startRename(name, node, pt, 'name'); });
    add.addEventListener('click', function (e) { e.stopPropagation(); addChapter(project.id, pt.id); });
    del.addEventListener('click', function (e) { e.stopPropagation(); deletePart(pt.id); });
    node.appendChild(row);
    if (isOpen) {
      var kids = el('div', 'children'); kids.dataset.group = 'chapters:' + pt.id;
      if (!pt.chapters.length) { var em = el('div', 'tree-empty'); em.textContent = 'No chapters yet'; kids.appendChild(em); }
      pt.chapters.forEach(function (c) { kids.appendChild(chapterNode(c, project, pt)); });
      node.appendChild(kids);
    }
    return node;
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
  function addChapter(projectId, partId) {
    flush();
    var p = findProject(projectId); if (!p) return;
    var container = p.chapters;
    var pt = null;
    if (partId) {
      pt = findPart(partId);
      if (pt) container = pt.chapters;
    }
    // Number across ALL chapters in this project so chapter numbering stays sequential
    var totalChapters = 0; walkChapters(p, function () { totalChapters++; });
    var scene = { id: newId(), header: '', subheader: '', body: '' };
    var chap = { id: newId(), title: 'Chapter ' + (totalChapters + 1), scenes: [scene] };
    container.push(chap);
    data.open[p.id] = true;
    if (pt) data.open[pt.id] = true;
    data.open[chap.id] = true;
    data.tab = 'projects'; data.sel.scene = scene.id;
    persist(); renderAll(); loadEditor(); docHeader.focus();
  }
  function addPart(projectId) {
    flush();
    var p = findProject(projectId); if (!p) return;
    if (!Array.isArray(p.parts)) p.parts = [];
    var part = { id: newId(), name: 'Part ' + (p.parts.length + 1), chapters: [] };
    p.parts.push(part);
    data.open[p.id] = true; data.open[part.id] = true;
    data.tab = 'projects';
    persist(); renderAll();
  }
  function deletePart(id) {
    var ctx = findPartCtx(id); if (!ctx) return;
    var pt = ctx.part;
    trashPush('part', pt.name, pt, { type: 'project', id: ctx.project.id });
    ctx.project.parts = ctx.project.parts.filter(function (x) { return x.id !== id; });
    afterDelete(); showUndoToast('Deleted "' + (pt.name || 'Untitled part') + '"');
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
  // Soft-delete: move to trash with enough context to restore. Show undo toast.
  function trashPush(kind, name, payload, where) {
    data.trash.push({ id: newId(), kind: kind, name: name || 'Untitled', date: Date.now(), payload: payload, where: where || null });
  }
  function deleteNote(id) {
    var n = findNote(id); if (!n) return;
    trashPush('note', n.title, n, null);
    data.notes = data.notes.filter(function (x) { return x.id !== id; });
    afterDelete(); showUndoToast('Deleted "' + (n.title || 'Untitled note') + '"');
  }
  function deleteProject(id) {
    var p = findProject(id); if (!p) return;
    trashPush('project', p.name, p, null);
    data.projects = data.projects.filter(function (x) { return x.id !== id; });
    afterDelete(); showUndoToast('Deleted "' + (p.name || 'Untitled project') + '"');
  }
  function deleteChapter(id) {
    var ctx = findChapterCtx(id); if (!ctx) return;
    var container = ctx.part ? ctx.part.chapters : ctx.project.chapters;
    var where = ctx.part ? { type: 'part', id: ctx.part.id, projectId: ctx.project.id } : { type: 'project', id: ctx.project.id };
    trashPush('chapter', ctx.chapter.title, ctx.chapter, where);
    var idx = container.indexOf(ctx.chapter);
    if (idx >= 0) container.splice(idx, 1);
    afterDelete(); showUndoToast('Deleted "' + (ctx.chapter.title || 'Untitled chapter') + '"');
  }
  function deleteScene(id) {
    var ctx = findSceneCtx(id); if (!ctx) return;
    var idx = ctx.chapter.scenes.indexOf(ctx.scene);
    trashPush('scene', ctx.scene.header, ctx.scene, { type: 'chapter', id: ctx.chapter.id });
    if (idx >= 0) ctx.chapter.scenes.splice(idx, 1);
    afterDelete(); showUndoToast('Deleted "' + (ctx.scene.header || 'Untitled scene') + '"');
  }

  // ═══ Trash & undo ═══
  var TRASH_ICONS = {
    note:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>',
    project: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
    chapter: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4z"/><path d="M4 16h16"/></svg>',
    scene:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>'
  };
  function renderTrash() {
    if (!trashPanel) return;
    trashPanel.innerHTML = '';
    if (!data.trash.length) { trashPanel.innerHTML = '<div class="tree-empty">Nothing in the trash.<br>Deleted items wait here so you can put them back.</div>'; return; }
    data.trash.slice().reverse().forEach(function (t) {
      var node = el('div', 'node');
      var row = el('div', 'row trash-row');
      var kind = el('span', 'trash-kind'); kind.innerHTML = TRASH_ICONS[t.kind] || TRASH_ICONS.note;
      var name = el('span', 'row-name'); name.textContent = t.name || 'Untitled';
      var meta = el('span', 'trash-meta'); meta.textContent = dateStr(t.date);
      var res = el('button', 'row-restore'); res.type = 'button'; res.title = 'Restore';
      res.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v6h6"/></svg>';
      var del = delBtn('Delete forever');
      row.append(kind, name, meta, res, del);
      res.addEventListener('click', function (e) { e.stopPropagation(); restoreOne(t.id); });
      del.addEventListener('click', function (e) { e.stopPropagation(); deleteForever(t); });
      node.appendChild(row);
      trashPanel.appendChild(node);
    });
  }
  function restoreItem(t) {
    if (!t) return;
    if (t.kind === 'note') {
      data.notes.push(t.payload);
      data.sel.note = t.payload.id; data.tab = 'notes';
    } else if (t.kind === 'project') {
      data.projects.push(t.payload);
      data.open[t.payload.id] = true;
      var firstSc = (t.payload.chapters && t.payload.chapters[0] && t.payload.chapters[0].scenes && t.payload.chapters[0].scenes[0]) || null;
      if (firstSc) data.sel.scene = firstSc.id;
      data.tab = 'projects';
    } else if (t.kind === 'chapter') {
      // Chapter may have lived in a part or directly in a project
      var container = null, project = null;
      if (t.where && t.where.type === 'part') {
        var pt = findPart(t.where.id);
        if (pt) { container = pt.chapters; project = (findPartCtx(pt.id) || {}).project; data.open[pt.id] = true; }
      } else if (t.where && t.where.type === 'project') {
        var p = findProject(t.where.id);
        if (p) { container = p.chapters; project = p; }
      }
      if (container && project) {
        container.push(t.payload); data.open[project.id] = true; data.open[t.payload.id] = true;
        var fs2 = t.payload.scenes && t.payload.scenes[0]; if (fs2) data.sel.scene = fs2.id;
        data.tab = 'projects';
      } else {
        // Orphan: convert chapter to a note
        var combined = (t.payload.scenes || []).map(function (s) { var bits = []; if (s.header) bits.push('<h3>' + esc(s.header) + '</h3>'); if (s.subheader) bits.push('<p><em>' + esc(s.subheader) + '</em></p>'); if (s.body) bits.push(s.body); return bits.join(''); }).join('<hr>');
        var note = { id: newId(), title: (t.payload.title || 'Untitled chapter') + ' (restored)', body: combined };
        data.notes.push(note); data.sel.note = note.id; data.tab = 'notes';
      }
    } else if (t.kind === 'part') {
      var p2 = t.where && findProject(t.where.id);
      if (p2) {
        if (!Array.isArray(p2.parts)) p2.parts = [];
        p2.parts.push(t.payload);
        data.open[p2.id] = true; data.open[t.payload.id] = true;
        var firstC = t.payload.chapters && t.payload.chapters[0];
        if (firstC && firstC.scenes && firstC.scenes[0]) data.sel.scene = firstC.scenes[0].id;
        data.tab = 'projects';
      } else {
        // Orphan: convert part to a note (flatten its chapters' scenes)
        var combinedP = (t.payload.chapters || []).map(function (c) {
          var chBits = ['<h2>' + esc(c.title || 'Untitled chapter') + '</h2>'];
          (c.scenes || []).forEach(function (s) {
            if (s.header) chBits.push('<h3>' + esc(s.header) + '</h3>');
            if (s.subheader) chBits.push('<p><em>' + esc(s.subheader) + '</em></p>');
            if (s.body) chBits.push(s.body);
          });
          return chBits.join('');
        }).join('<hr>');
        var pNote = { id: newId(), title: (t.payload.name || 'Untitled part') + ' (restored)', body: combinedP };
        data.notes.push(pNote); data.sel.note = pNote.id; data.tab = 'notes';
      }
    } else if (t.kind === 'scene') {
      var c = t.where && findChapter(t.where.id);
      if (c) {
        c.scenes.push(t.payload); data.open[c.id] = true;
        data.sel.scene = t.payload.id; data.tab = 'projects';
      } else {
        var n2 = { id: newId(), title: (t.payload.header || 'Untitled scene') + ' (restored)', body: t.payload.body || '' };
        data.notes.push(n2); data.sel.note = n2.id; data.tab = 'notes';
      }
    }
    persist(); renderAll(); loadEditor();
  }
  function restoreOne(trashId) {
    var i = -1;
    for (var k = 0; k < data.trash.length; k++) if (data.trash[k].id === trashId) { i = k; break; }
    if (i < 0) return;
    var t = data.trash.splice(i, 1)[0];
    restoreItem(t);
  }
  function deleteForever(t) {
    confirmDanger('Delete this forever?', '"' + (t.name || 'Untitled') + '" will be gone for good — this can’t be undone.', function () {
      data.trash = data.trash.filter(function (x) { return x.id !== t.id; });
      persist(); renderAll();
    });
  }
  function emptyTrash() {
    confirmDanger('Empty the trash?', 'Everything in the trash will be gone for good — this can’t be undone.', function () {
      data.trash = []; persist(); renderAll();
    });
  }

  // Undo toast
  var toastEl = null, toastTimer = null, toastFadeTimer = null;
  function clearToastTimers() {
    if (toastTimer) { clearTimeout(toastTimer); toastTimer = null; }
    if (toastFadeTimer) { clearTimeout(toastFadeTimer); toastFadeTimer = null; }
  }
  function showUndoToast(msg) {
    clearToastTimers();
    if (toastEl) { toastEl.remove(); toastEl = null; }
    toastEl = el('div', 'undo-toast');
    var span = el('span', 'undo-msg'); span.textContent = msg;
    var btn = el('button', 'undo-btn'); btn.type = 'button'; btn.textContent = 'Undo';
    toastEl.append(span, btn);
    document.body.appendChild(toastEl);
    btn.addEventListener('click', function () {
      if (!data.trash.length) { hideToast(); return; }
      var t = data.trash.pop();
      restoreItem(t);
      hideToast();
    });
    toastTimer = setTimeout(function () {
      if (!toastEl) return;
      toastEl.classList.add('fade');
      toastFadeTimer = setTimeout(function () { if (toastEl) { toastEl.remove(); toastEl = null; } }, 220);
    }, 6000);
  }
  function hideToast() {
    clearToastTimers();
    if (toastEl) { toastEl.remove(); toastEl = null; }
  }

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
    else if (key.indexOf('projectChildren:') === 0) {
      // Project's mixed children: top-level chapters + parts. Split back into the two arrays.
      var pp = findProject(key.slice('projectChildren:'.length));
      if (pp) {
        var newChapters = [], newParts = [];
        var oldChapters = pp.chapters || [], oldParts = pp.parts || [];
        ids.forEach(function (id) {
          for (var i = 0; i < oldChapters.length; i++) if (oldChapters[i].id === id) { newChapters.push(oldChapters[i]); return; }
          for (var j = 0; j < oldParts.length; j++) if (oldParts[j].id === id) { newParts.push(oldParts[j]); return; }
        });
        pp.chapters = newChapters; pp.parts = newParts;
      }
    }
    else if (key.indexOf('chapters:') === 0) {
      // Chapters inside a part
      var pt = findPart(key.slice('chapters:'.length));
      if (pt) pt.chapters = reorder(pt.chapters, ids);
    }
    else if (key.indexOf('scenes:') === 0) { var c = findChapter(key.slice('scenes:'.length)); if (c) c.scenes = reorder(c.scenes, ids); }
    persist();
  }

  // ═══ Editor ═══
  function loadEditor() {
    if (data.tab === 'trash') {
      docEl.hidden = true; emptyState.hidden = false;
      emptyText.textContent = data.trash.length ? 'Pick an item to restore — or empty the trash below.' : 'Trash is empty.';
      document.body.classList.remove('mode-note');
      updateWordCount();
      return;
    }
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

  // ═══ Download (RTF manuscript export) ═══
  // Open the "where to save" dropdown
  if (downloadBtn) {
    downloadBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (!dlMenu) return;
      if (dlMenu.hidden) {
        var r = downloadBtn.getBoundingClientRect();
        dlMenu.style.top = (r.bottom + 6) + 'px';
        dlMenu.style.left = Math.max(8, r.right - 240) + 'px';
        dlMenu.hidden = false;
        downloadBtn.classList.add('on');
      } else {
        dlMenu.hidden = true;
        downloadBtn.classList.remove('on');
      }
    });
  }
  if (dlMenu) {
    dlMenu.addEventListener('click', function (e) {
      var btn = e.target.closest('.dl-item');
      if (!btn) return;
      dlMenu.hidden = true;
      if (downloadBtn) downloadBtn.classList.remove('on');
      var dest = btn.dataset.dest;
      flush(); persist();
      if (dest === 'backup') { doDownloadBackup(); return; }
      if (dest === 'drive')  { doDownloadDrive(); return; }
      // 'device' — depends on what's selected
      if (data.tab === 'notes') {
        var n = findNote(data.sel.note);
        if (n) doDownloadNote(n);
        else doDownloadBackup();
      } else {
        var p = currentProject();
        if (p) doDownloadDevice(p);
        else doDownloadBackup();
      }
    });
  }
  document.addEventListener('click', function (e) {
    if (!dlMenu || dlMenu.hidden) return;
    if (e.target.closest('#dlMenu') || (downloadBtn && (e.target === downloadBtn || downloadBtn.contains(e.target)))) return;
    dlMenu.hidden = true;
    if (downloadBtn) downloadBtn.classList.remove('on');
  });

  // ── Tiny floating add-menu (used by + on a project to pick Chapter or Part) ──
  function closeAddMenu() {
    var m = document.querySelector('.popup-menu'); if (m) m.remove();
    document.removeEventListener('click', _addMenuOutside, true);
  }
  function _addMenuOutside(e) {
    var m = document.querySelector('.popup-menu');
    if (!m) return;
    if (m.contains(e.target)) return;
    closeAddMenu();
  }
  function openAddMenu(anchorBtn, items) {
    closeAddMenu();
    var menu = el('div', 'popup-menu');
    items.forEach(function (it) {
      var b = el('button', 'popup-item'); b.type = 'button';
      var line1 = el('span', 'popup-name'); line1.textContent = it.label;
      b.appendChild(line1);
      if (it.sub) { var line2 = el('span', 'popup-sub'); line2.textContent = it.sub; b.appendChild(line2); }
      b.addEventListener('click', function (e) { e.stopPropagation(); closeAddMenu(); it.action(); });
      menu.appendChild(b);
    });
    document.body.appendChild(menu);
    var r = anchorBtn.getBoundingClientRect();
    var mw = menu.offsetWidth || 200;
    menu.style.top = (r.bottom + 4) + 'px';
    menu.style.left = Math.max(8, Math.min(window.innerWidth - mw - 8, r.right - mw)) + 'px';
    // Defer the outside-click listener so the click that opened the menu doesn't immediately close it
    setTimeout(function () { document.addEventListener('click', _addMenuOutside, true); }, 0);
  }

  // ── RTF helpers ──
  // Escape \ { } and convert non-ASCII to \uNNNN? form (Word reads this fine).
  function rtfEscapeText(s) {
    s = String(s || '');
    var out = '';
    for (var i = 0; i < s.length; i++) {
      var c = s.charAt(i);
      var code = s.charCodeAt(i);
      if (c === '\\' || c === '{' || c === '}') out += '\\' + c;
      else if (code < 128) out += c;
      else {
        var v = code > 32767 ? code - 65536 : code;
        out += '\\u' + v + '?';
      }
    }
    return out;
  }
  // Walk a DOM node, emit RTF inline runs. Strips background colour (highlights).
  function inlineToRtf(node) {
    if (node.nodeType === 3) return rtfEscapeText(node.textContent);
    if (node.nodeType !== 1) return '';
    var tag = node.tagName.toLowerCase();
    if (tag === 'br') return '\\line ';
    var inner = '';
    for (var i = 0; i < node.childNodes.length; i++) inner += inlineToRtf(node.childNodes[i]);
    if (tag === 'b' || tag === 'strong') return '{\\b ' + inner + '}';
    if (tag === 'i' || tag === 'em') return '{\\i ' + inner + '}';
    if (tag === 'u') return '{\\ul ' + inner + '}';
    if (tag === 's' || tag === 'strike' || tag === 'del') return '{\\strike ' + inner + '}';
    // span/font/mark + everything else: keep content, drop formatting (so highlights vanish).
    return inner;
  }
  // Convert HTML body to RTF paragraphs. First paragraph is flush (no indent),
  // every subsequent paragraph indents 0.5".
  function htmlBodyToRtfParagraphs(html) {
    var div = document.createElement('div');
    div.innerHTML = html || '';
    var paragraphs = [];
    var topLevelP = false;
    for (var i = 0; i < div.childNodes.length; i++) {
      var n = div.childNodes[i];
      if (n.nodeType === 1 && n.tagName.toLowerCase() === 'p') { topLevelP = true; break; }
    }
    if (topLevelP) {
      for (var j = 0; j < div.childNodes.length; j++) {
        var nn = div.childNodes[j];
        if (nn.nodeType === 1 && nn.tagName.toLowerCase() === 'p') paragraphs.push(inlineToRtf(nn));
        else if (nn.nodeType === 3 && nn.textContent.trim()) paragraphs.push(rtfEscapeText(nn.textContent));
        // bare <br> or whitespace between <p>s: ignore
      }
    } else {
      // No top-level <p>: treat the whole lump as one paragraph
      var lump = inlineToRtf(div);
      if (lump) paragraphs.push(lump);
    }
    if (!paragraphs.length) return '';
    var out = '';
    paragraphs.forEach(function (p, idx) {
      var indent = idx === 0 ? '\\fi0' : '\\fi720';
      out += '\\pard' + indent + ' ' + p + '\\par\n';
    });
    return out;
  }
  // Build the full RTF for a project: title page, chapters on new pages, scenes inside.
  // Parts (if any) get their own heading page between groups of chapters.
  function emitChapterRtf(ch, isFirstInGroup) {
    var s = '';
    if (!isFirstInGroup) s += '\\page\n';
    s += '\\pard\\qc\\sb720\\sa480\\fs32\\b ' + rtfEscapeText((ch.title || 'Untitled chapter').trim()) + '\\b0\\fs24\\par\n';
    (ch.scenes || []).forEach(function (sc, si) {
      var hasHeader = (sc.header && sc.header.trim());
      var hasSub = (sc.subheader && sc.subheader.trim());
      if (si > 0 && !hasHeader && !hasSub) s += '\\pard\\qc\\sb240\\sa240 #\\par\n';
      if (hasHeader) s += '\\pard\\qc\\sb360\\sa120\\b ' + rtfEscapeText(sc.header) + '\\b0\\par\n';
      if (hasSub)   s += '\\pard\\qc\\sa180\\i ' + rtfEscapeText(sc.subheader) + '\\i0\\par\n';
      s += htmlBodyToRtfParagraphs(sc.body || '');
    });
    return s;
  }
  function generateProjectRtf(project) {
    var name = project.name || 'Untitled project';
    var s = '';
    s += '{\\rtf1\\ansi\\ansicpg1252\\deff0\n';
    s += '{\\fonttbl{\\f0 Times New Roman;}}\n';
    s += '\\paperw12240\\paperh15840\\margl1440\\margr1440\\margt1440\\margb1440\n';
    s += '\\sectd\\fs24\\sl480\\slmult1\n';
    s += '\\pard\\qc\\sb2880\\fs48\\b ' + rtfEscapeText(name) + '\\b0\\fs24\\par\n';
    s += '\\page\n';
    var firstChapterEmitted = false;
    // Top-level chapters first
    (project.chapters || []).forEach(function (ch) {
      s += emitChapterRtf(ch, !firstChapterEmitted);
      firstChapterEmitted = true;
    });
    // Then parts (each one gets its own heading page)
    (project.parts || []).forEach(function (pt) {
      if (firstChapterEmitted) s += '\\page\n';
      s += '\\pard\\qc\\sb2880\\fs44\\b ' + rtfEscapeText(pt.name || 'Part') + '\\b0\\fs24\\par\n';
      s += '\\page\n';
      var firstInPart = true;
      (pt.chapters || []).forEach(function (ch) {
        s += emitChapterRtf(ch, firstInPart);
        firstInPart = false; firstChapterEmitted = true;
      });
    });
    s += '}\n';
    return s;
  }
  // Trigger a browser download AND save a copy into Files → Documents.
  function doDownloadDevice(project) {
    var rtf = generateProjectRtf(project);
    var base = (project.name || 'manuscript').replace(/[\/\\:*?"<>|]+/g, '_').trim() || 'manuscript';
    var blob = new Blob([rtf], { type: 'application/rtf' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = base + '.rtf';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    saveToFilesDocuments(base, rtf);
  }
  function saveToFilesDocuments(name, content) {
    var files;
    try { files = JSON.parse(localStorage.getItem('qh-files')) || {}; } catch (e) { files = {}; }
    if (!Array.isArray(files.documents)) files.documents = [];
    if (!Array.isArray(files.pictures)) files.pictures = [];
    if (!Array.isArray(files.trash)) files.trash = [];
    files.documents.push({
      id: 'f' + Math.random().toString(36).slice(2, 9),
      name: name,
      date: Date.now(),
      format: 'rtf',
      content: content
    });
    try { localStorage.setItem('qh-files', JSON.stringify(files)); }
    catch (e) {
      // Out of room — pop and warn
      files.documents.pop();
      if (window.qhConfirm) window.qhConfirm({
        title: 'Not enough room',
        message: 'The download worked, but there wasn’t space to also save a copy in Files. Free up some pictures first.',
        confirmText: 'OK'
      });
    }
  }
  function doDownloadDrive() {
    var QHDrive = (window.parent && window.parent !== window && window.parent.QHDrive) || window.QHDrive || null;
    if (!QHDrive) {
      if (window.qhConfirm) window.qhConfirm({ title: 'Drive isn\'t available here', message: 'Open the writing app from inside Quill Haven (the home screen) so it can reach the Drive setup.', confirmText: 'OK' });
      return;
    }
    if (!QHDrive.hasClientId()) {
      if (window.qhConfirm) window.qhConfirm({
        title: 'Connect Google Drive first',
        message: 'Open the home screen, tap the cog, find Google Drive, and paste your OAuth Client ID. One-time setup — see docs/DRIVE_SETUP.md for the steps. Then come back and try Drive again.',
        confirmText: 'OK'
      });
      return;
    }
    var blob = generateFullBackupZip();
    var when = new Date();
    var stamp = when.getFullYear() + '-' + String(when.getMonth() + 1).padStart(2, '0') + '-' + String(when.getDate()).padStart(2, '0') + '_' + String(when.getHours()).padStart(2, '0') + String(when.getMinutes()).padStart(2, '0');
    var name = 'quill-haven-backup-' + stamp + '.zip';
    QHDrive.uploadFile(name, blob, 'application/zip').then(function (file) {
      if (window.qhConfirm) window.qhConfirm({ title: 'Saved to Drive', message: '"' + (file.name || name) + '" is now in your Google Drive.', confirmText: 'OK' });
    }).catch(function (err) {
      if (window.qhConfirm) window.qhConfirm({ title: 'Drive save failed', message: String(err && err.message || err), confirmText: 'OK' });
    });
  }
  // Export a single note as its own .rtf manuscript
  function generateNoteRtf(note) {
    var s = '';
    s += '{\\rtf1\\ansi\\ansicpg1252\\deff0\n';
    s += '{\\fonttbl{\\f0 Times New Roman;}}\n';
    s += '\\paperw12240\\paperh15840\\margl1440\\margr1440\\margt1440\\margb1440\n';
    s += '\\sectd\\fs24\\sl480\\slmult1\n';
    s += '\\pard\\qc\\sb720\\sa360\\fs36\\b ' + rtfEscapeText(note.title || 'Untitled note') + '\\b0\\fs24\\par\n';
    s += htmlBodyToRtfParagraphs(note.body || '');
    s += '}\n';
    return s;
  }
  function doDownloadNote(note) {
    var rtf = generateNoteRtf(note);
    var base = (note.title || 'Untitled note').replace(/[\/\\:*?"<>|]+/g, '_').trim() || 'Untitled note';
    var blob = new Blob([rtf], { type: 'application/rtf' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = base + '.rtf';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    saveToFilesDocuments(base, rtf);
  }

  // ═══ Zip generator — store-only (no compression), pure JS, no library ═══
  // Builds a single Blob from a list of { name, data: Uint8Array } files.
  var ZIP_CRC_TABLE = (function () {
    var t = new Uint32Array(256);
    for (var i = 0; i < 256; i++) {
      var c = i;
      for (var k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[i] = c >>> 0;
    }
    return t;
  })();
  function zipCrc32(bytes) {
    var c = 0xFFFFFFFF;
    for (var i = 0; i < bytes.length; i++) c = ZIP_CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }
  function zipUtf8(s) { return new TextEncoder().encode(s); }
  function zipBuild(files, when) {
    when = when || new Date();
    var dt = ((when.getHours() & 0x1F) << 11) | ((when.getMinutes() & 0x3F) << 5) | ((when.getSeconds() >> 1) & 0x1F);
    var dd = (((when.getFullYear() - 1980) & 0x7F) << 9) | (((when.getMonth() + 1) & 0xF) << 5) | (when.getDate() & 0x1F);
    var parts = [], central = [], offset = 0;
    files.forEach(function (f) {
      var nameBytes = zipUtf8(f.name);
      var crc = zipCrc32(f.data);
      var size = f.data.length;
      var lfh = new ArrayBuffer(30 + nameBytes.length);
      var v = new DataView(lfh);
      v.setUint32(0, 0x04034b50, true);
      v.setUint16(4, 20, true);      // version needed
      v.setUint16(6, 0x0800, true);  // flags (UTF-8)
      v.setUint16(8, 0, true);       // method = stored
      v.setUint16(10, dt, true);
      v.setUint16(12, dd, true);
      v.setUint32(14, crc, true);
      v.setUint32(18, size, true);
      v.setUint32(22, size, true);
      v.setUint16(26, nameBytes.length, true);
      v.setUint16(28, 0, true);
      new Uint8Array(lfh, 30).set(nameBytes);
      parts.push(new Uint8Array(lfh));
      parts.push(f.data);
      var cdh = new ArrayBuffer(46 + nameBytes.length);
      var cv = new DataView(cdh);
      cv.setUint32(0, 0x02014b50, true);
      cv.setUint16(4, 20, true);
      cv.setUint16(6, 20, true);
      cv.setUint16(8, 0x0800, true);
      cv.setUint16(10, 0, true);
      cv.setUint16(12, dt, true);
      cv.setUint16(14, dd, true);
      cv.setUint32(16, crc, true);
      cv.setUint32(20, size, true);
      cv.setUint32(24, size, true);
      cv.setUint16(28, nameBytes.length, true);
      cv.setUint16(30, 0, true);
      cv.setUint16(32, 0, true);
      cv.setUint16(34, 0, true);
      cv.setUint16(36, 0, true);
      cv.setUint32(38, 0, true);
      cv.setUint32(42, offset, true);
      new Uint8Array(cdh, 46).set(nameBytes);
      central.push(new Uint8Array(cdh));
      offset += 30 + nameBytes.length + size;
    });
    var cdOffset = offset, cdSize = 0;
    central.forEach(function (p) { parts.push(p); cdSize += p.length; });
    var eocd = new ArrayBuffer(22);
    var ev = new DataView(eocd);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(4, 0, true);
    ev.setUint16(6, 0, true);
    ev.setUint16(8, files.length, true);
    ev.setUint16(10, files.length, true);
    ev.setUint32(12, cdSize, true);
    ev.setUint32(16, cdOffset, true);
    ev.setUint16(20, 0, true);
    parts.push(new Uint8Array(eocd));
    return new Blob(parts, { type: 'application/zip' });
  }

  // Build the full-backup zip — every project as a Word file, every note too,
  // plus the raw .json so the whole thing can be restored to a new device.
  function generateFullBackupZip() {
    var enc = new TextEncoder();
    var files = [];
    var when = new Date();
    var dateStrShort = when.getFullYear() + '-' + String(when.getMonth() + 1).padStart(2, '0') + '-' + String(when.getDate()).padStart(2, '0');
    var readme = [
      'Quill Haven backup — ' + dateStrShort,
      '',
      'This .zip is a full copy of your Quill Haven writing app.',
      '',
      'Projects/  — every book, one Word file (.rtf) per book',
      'Notes/     — every note, one Word file (.rtf) per note',
      'quill-haven-backup.json  — the raw data for restoring everything onto a',
      '                          new Quill Haven device (you can ignore this file,',
      '                          but keep it safe)',
      '',
      'To READ a book or a note: open the .rtf file in Microsoft Word, Google Docs,',
      '                          Pages, LibreOffice — anything that opens Word docs.',
      '',
      'To RESTORE on a fresh Quill Haven: drag quill-haven-backup.json into the',
      '                                   writing app (import button coming soon).',
      ''
    ].join('\n');
    files.push({ name: 'README.txt', data: enc.encode(readme) });
    var usedNames = {};
    function uniqueName(base, ext) {
      var safe = (base || 'Untitled').replace(/[\/\\:*?"<>|]+/g, '_').trim() || 'Untitled';
      var n = safe + ext, i = 2;
      while (usedNames[n]) { n = safe + ' (' + i + ')' + ext; i++; }
      usedNames[n] = true;
      return n;
    }
    (data.projects || []).forEach(function (p) {
      var name = uniqueName(p.name || 'Untitled project', '.rtf');
      files.push({ name: 'Projects/' + name, data: enc.encode(generateProjectRtf(p)) });
    });
    var usedNoteNames = {};
    function uniqueNoteName(base, ext) {
      var safe = (base || 'Untitled note').replace(/[\/\\:*?"<>|]+/g, '_').trim() || 'Untitled note';
      var n = safe + ext, i = 2;
      while (usedNoteNames[n]) { n = safe + ' (' + i + ')' + ext; i++; }
      usedNoteNames[n] = true;
      return n;
    }
    (data.notes || []).forEach(function (n) {
      var name = uniqueNoteName(n.title || 'Untitled note', '.rtf');
      files.push({ name: 'Notes/' + name, data: enc.encode(generateNoteRtf(n)) });
    });
    // Raw backup for restore. Include the writing data, plus a snapshot of qh-files
    // so pictures/documents are recoverable too.
    var raw = { format: 'quill-haven-backup', version: 1, exportedAt: when.toISOString(), writing: data };
    try { var f = JSON.parse(localStorage.getItem('qh-files') || 'null'); if (f) raw.files = f; } catch (e) {}
    files.push({ name: 'quill-haven-backup.json', data: enc.encode(JSON.stringify(raw, null, 2)) });
    return zipBuild(files, when);
  }
  function doDownloadBackup() {
    var blob = generateFullBackupZip();
    var when = new Date();
    var stamp = when.getFullYear() + '-' + String(when.getMonth() + 1).padStart(2, '0') + '-' + String(when.getDate()).padStart(2, '0');
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = 'quill-haven-backup-' + stamp + '.zip';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

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

  // ── Cleanup toast on page leave ──
  window.addEventListener('beforeunload', hideToast);

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
