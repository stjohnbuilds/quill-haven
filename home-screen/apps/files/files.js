/* ───────────────────────────────────────────────
   Files app — logic.
   - Documents: manuscripts you download from the writing app
   - Pictures: upload an image, set it as your home-screen background
   - Trash: restore or delete-forever
   - Downloads / USB: real on the installed device (placeholder here)
   Everything saves to the device (localStorage).
─────────────────────────────────────────────── */
(function () {
  'use strict';

  // ── Theme sync ──
  var THEMES = ['purple', 'wood', 'grey', 'dark'];
  function applyTheme() {
    var t = 'purple';
    try { t = localStorage.getItem('qh-theme') || 'purple'; } catch (e) {}
    if (THEMES.indexOf(t) < 0) t = 'purple';
    document.body.classList.remove('theme-wood', 'theme-grey', 'theme-dark');
    if (t !== 'purple') document.body.classList.add('theme-' + t);
  }

  // ── Storage ──
  var STORE = 'qh-files';
  function newId() { return 'f' + Math.random().toString(36).slice(2, 9); }
  var data;
  try { data = JSON.parse(localStorage.getItem(STORE)); } catch (e) { data = null; }
  if (!data || typeof data !== 'object') data = {};
  if (!Array.isArray(data.documents)) data.documents = [];
  if (!Array.isArray(data.pictures)) data.pictures = [];
  if (!Array.isArray(data.trash)) data.trash = [];
  if (!data.folders || typeof data.folders !== 'object') data.folders = {};
  if (!Array.isArray(data.folders.documents)) data.folders.documents = [];
  if (!Array.isArray(data.folders.pictures)) data.folders.pictures = [];
  function persist() { try { localStorage.setItem(STORE, JSON.stringify(data)); return true; } catch (e) { return false; } }
  function getBg() { try { return localStorage.getItem('qh-bg') || ''; } catch (e) { return ''; } }
  function setBgStore(v) { try { if (v) localStorage.setItem('qh-bg', v); else localStorage.removeItem('qh-bg'); } catch (e) {} }

  // Which sub-folder is currently open inside Documents/Pictures (null = root)
  var currentSub = null;
  function foldersOf(section) { return (data.folders && data.folders[section]) || []; }
  function findFolder(section, id) { return foldersOf(section).filter(function (f) { return f.id === id; })[0] || null; }
  function itemsInCurrent(arr, section) {
    var ids = {}; foldersOf(section).forEach(function (f) { ids[f.id] = true; });
    if (!currentSub) return arr.filter(function (it) { return !it.folder || !ids[it.folder]; });
    return arr.filter(function (it) { return it.folder === currentSub; });
  }

  // ── Icons ──
  var I = {
    documents: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
    pictures: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
    downloads: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',
    usb: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M10 6h4"/><circle cx="12" cy="16" r="1.4"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>'
  };
  function svg(name, px) {
    return '<svg width="' + (px || 18) + '" height="' + (px || 18) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + I[name] + '</svg>';
  }

  var FOLDERS = [
    { id: 'documents', name: 'Documents' },
    { id: 'pictures', name: 'Pictures' },
    { id: 'downloads', name: 'Downloads', device: true },
    { id: 'usb', name: 'USB', device: true },
    { id: 'trash', name: 'Trash' }
  ];
  var current = 'documents';
  // Icon for sub-folders (different from the section icons in I above)
  var FOLDER_OPEN_ICON = '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>';

  // ── Elements ──
  var foldersEl = document.getElementById('folders');
  var gridEl = document.getElementById('grid');
  var emptyEl = document.getElementById('empty');
  var emptyIcon = document.getElementById('emptyIcon');
  var emptyText = document.getElementById('emptyText');
  var barTitle = document.getElementById('barTitle');
  var barHint = document.getElementById('barHint');
  var barAction = document.getElementById('barAction');
  var picInput = document.getElementById('picInput');

  function el(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }
  function esc(s) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function dateStr(ms) { var d = new Date(ms); var mo = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; return mo[d.getMonth()] + ' ' + d.getDate(); }
  function confirmDanger(title, message, confirmText, onYes) {
    if (window.qhConfirm) window.qhConfirm({ title: title, message: message, confirmText: confirmText, danger: true, onConfirm: onYes });
    else if (window.confirm(title + (message ? '\n' + message : ''))) onYes();
  }

  function renderFolders() {
    foldersEl.innerHTML = '';
    FOLDERS.forEach(function (f) {
      var b = el('button', 'folder' + (f.id === current ? ' active' : '') + (f.device ? ' device' : ''));
      b.type = 'button';
      var count = f.id === 'documents' ? data.documents.length : f.id === 'pictures' ? data.pictures.length : f.id === 'trash' ? data.trash.length : 0;
      b.innerHTML = svg(f.id, 17) + '<span>' + f.name + '</span>' + (count ? '<span class="folder-tag">' + count + '</span>' : '');
      b.addEventListener('click', function () { current = f.id; currentSub = null; render(); });
      foldersEl.appendChild(b);
    });
  }

  function showEmpty(icon, text, actionLabel, actionFn) {
    gridEl.hidden = true; emptyEl.hidden = false;
    emptyIcon.innerHTML = svg(icon, 54);
    emptyText.textContent = text;
    var old = emptyEl.querySelector('.bar-action'); if (old) old.remove();
    if (actionLabel) {
      var b = el('button', 'bar-action'); b.type = 'button'; b.textContent = actionLabel;
      b.addEventListener('click', actionFn); emptyEl.appendChild(b);
    }
  }
  function showGrid() { gridEl.hidden = false; emptyEl.hidden = true; }

  function render() {
    renderFolders();
    var f = FOLDERS.filter(function (x) { return x.id === current; })[0];
    barTitle.textContent = f.name;
    barAction.hidden = true; barAction.className = 'bar-action';
    if (barHint) { barHint.hidden = true; barHint.textContent = ''; }
    gridEl.innerHTML = '';

    if (current === 'documents') return renderDocuments();
    if (current === 'pictures') return renderPictures();
    if (current === 'trash') return renderTrash();
    return renderDevice(f);
  }

  // ── Documents ──
  function renderDocuments() {
    var section = 'documents';
    var visible = itemsInCurrent(data.documents, section);
    var subFolders = currentSub ? [] : foldersOf(section);
    var here = currentSub ? findFolder(section, currentSub) : null;
    if (currentSub && !here) { currentSub = null; return renderDocuments(); }
    if (!visible.length && !subFolders.length && !currentSub) {
      showEmpty('documents', 'Manuscripts you download from the writing app land here. Open a book, tap Download, choose "This device".', '+ New folder', function () { promptNewFolder(section); });
      return;
    }
    showGrid();
    if (currentSub) {
      if (barHint) { barHint.hidden = false; barHint.textContent = 'In: ' + (here.name || 'Folder'); }
      gridEl.appendChild(backCard(section));
    }
    subFolders.forEach(function (f) { gridEl.appendChild(folderCard(f, section)); });
    visible.slice().reverse().forEach(function (doc) { gridEl.appendChild(fileCard(doc, 'documents')); });
    if (!currentSub) gridEl.appendChild(newFolderCard(section));
  }
  function fileCard(doc, section) {
    var card = el('div', 'card file-card'); card.draggable = true;
    wireFileDrag(card, doc, section);
    card.innerHTML =
      '<div class="card-thumb">' + svg('documents', 30) + '</div>' +
      '<div class="card-body"><div class="card-name">' + esc(doc.name) + '</div>' +
      '<div class="card-meta">' + (doc.format || 'rtf').toUpperCase() + ' · ' + dateStr(doc.date) + '</div></div>' +
      '<div class="card-actions"></div>';
    var acts = card.querySelector('.card-actions');
    var ren = el('button', 'card-btn'); ren.textContent = 'Rename'; ren.addEventListener('click', function () { renameItem(card, doc, section); });
    var dl = el('button', 'card-btn primary'); dl.textContent = 'Download'; dl.addEventListener('click', function () { downloadDoc(doc); });
    var del = el('button', 'card-btn danger'); del.textContent = 'Delete'; del.addEventListener('click', function () { trashItem('document', doc); });
    acts.append(ren, dl, del);
    return card;
  }
  function pictureCard(p, isBg) {
    var card = el('div', 'card file-card'); card.draggable = true;
    wireFileDrag(card, p, 'pictures');
    card.innerHTML = '<div class="card-thumb' + (isBg ? ' is-bg' : '') + '" style="background-image:url(&quot;' + p.data + '&quot;);"></div>' +
      '<div class="card-body"><div class="card-name">' + esc(p.name) + '</div><div class="card-meta">' + (isBg ? 'Background' : 'Picture') + ' · ' + dateStr(p.date) + '</div></div>' +
      '<div class="card-actions"></div>';
    var acts = card.querySelector('.card-actions');
    var ren = el('button', 'card-btn'); ren.textContent = 'Rename'; ren.addEventListener('click', function () { renameItem(card, p, 'pictures'); });
    var del = el('button', 'card-btn danger'); del.textContent = 'Delete'; del.addEventListener('click', function () { if (isBg) setBg(''); trashItem('picture', p); });
    acts.append(ren, del);
    return card;
  }
  function folderCard(f, section) {
    var card = el('div', 'card folder-card'); card.dataset.folderId = f.id; card.dataset.section = section;
    wireFolderDrop(card, f, section);
    card.innerHTML =
      '<div class="card-thumb folder-thumb"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + FOLDER_OPEN_ICON + '</svg></div>' +
      '<div class="card-body"><div class="card-name">' + esc(f.name) + '</div><div class="card-meta">Folder</div></div>' +
      '<div class="card-actions"></div>';
    card.querySelector('.card-thumb').addEventListener('click', function () { currentSub = f.id; render(); });
    card.querySelector('.card-body').addEventListener('click', function () { currentSub = f.id; render(); });
    var acts = card.querySelector('.card-actions');
    var ren = el('button', 'card-btn'); ren.textContent = 'Rename'; ren.addEventListener('click', function (e) { e.stopPropagation(); renameFolder(card, f, section); });
    var del = el('button', 'card-btn danger'); del.textContent = 'Delete'; del.addEventListener('click', function (e) { e.stopPropagation(); deleteFolder(f, section); });
    acts.append(ren, del);
    return card;
  }
  function backCard(section) {
    var card = el('div', 'card back-card');
    card.innerHTML =
      '<div class="card-thumb folder-thumb"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m11 18-6-6 6-6"/></svg></div>' +
      '<div class="card-body"><div class="card-name">Back to ' + (section === 'documents' ? 'Documents' : 'Pictures') + '</div><div class="card-meta">All ' + section + '</div></div>';
    card.addEventListener('click', function () { currentSub = null; render(); });
    wireRootDrop(card, section);
    return card;
  }
  // Drag a file card; drop on a folder to move into it, or on Back to move to root.
  function wireFileDrag(card, item, section) {
    card.addEventListener('dragstart', function (e) {
      card.classList.add('dragging');
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        try { e.dataTransfer.setData('text/plain', JSON.stringify({ section: section, id: item.id })); } catch (_) {}
      }
    });
    card.addEventListener('dragend', function () { card.classList.remove('dragging'); });
  }
  function wireFolderDrop(card, folder, section) {
    card.addEventListener('dragover', function (e) {
      if (!hasDraggingCard(section)) return;
      e.preventDefault(); card.classList.add('drop-into');
    });
    card.addEventListener('dragleave', function () { card.classList.remove('drop-into'); });
    card.addEventListener('drop', function (e) {
      card.classList.remove('drop-into');
      var ok = handleFileDrop(e, section, folder.id);
      if (ok) e.preventDefault();
    });
  }
  function wireRootDrop(card, section) {
    card.addEventListener('dragover', function (e) {
      if (!hasDraggingCard(section)) return;
      e.preventDefault(); card.classList.add('drop-into');
    });
    card.addEventListener('dragleave', function () { card.classList.remove('drop-into'); });
    card.addEventListener('drop', function (e) {
      card.classList.remove('drop-into');
      var ok = handleFileDrop(e, section, null);
      if (ok) e.preventDefault();
    });
  }
  function hasDraggingCard(section) { return !!document.querySelector('.file-card.dragging'); }
  function handleFileDrop(e, section, folderId) {
    var raw = e.dataTransfer && e.dataTransfer.getData('text/plain');
    if (!raw) return false;
    var info; try { info = JSON.parse(raw); } catch (_) { return false; }
    if (!info || info.section !== section) return false;
    var arr = section === 'documents' ? data.documents : data.pictures;
    var item = arr.filter(function (x) { return x.id === info.id; })[0];
    if (!item) return false;
    if (folderId) item.folder = folderId; else delete item.folder;
    persist(); render();
    return true;
  }
  // Folder creation/rename/delete
  function promptNewFolder(section) {
    var arr = data.folders[section];
    var f = { id: newId(), name: 'New folder' };
    arr.push(f); persist(); render();
    // Open inline rename on the new folder's card
    setTimeout(function () {
      var card = document.querySelector('.folder-card[data-folder-id="' + f.id + '"]');
      if (card) renameFolder(card, f, section);
    }, 0);
  }
  function renameFolder(card, folder, section) { inlineRename(card, folder, 'name', function () { persist(); render(); }); }
  function renameItem(card, item, section) { inlineRename(card, item, 'name', function () { persist(); render(); }); }
  function inlineRename(card, obj, key, onDone) {
    var nameEl = card.querySelector('.card-name');
    if (!nameEl) return;
    nameEl.setAttribute('contenteditable', 'true');
    nameEl.classList.add('renaming');
    nameEl.focus();
    var r = document.createRange(); r.selectNodeContents(nameEl);
    var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
    function finish() {
      nameEl.removeEventListener('blur', finish); nameEl.removeEventListener('keydown', onKey);
      nameEl.removeAttribute('contenteditable'); nameEl.classList.remove('renaming');
      var v = (nameEl.textContent || '').trim();
      obj[key] = v || obj[key] || 'Untitled';
      onDone && onDone();
    }
    function onKey(e) {
      if (e.key === 'Enter') { e.preventDefault(); nameEl.blur(); }
      else if (e.key === 'Escape') { nameEl.textContent = obj[key] || ''; nameEl.blur(); }
    }
    nameEl.addEventListener('blur', finish);
    nameEl.addEventListener('keydown', onKey);
  }
  function deleteFolder(folder, section) {
    var arr = data.folders[section];
    var items = (section === 'documents' ? data.documents : data.pictures).filter(function (x) { return x.folder === folder.id; });
    var msg = items.length ? '"' + folder.name + '" holds ' + items.length + ' item' + (items.length > 1 ? 's' : '') + '. They\'ll move back out to ' + section + ' — the folder will go.' : '"' + folder.name + '" will go.';
    if (window.qhConfirm) {
      window.qhConfirm({
        title: 'Delete this folder?', message: msg, confirmText: 'Delete folder', danger: true,
        onConfirm: function () {
          items.forEach(function (x) { delete x.folder; });
          data.folders[section] = arr.filter(function (f) { return f.id !== folder.id; });
          data.trash.push({ id: newId(), kind: 'folder', name: folder.name, date: Date.now(), payload: { folder: folder, section: section } });
          if (currentSub === folder.id) currentSub = null;
          persist(); render();
        }
      });
    }
  }
  function downloadDoc(doc) {
    var blob = new Blob([doc.content || ''], { type: 'application/rtf' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a'); a.href = url; a.download = (doc.name || 'manuscript') + '.' + (doc.format || 'rtf');
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  // ── Pictures ──
  function renderPictures() {
    var section = 'pictures';
    var visible = itemsInCurrent(data.pictures, section);
    var subFolders = currentSub ? [] : foldersOf(section);
    var here = currentSub ? findFolder(section, currentSub) : null;
    if (currentSub && !here) { currentSub = null; return renderPictures(); }
    barAction.hidden = false; barAction.textContent = '+ Add a picture';
    barAction.onclick = function () { picInput.click(); };
    if (!visible.length && !subFolders.length && !currentSub) {
      return showEmpty('pictures', 'No pictures yet. Add one, then choose it as your home background in Settings.');
    }
    showGrid();
    if (barHint) { barHint.hidden = false; barHint.textContent = currentSub ? ('In: ' + (here.name || 'Folder')) : 'Set your background in Settings.'; }
    if (currentSub) gridEl.appendChild(backCard(section));
    subFolders.forEach(function (f) { gridEl.appendChild(folderCard(f, section)); });
    var bg = getBg();
    visible.slice().reverse().forEach(function (p) {
      gridEl.appendChild(pictureCard(p, !!(bg && bg === p.data)));
    });
    if (!currentSub) gridEl.appendChild(newFolderCard(section));
  }
  function newFolderCard(section) {
    var card = el('div', 'card new-folder-card');
    card.innerHTML =
      '<div class="card-thumb folder-thumb">' +
        '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' + FOLDER_OPEN_ICON + '<path d="M12 9v6"/><path d="M9 12h6"/></svg>' +
      '</div>' +
      '<div class="card-body"><div class="card-name">New folder</div><div class="card-meta">Make one</div></div>';
    card.addEventListener('click', function () { promptNewFolder(section); });
    return card;
  }
  picInput.addEventListener('change', function () {
    var file = picInput.files && picInput.files[0]; picInput.value = '';
    if (!file) return;
    downscale(file, function (dataUrl) {
      var pic = { id: newId(), name: file.name.replace(/\.[^.]+$/, '') || 'Picture', date: Date.now(), data: dataUrl };
      if (currentSub && current === 'pictures') pic.folder = currentSub;
      data.pictures.push(pic);
      if (!persist()) {
        data.pictures.pop();   // ran out of room — don't pretend it saved
        if (window.qhConfirm) window.qhConfirm({ title: 'Not enough room', message: 'There isn’t space to save that picture on the device. Try removing a few pictures first.', confirmText: 'OK' });
        else window.alert('Not enough room to save that picture.');
        return;
      }
      render();
    });
  });
  function downscale(file, cb) {
    var rd = new FileReader();
    rd.onload = function () {
      var img = new Image();
      img.onload = function () {
        var max = 1600, w = img.width, h = img.height;
        if (w > max || h > max) { var s = Math.min(max / w, max / h); w = Math.round(w * s); h = Math.round(h * s); }
        var c = document.createElement('canvas'); c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        try { cb(c.toDataURL('image/jpeg', 0.82)); } catch (e) { cb(rd.result); }
      };
      img.src = rd.result;
    };
    rd.readAsDataURL(file);
  }
  function setBg(dataUrl) { setBgStore(dataUrl); render(); }

  // ── Trash ──
  function renderTrash() {
    if (!data.trash.length) return showEmpty('trash', 'Nothing in the trash. Deleted files wait here so you can get them back.');
    showGrid();
    barAction.hidden = false; barAction.className = 'bar-action ghost'; barAction.textContent = 'Empty trash';
    barAction.onclick = function () { confirmDanger('Empty the trash?', 'Everything in the trash will be gone for good — this can’t be undone.', 'Empty trash', function () { data.trash = []; persist(); render(); }); };
    data.trash.slice().reverse().forEach(function (t) {
      var isPic = t.kind === 'picture';
      var isFolder = t.kind === 'folder';
      var thumbContent = isPic ? '' : isFolder ? '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + FOLDER_OPEN_ICON + '</svg>' : svg('documents', 30);
      var thumbStyle = isPic ? ' style="background-image:url(&quot;' + t.payload.data + '&quot;);"' : '';
      var kindLabel = isPic ? 'Picture' : isFolder ? 'Folder' : 'Document';
      var card = el('div', 'card');
      card.innerHTML = '<div class="card-thumb"' + thumbStyle + '>' + thumbContent + '</div>' +
        '<div class="card-body"><div class="card-name">' + esc(t.name) + '</div><div class="card-meta">' + kindLabel + ' · deleted ' + dateStr(t.date) + '</div></div>' +
        '<div class="card-actions"></div>';
      var acts = card.querySelector('.card-actions');
      var res = el('button', 'card-btn primary'); res.textContent = 'Restore'; res.addEventListener('click', function () { restore(t); });
      var del = el('button', 'card-btn danger'); del.textContent = 'Forever'; del.addEventListener('click', function () { confirmDanger('Delete this forever?', '"' + t.name + '" will be gone for good — this can\'t be undone.', 'Delete forever', function () { data.trash = data.trash.filter(function (x) { return x.id !== t.id; }); persist(); render(); }); });
      acts.append(res, del);
      gridEl.appendChild(card);
    });
  }
  function trashItem(kind, item) {
    if (kind === 'document') data.documents = data.documents.filter(function (d) { return d.id !== item.id; });
    if (kind === 'picture') data.pictures = data.pictures.filter(function (p) { return p.id !== item.id; });
    data.trash.push({ id: newId(), kind: kind, name: item.name, date: Date.now(), payload: item });
    persist(); render();
  }
  function restore(t) {
    if (t.kind === 'document') data.documents.push(t.payload);
    if (t.kind === 'picture') data.pictures.push(t.payload);
    if (t.kind === 'folder') {
      var sec = t.payload.section || 'documents';
      if (!Array.isArray(data.folders[sec])) data.folders[sec] = [];
      data.folders[sec].push(t.payload.folder);
    }
    data.trash = data.trash.filter(function (x) { return x.id !== t.id; });
    persist(); render();
  }

  // ── Device folders (real once installed) ──
  function renderDevice(f) {
    showEmpty(f.id, f.id === 'usb'
      ? 'Plug in a USB stick on your Quill Haven device and it shows up right here — drag manuscripts across to take them with you.'
      : 'Files you download appear here once Quill Haven is running on your device.');
  }

  // ── Init ──
  applyTheme();
  window.addEventListener('storage', function (e) {
    if (e.key === 'qh-theme') applyTheme();
    if (e.key === STORE || e.key === 'qh-bg') { try { var d = JSON.parse(localStorage.getItem(STORE)); if (d) data = d; } catch (er) {} render(); }
  });
  render();
})();
