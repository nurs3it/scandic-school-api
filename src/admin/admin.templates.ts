// ─── Utility ──────────────────────────────────────────────────────────────────

export function escHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ─── Shared labels ────────────────────────────────────────────────────────────

const GRADE_LABELS: Record<string, string> = {
  '1': '1 класс',
  '2': '2 класс',
  '3': '3 класс',
  '4': '4 класс',
};

const LANG_LABELS: Record<string, string> = {
  kazakh: 'Казахский',
  russian: 'Русский',
};

// ─── Shared styles ────────────────────────────────────────────────────────────

const BASE_STYLES = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #f1f5f9;
    color: #0f172a;
    min-height: 100vh;
  }
  .layout { display: flex; min-height: 100vh; }

  /* Sidebar */
  .sidebar {
    width: 260px;
    background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
    color: #fff;
    display: flex;
    flex-direction: column;
    padding: 0;
    position: fixed;
    top: 0; left: 0; bottom: 0;
    z-index: 10;
    overflow-y: auto;
  }
  .sidebar-logo {
    padding: 28px 24px 24px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .sidebar-logo .circle {
    width: 44px; height: 44px;
    background: linear-gradient(135deg, #f4a724, #e8890a);
    border-radius: 12px;
    display: inline-flex; align-items: center; justify-content: center;
    font-size: 20px; margin-bottom: 10px;
    box-shadow: 0 4px 12px rgba(244,167,36,0.3);
  }
  .sidebar-logo h2 { font-size: 16px; font-weight: 700; color: #fff; letter-spacing: -0.01em; }
  .sidebar-logo p { font-size: 11px; color: #64748b; margin-top: 2px; }
  .nav { padding: 20px 14px; flex: 1; }
  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 11px 14px;
    border-radius: 10px;
    color: #94a3b8;
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    margin-bottom: 4px;
    transition: all 0.2s;
    border: 1px solid transparent;
  }
  .nav-item:hover {
    color: #e2e8f0;
    background: rgba(255,255,255,0.05);
  }
  .nav-item.active {
    color: #fff;
    background: rgba(244,167,36,0.15);
    border-color: rgba(244,167,36,0.25);
    font-weight: 600;
    position: relative;
  }
  .nav-item.active::before {
    content: '';
    position: absolute;
    left: 0; top: 6px; bottom: 6px;
    width: 3px;
    background: #f4a724;
    border-radius: 0 3px 3px 0;
  }
  .nav-badge {
    margin-left: auto;
    background: #dc2626;
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    min-width: 20px;
    height: 20px;
    border-radius: 10px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 6px;
  }
  .sidebar-footer { padding: 16px 14px; border-top: 1px solid rgba(255,255,255,0.06); }
  .logout {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px;
    border-radius: 10px;
    color: #94a3b8;
    font-size: 13px;
    text-decoration: none;
    transition: all 0.2s;
  }
  .logout:hover { color: #fff; background: rgba(255,255,255,0.05); }

  /* Main content */
  .main { margin-left: 260px; flex: 1; padding: 32px 40px; max-width: 1400px; }
  .page-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 28px;
  }
  .page-header h1 { font-size: 24px; font-weight: 800; letter-spacing: -0.02em; }
  .page-header p { font-size: 13px; color: #64748b; margin-top: 4px; }

  /* Shared table styles */
  .table-card {
    background: #fff;
    border-radius: 14px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02);
    overflow: hidden;
    border: 1px solid #f1f5f9;
  }
  .table-header {
    padding: 18px 22px;
    border-bottom: 1px solid #f1f5f9;
    display: flex; align-items: center; justify-content: space-between;
  }
  .table-header h3 { font-size: 15px; font-weight: 700; }
  .count-badge {
    background: #f1f5f9; color: #64748b;
    font-size: 12px; font-weight: 600;
    padding: 4px 12px; border-radius: 20px;
  }
  table { width: 100%; border-collapse: collapse; }
  thead tr { background: #f8fafc; }
  th {
    padding: 12px 16px; text-align: left;
    font-size: 11px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.05em;
    color: #64748b; border-bottom: 1px solid #f1f5f9;
  }
  td { padding: 14px 16px; font-size: 14px; border-bottom: 1px solid #f8fafc; vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tr:nth-child(even) td { background: #fafbfc; }
  tr:hover td { background: #f1f5f9; }

  /* Shared badges */
  .badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
  }

  /* Shared buttons */
  .refresh-btn {
    padding: 9px 18px;
    background: #fff;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    color: #374151;
    text-decoration: none;
    display: inline-flex; align-items: center; gap: 6px;
    transition: all 0.2s;
  }
  .refresh-btn:hover { border-color: #f4a724; background: #fffbeb; }
  .primary-btn {
    padding: 9px 18px;
    background: linear-gradient(135deg, #f4a724, #e8890a);
    border: none;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    color: #0f172a;
    text-decoration: none;
    display: inline-flex; align-items: center; gap: 6px;
    transition: all 0.2s;
    box-shadow: 0 2px 8px rgba(244,167,36,0.25);
  }
  .primary-btn:hover { opacity: 0.9; box-shadow: 0 4px 12px rgba(244,167,36,0.35); }
  .del-btn {
    padding: 6px 14px;
    background: #fff;
    border: 1.5px solid #fecaca;
    border-radius: 8px;
    color: #dc2626;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  .del-btn:hover { background: #fef2f2; border-color: #f87171; }

  /* Flash messages */
  .flash {
    padding: 14px 18px; border-radius: 10px;
    font-size: 13px; font-weight: 600; margin-bottom: 20px;
    display: flex; align-items: center; gap: 8px;
  }
  .flash-success { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
  .flash-error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

  /* Empty state */
  .empty { text-align: center; padding: 60px 20px; color: #94a3b8; font-size: 14px; }
  .empty-icon { font-size: 48px; display: block; margin-bottom: 16px; opacity: 0.6; }

  /* Form shared */
  .add-card {
    background: #fff;
    border-radius: 14px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02);
    margin-bottom: 24px;
    border: 1px solid #f1f5f9;
  }
  .add-card h3 { font-size: 15px; font-weight: 700; margin-bottom: 16px; }
  .add-form { display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap; }
  .field { flex: 1; min-width: 240px; }
  label { font-size: 13px; font-weight: 600; color: #374151; display: block; margin-bottom: 6px; }
  input[type="email"], input[type="url"], input[type="text"], input[type="number"] {
    width: 100%;
    padding: 10px 14px;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    font-size: 14px;
    outline: none;
    transition: all 0.2s;
  }
  input:focus, textarea:focus, select:focus {
    border-color: #f4a724;
    box-shadow: 0 0 0 3px rgba(244,167,36,0.12);
  }

  /* Modal shared */
  .modal-overlay {
    display: none;
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(15,23,42,0.6);
    backdrop-filter: blur(4px);
    z-index: 100;
    align-items: center;
    justify-content: center;
  }
  .modal-overlay.active { display: flex; }
  .modal {
    background: #fff;
    border-radius: 16px;
    padding: 32px;
    width: 100%;
    max-width: 420px;
    box-shadow: 0 25px 60px rgba(0,0,0,0.2);
    animation: modal-in 0.2s ease-out;
  }
  @keyframes modal-in {
    from { opacity: 0; transform: scale(0.95) translateY(10px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
  .modal h2, .modal h3 { font-size: 18px; font-weight: 700; margin-bottom: 12px; }
  .modal p { color: #64748b; font-size: 14px; margin-bottom: 24px; }
  .modal-actions { display: flex; gap: 12px; justify-content: flex-end; }
  .modal-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  .modal-btn-cancel { background: #f1f5f9; color: #374151; }
  .modal-btn-cancel:hover { background: #e2e8f0; }
  .modal-btn-delete { background: #dc2626; color: #fff; font-weight: 700; }
  .modal-btn-delete:hover { background: #b91c1c; }

  /* Drag & drop */
  .drag-handle {
    display: inline-block;
    cursor: grab;
    color: #cbd5e1;
    font-size: 18px;
    line-height: 1;
    user-select: none;
    padding: 2px 4px;
    transition: color 0.15s;
  }
  .drag-handle:hover { color: #94a3b8; }
  tr[draggable="true"] { transition: opacity 0.15s; }
  tr.dragging { opacity: 0.4; }
  tr.drag-over td { background: #fef9ec !important; border-top: 2px solid #f4a724; }

  /* Hint */
  .hint { font-size: 12px; color: #94a3b8; margin-top: 2px; }

  /* Breadcrumbs */
  .breadcrumbs {
    font-size: 12px;
    color: #94a3b8;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .breadcrumbs a { color: #64748b; text-decoration: none; }
  .breadcrumbs a:hover { color: #f4a724; }
  .breadcrumbs .sep { color: #cbd5e1; }

  /* Avatar */
  .avatar {
    width: 32px; height: 32px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 13px;
    color: #fff;
    flex-shrink: 0;
  }
  .name-cell { display: flex; align-items: center; gap: 10px; }

  /* Search & Filters */
  .search-filters { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; padding: 16px 22px; border-bottom: 1px solid #f1f5f9; }
  .search-input {
    flex: 1; min-width: 200px;
    padding: 9px 14px 9px 36px;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    font-size: 13px;
    outline: none;
    transition: all 0.2s;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E") no-repeat 12px center;
  }
  .search-input:focus { border-color: #f4a724; box-shadow: 0 0 0 3px rgba(244,167,36,0.12); }
  .filter-chips { display: flex; gap: 6px; flex-wrap: wrap; }
  .filter-chip {
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    border: 1.5px solid #e2e8f0;
    background: #fff;
    color: #64748b;
    transition: all 0.2s;
  }
  .filter-chip:hover { border-color: #f4a724; color: #f4a724; }
  .filter-chip.active { background: #f4a724; color: #0f172a; border-color: #f4a724; }

  /* Stat card icon */
  .stat-icon {
    width: 40px; height: 40px;
    border-radius: 10px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    margin-bottom: 10px;
  }
  .stat-card-accent { border-left: 4px solid; }

  /* Updated timestamp */
  .updated-at { font-size: 12px; color: #94a3b8; display: flex; align-items: center; gap: 4px; }

  /* Mobile burger */
  .burger {
    display: none;
    position: fixed;
    top: 16px; left: 16px;
    z-index: 20;
    width: 40px; height: 40px;
    border-radius: 10px;
    background: #0f172a;
    border: none;
    cursor: pointer;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }
  .burger span {
    display: block; width: 18px; height: 2px; background: #fff; border-radius: 2px;
    position: relative;
  }
  .burger span::before, .burger span::after {
    content: ''; position: absolute; width: 18px; height: 2px; background: #fff; border-radius: 2px; left: 0;
  }
  .burger span::before { top: -6px; }
  .burger span::after { top: 6px; }
  .sidebar-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 9;
  }
  .sidebar-overlay.active { display: block; }

  /* Responsive */
  @media (max-width: 1024px) {
    .sidebar { width: 220px; }
    .main { margin-left: 220px; padding: 24px; }
  }
  @media (max-width: 768px) {
    .burger { display: flex; }
    .sidebar {
      transform: translateX(-100%);
      transition: transform 0.3s ease;
      width: 280px;
    }
    .sidebar.open { transform: translateX(0); }
    .main { margin-left: 0; padding: 16px; padding-top: 64px; }
    .page-header { flex-direction: column; gap: 12px; align-items: flex-start; }
    .stats { grid-template-columns: repeat(2, 1fr) !important; }
    table { font-size: 13px; }
    td, th { padding: 10px 12px; }
    .search-filters { flex-direction: column; }
    .search-input { min-width: 100%; }
  }
`;

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export type SidebarPage =
  | 'applications'
  | 'emails'
  | 'instagram'
  | 'merch'
  | 'orders'
  | 'news'
  | 'contacts'
  | 'clubs'
  | 'tournaments'
  | 'tournament-registrations';

function sidebarHtml(active: SidebarPage) {
  return `
  <button class="burger" onclick="document.querySelector('.sidebar').classList.toggle('open');document.querySelector('.sidebar-overlay').classList.toggle('active');">
    <span></span>
  </button>
  <div class="sidebar-overlay" onclick="document.querySelector('.sidebar').classList.remove('open');this.classList.remove('active');"></div>
  <aside class="sidebar">
    <div class="sidebar-logo">
      <div class="circle">&#127979;</div>
      <h2>Scandic School</h2>
      <p>Панель администратора</p>
    </div>
    <nav class="nav">
      <a href="/admin" class="nav-item ${active === 'applications' ? 'active' : ''}">&#128203; Заявки на зачисление</a>
      <a href="/admin/emails" class="nav-item ${active === 'emails' ? 'active' : ''}">&#9993;&#65039; Почты для уведомлений</a>
      <a href="/admin/instagram" class="nav-item ${active === 'instagram' ? 'active' : ''}">&#128248; Instagram посты</a>
      <a href="/admin/news" class="nav-item ${active === 'news' ? 'active' : ''}">&#128240; Новости</a>
      <a href="/admin/clubs" class="nav-item ${active === 'clubs' ? 'active' : ''}">&#9818; Кружки</a>
      <a href="/admin/tournaments" class="nav-item ${active === 'tournaments' ? 'active' : ''}">&#127942; Турниры</a>
      <a href="/admin/tournament-registrations" class="nav-item ${active === 'tournament-registrations' ? 'active' : ''}">&#128221; Заявки на турниры</a>
      <a href="/admin/merch" class="nav-item ${active === 'merch' ? 'active' : ''}">&#128717;&#65039; Мерч</a>
      <a href="/admin/orders" class="nav-item ${active === 'orders' ? 'active' : ''}">&#128722; Заказы мерча</a>
      <a href="/admin/contacts" class="nav-item ${active === 'contacts' ? 'active' : ''}">&#128172; Обращения</a>
    </nav>
    <div class="sidebar-footer">
      <a href="/admin/logout" class="logout">&#8592; Выйти</a>
    </div>
  </aside>`;
}

export function flashHtml(flash?: {
  type: 'success' | 'error';
  message: string;
}): string {
  if (!flash) return '';
  const icon = flash.type === 'success' ? '&#10003;' : '&#9888;';
  return `<div class="flash flash-${flash.type}">${icon} ${escHtml(flash.message)}</div>`;
}

export function pageShell(
  title: string,
  active: SidebarPage,
  extraStyles: string,
  body: string,
  scripts = '',
) {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Scandic Admin &#8212; ${escHtml(title)}</title>
  <style>${BASE_STYLES}${extraStyles}</style>
</head>
<body>
<div class="layout">
  ${sidebarHtml(active)}
  <main class="main">${body}</main>
</div>
${scripts}
</body>
</html>`;
}

// ─── Delete modal script (shared) ─────────────────────────────────────────────

function deleteModalScript(formActionPrefix: string) {
  return `
<div id="delete-modal" class="modal-overlay">
  <div class="modal">
    <h3>Удалить?</h3>
    <p id="delete-msg"></p>
    <div class="modal-actions">
      <button class="modal-btn modal-btn-cancel" onclick="document.getElementById('delete-modal').classList.remove('active')">Отмена</button>
      <form id="delete-form" method="POST" style="margin:0;">
        <button type="submit" class="modal-btn modal-btn-delete">Удалить</button>
      </form>
    </div>
  </div>
</div>
<script>
  function openDeleteModal(id, label) {
    document.getElementById('delete-msg').textContent = label + ' будет удалён(а). Это действие невозможно отменить.';
    document.getElementById('delete-form').action = '${formActionPrefix}/' + id + '/delete';
    document.getElementById('delete-modal').classList.add('active');
  }
  document.getElementById('delete-modal').addEventListener('click', function(e) {
    if (e.target === this) this.classList.remove('active');
  });
</script>`;
}

// ─── Drag-reorder script (shared) ─────────────────────────────────────────────

function dragReorderScript(tbodyId: string, formAction: string) {
  return `
<form id="reorder-form" method="POST" action="${formAction}" style="display:none;">
  <input type="hidden" id="reorder-ids" name="ids" />
</form>
<script>
(function() {
  var tbody = document.getElementById('${tbodyId}');
  if (!tbody) return;
  var dragSrc = null;
  tbody.addEventListener('dragstart', function(e) {
    dragSrc = e.target.closest('tr');
    if (dragSrc) { dragSrc.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; }
  });
  tbody.addEventListener('dragover', function(e) {
    e.preventDefault();
    var target = e.target.closest('tr');
    if (target && target !== dragSrc) {
      tbody.querySelectorAll('tr').forEach(function(r) { r.classList.remove('drag-over'); });
      target.classList.add('drag-over');
    }
  });
  tbody.addEventListener('dragleave', function(e) {
    var t = e.target.closest('tr'); if (t) t.classList.remove('drag-over');
  });
  tbody.addEventListener('drop', function(e) {
    e.preventDefault();
    var target = e.target.closest('tr');
    if (!target || target === dragSrc) return;
    var rows = Array.from(tbody.querySelectorAll('tr'));
    var si = rows.indexOf(dragSrc), ti = rows.indexOf(target);
    if (si < ti) target.after(dragSrc); else target.before(dragSrc);
    target.classList.remove('drag-over');
    var ids = Array.from(tbody.querySelectorAll('tr[data-id]')).map(function(r) { return r.getAttribute('data-id'); }).join(',');
    document.getElementById('reorder-ids').value = ids;
    document.getElementById('reorder-form').submit();
  });
  tbody.addEventListener('dragend', function() {
    tbody.querySelectorAll('tr').forEach(function(r) { r.classList.remove('dragging', 'drag-over'); });
    dragSrc = null;
  });
})();
</script>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════════════════════════

export function loginPage(error = '') {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Scandic Admin &#8212; Вход</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card {
      background: #fff;
      border-radius: 20px;
      padding: 48px 40px;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 25px 60px rgba(0,0,0,0.3);
    }
    .logo { text-align: center; margin-bottom: 32px; }
    .logo-circle {
      width: 68px; height: 68px;
      background: linear-gradient(135deg, #f4a724, #e8890a);
      border-radius: 18px;
      display: inline-flex; align-items: center; justify-content: center;
      font-size: 30px; margin-bottom: 14px;
      box-shadow: 0 8px 24px rgba(244,167,36,0.3);
    }
    h1 { font-size: 24px; font-weight: 800; color: #0f172a; text-align: center; letter-spacing: -0.02em; }
    p.sub { font-size: 14px; color: #64748b; text-align: center; margin-top: 4px; }
    .form { margin-top: 32px; display: flex; flex-direction: column; gap: 18px; }
    label { font-size: 13px; font-weight: 600; color: #374151; display: block; margin-bottom: 6px; }
    input {
      width: 100%; padding: 12px 16px;
      border: 1.5px solid #e2e8f0; border-radius: 12px;
      font-size: 14px; outline: none; transition: all 0.2s;
    }
    input:focus { border-color: #f4a724; box-shadow: 0 0 0 3px rgba(244,167,36,0.12); }
    .error {
      background: #fef2f2; border: 1px solid #fecaca; color: #dc2626;
      font-size: 13px; padding: 12px 16px; border-radius: 10px;
    }
    button {
      padding: 13px;
      background: linear-gradient(135deg, #f4a724, #e8890a);
      color: #0f172a; border: none; border-radius: 12px;
      font-size: 15px; font-weight: 700; cursor: pointer;
      margin-top: 4px; transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(244,167,36,0.3);
    }
    button:hover { opacity: 0.9; box-shadow: 0 6px 16px rgba(244,167,36,0.4); }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">
      <div class="logo-circle">&#127979;</div>
      <h1>Scandic School</h1>
      <p class="sub">Панель администратора</p>
    </div>
    ${error ? `<div class="error">&#9888;&#65039; ${escHtml(error)}</div>` : ''}
    <form class="form" method="POST" action="/admin/login">
      <div>
        <label>Логин</label>
        <input type="text" name="username" placeholder="admin" required autofocus />
      </div>
      <div>
        <label>Пароль</label>
        <input type="password" name="password" placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;" required />
      </div>
      <button type="submit">Войти &#8594;</button>
    </form>
  </div>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// APPLICATIONS (DASHBOARD)
// ═══════════════════════════════════════════════════════════════════════════════

export function dashboardPage(
  applications: Array<{
    id: number;
    parentName: string;
    grade: string;
    language: string;
    parentPhone: string;
    createdAt: Date;
  }>,
) {
  const total = applications.length;
  const today = applications.filter((a) => {
    const d = new Date(a.createdAt);
    const now = new Date();
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  }).length;
  const kazakh = applications.filter((a) => a.language === 'kazakh').length;
  const russian = applications.filter((a) => a.language === 'russian').length;

  const AVATAR_COLORS = [
    '#6366f1',
    '#8b5cf6',
    '#ec4899',
    '#f43f5e',
    '#f97316',
    '#eab308',
    '#22c55e',
    '#14b8a6',
    '#06b6d4',
    '#3b82f6',
  ];

  const rows = applications
    .map((a) => {
      const date = new Date(a.createdAt);
      const dateStr = date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      const timeStr = date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const initial = a.parentName.charAt(0).toUpperCase();
      const avatarColor = AVATAR_COLORS[a.id % AVATAR_COLORS.length];
      return `
      <tr data-name="${escHtml(a.parentName.toLowerCase())}" data-phone="${escHtml(a.parentPhone)}" data-grade="${a.grade}" data-lang="${a.language}">
        <td><span class="id">#${a.id}</span></td>
        <td>
          <div class="name-cell">
            <div class="avatar" style="background:${avatarColor};">${initial}</div>
            <span class="name">${escHtml(a.parentName)}</span>
          </div>
        </td>
        <td><span class="phone">${escHtml(a.parentPhone)}</span></td>
        <td><span class="badge grade">${GRADE_LABELS[a.grade] ?? a.grade}</span></td>
        <td><span class="badge lang-${a.language}">${LANG_LABELS[a.language] ?? a.language}</span></td>
        <td><span class="date">${dateStr}</span><br/><span class="time">${timeStr}</span></td>
        <td>
          <button type="button" class="del-btn" onclick="openDeleteModal(${a.id}, '${escHtml(a.parentName)}')">&#10005; Удалить</button>
        </td>
      </tr>`;
    })
    .join('');

  const extraStyles = `
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
    .stat-card {
      background: #fff; border-radius: 14px; padding: 22px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02);
      border: 1px solid #f1f5f9;
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
    .stat-label { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
    .stat-value { font-size: 32px; font-weight: 800; color: #0f172a; margin-top: 6px; letter-spacing: -0.02em; }
    .stat-sub { font-size: 12px; color: #94a3b8; margin-top: 4px; }
    .stat-card.accent { border-color: rgba(244,167,36,0.2); }
    .stat-card.accent .stat-value { color: #f4a724; }
    .id { font-size: 12px; color: #94a3b8; font-weight: 600; }
    .name { font-weight: 600; color: #0f172a; }
    .phone { color: #374151; font-family: monospace; font-size: 13px; }
    .grade { background: #fef3c7; color: #92400e; }
    .lang-kazakh { background: #dcfce7; color: #166534; }
    .lang-russian { background: #dbeafe; color: #1e40af; }
    .date { font-size: 13px; color: #374151; }
    .time { font-size: 11px; color: #94a3b8; }
    @media (max-width: 900px) { .stats { grid-template-columns: repeat(2, 1fr); } }
  `;

  const nowStr = new Date().toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const body = `
    <div class="breadcrumbs">
      <a href="/admin">&#127968; Главная</a>
      <span class="sep">&#8250;</span>
      <span>Заявки на зачисление</span>
    </div>

    <div class="page-header">
      <div>
        <h1>Запросы на зачисление</h1>
        <p>Все входящие заявки от родителей</p>
      </div>
      <div style="display:flex;align-items:center;gap:12px;">
        <span class="updated-at">&#128337; Обновлено: ${nowStr}</span>
        <a href="/admin" class="refresh-btn">&#8635; Обновить</a>
      </div>
    </div>

    <div class="stats">
      <div class="stat-card stat-card-accent" style="border-left-color:#f4a724;">
        <div class="stat-icon" style="background:rgba(244,167,36,0.12);">&#128203;</div>
        <div class="stat-label">Всего заявок</div>
        <div class="stat-value" style="color:#f4a724;">${total}</div>
        <div class="stat-sub">за всё время</div>
      </div>
      <div class="stat-card stat-card-accent" style="border-left-color:#22c55e;">
        <div class="stat-icon" style="background:rgba(34,197,94,0.12);">&#128161;</div>
        <div class="stat-label">Сегодня</div>
        <div class="stat-value" style="color:#22c55e;">${today}</div>
        <div class="stat-sub">новых заявок</div>
      </div>
      <div class="stat-card stat-card-accent" style="border-left-color:#06b6d4;">
        <div class="stat-icon" style="background:rgba(6,182,212,0.12);">&#127466;&#127479;</div>
        <div class="stat-label">Казахский</div>
        <div class="stat-value" style="color:#06b6d4;">${kazakh}</div>
        <div class="stat-sub">язык обучения</div>
      </div>
      <div class="stat-card stat-card-accent" style="border-left-color:#6366f1;">
        <div class="stat-icon" style="background:rgba(99,102,241,0.12);">&#127479;&#127482;</div>
        <div class="stat-label">Русский</div>
        <div class="stat-value" style="color:#6366f1;">${russian}</div>
        <div class="stat-sub">язык обучения</div>
      </div>
    </div>

    <div class="table-card">
      <div class="table-header">
        <h3>Список заявок</h3>
        <span class="count-badge">${total} записей</span>
      </div>
      ${
        total > 0
          ? `
      <div class="search-filters">
        <input type="text" class="search-input" id="search-input" placeholder="Поиск по имени или телефону..." oninput="filterTable()" />
        <div class="filter-chips">
          <button class="filter-chip active" data-filter="all" onclick="setFilter('all',this)">Все</button>
          <button class="filter-chip" data-filter="1" onclick="setFilter('1',this)">1 класс</button>
          <button class="filter-chip" data-filter="2" onclick="setFilter('2',this)">2 класс</button>
          <button class="filter-chip" data-filter="3" onclick="setFilter('3',this)">3 класс</button>
          <button class="filter-chip" data-filter="4" onclick="setFilter('4',this)">4 класс</button>
          <span style="width:1px;height:24px;background:#e2e8f0;"></span>
          <button class="filter-chip" data-filter="kazakh" onclick="setFilter('kazakh',this)">&#127466;&#127479; Казахский</button>
          <button class="filter-chip" data-filter="russian" onclick="setFilter('russian',this)">&#127479;&#127482; Русский</button>
        </div>
      </div>
      `
          : ''
      }
      ${
        total === 0
          ? `
        <div class="empty" style="padding:80px 20px;">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style="margin:0 auto 20px;display:block;opacity:0.4;">
            <rect x="10" y="14" width="60" height="52" rx="8" stroke="#94a3b8" stroke-width="2.5" fill="none"/>
            <line x1="22" y1="30" x2="58" y2="30" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round"/>
            <line x1="22" y1="40" x2="50" y2="40" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round"/>
            <line x1="22" y1="50" x2="42" y2="50" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <p style="font-size:16px;font-weight:700;color:#374151;margin-bottom:6px;">Заявок пока нет</p>
          <p style="font-size:13px;color:#94a3b8;max-width:320px;margin:0 auto;">Заявки появятся здесь, когда родители заполнят форму на сайте</p>
        </div>
      `
          : `
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Имя родителя</th>
            <th>Телефон</th>
            <th>Класс</th>
            <th>Язык</th>
            <th>Дата</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody id="app-tbody">${rows}</tbody>
      </table>
      <div id="no-results" style="display:none;text-align:center;padding:40px 20px;color:#94a3b8;font-size:14px;">
        Ничего не найдено по вашему запросу
      </div>
      `
      }
    </div>`;

  const filterScript =
    total > 0
      ? `
<script>
  var currentGrade = 'all';
  var currentLang = 'all';
  function setFilter(val, btn) {
    var grades = ['1','2','3','4'];
    var langs = ['kazakh','russian'];
    if (val === 'all') { currentGrade = 'all'; currentLang = 'all'; }
    else if (grades.includes(val)) { currentGrade = currentGrade === val ? 'all' : val; currentLang = 'all'; }
    else if (langs.includes(val)) { currentLang = currentLang === val ? 'all' : val; currentGrade = 'all'; }
    document.querySelectorAll('.filter-chip').forEach(function(c) { c.classList.remove('active'); });
    if (currentGrade === 'all' && currentLang === 'all') {
      document.querySelector('[data-filter="all"]').classList.add('active');
    } else {
      if (currentGrade !== 'all') document.querySelector('[data-filter="'+currentGrade+'"]').classList.add('active');
      if (currentLang !== 'all') document.querySelector('[data-filter="'+currentLang+'"]').classList.add('active');
    }
    filterTable();
  }
  function filterTable() {
    var query = (document.getElementById('search-input').value || '').toLowerCase();
    var rows = document.querySelectorAll('#app-tbody tr');
    var visible = 0;
    rows.forEach(function(row) {
      var name = row.getAttribute('data-name') || '';
      var phone = row.getAttribute('data-phone') || '';
      var grade = row.getAttribute('data-grade') || '';
      var lang = row.getAttribute('data-lang') || '';
      var matchSearch = !query || name.includes(query) || phone.includes(query);
      var matchGrade = currentGrade === 'all' || grade === currentGrade;
      var matchLang = currentLang === 'all' || lang === currentLang;
      var show = matchSearch && matchGrade && matchLang;
      row.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    var noRes = document.getElementById('no-results');
    if (noRes) noRes.style.display = visible === 0 ? 'block' : 'none';
  }
</script>`
      : '';

  return pageShell(
    'Заявки',
    'applications',
    extraStyles,
    body,
    deleteModalScript('/admin/applications') + filterScript,
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EMAILS
// ═══════════════════════════════════════════════════════════════════════════════

export function emailsPage(
  emails: Array<{ id: number; email: string; createdAt: Date }>,
  flash?: { type: 'success' | 'error'; message: string },
) {
  const rows = emails
    .map((e) => {
      const dateStr = new Date(e.createdAt).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      return `
      <tr>
        <td><span class="email-text">${escHtml(e.email)}</span></td>
        <td><span class="date">${dateStr}</span></td>
        <td>
          <form method="POST" action="/admin/emails/${e.id}/delete" style="margin:0;">
            <button type="submit" class="del-btn" onclick="return confirm('Удалить ${escHtml(e.email)}?')">&#10005; Удалить</button>
          </form>
        </td>
      </tr>`;
    })
    .join('');

  const extraStyles = `
    .email-text { font-family: monospace; font-size: 14px; color: #0f172a; font-weight: 500; }
    .date { font-size: 13px; color: #64748b; }
    .info-hint {
      font-size: 12px; color: #94a3b8; margin-top: 20px; padding: 14px 18px;
      background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;
    }
  `;

  const body = `
    <div class="breadcrumbs">
      <a href="/admin">&#127968; Главная</a>
      <span class="sep">&#8250;</span>
      <span>Почты для уведомлений</span>
    </div>

    <div class="page-header">
      <div>
        <h1>Почты для уведомлений</h1>
        <p>При поступлении новой заявки письмо придёт на все указанные адреса</p>
      </div>
    </div>

    ${flashHtml(flash)}

    <div class="add-card">
      <h3>Добавить почту</h3>
      <form method="POST" action="/admin/emails" class="add-form">
        <div class="field">
          <label>Email адрес</label>
          <input type="email" name="email" placeholder="example@gmail.com" required />
        </div>
        <button type="submit" class="primary-btn">+ Добавить</button>
      </form>
    </div>

    <div class="table-card">
      <div class="table-header">
        <h3>Список адресов</h3>
        <span class="count-badge">${emails.length} адресов</span>
      </div>
      ${
        emails.length === 0
          ? `
        <div class="empty">
          <span class="empty-icon">&#128236;</span>
          Нет добавленных почт. Добавьте первый адрес выше.
        </div>
      `
          : `
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Добавлен</th>
            <th>Действие</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      `
      }
    </div>

    <p class="info-hint">
      &#128161; Убедитесь что переменные окружения <strong>SMTP_HOST</strong>, <strong>SMTP_USER</strong> и <strong>SMTP_PASS</strong> настроены на сервере для отправки писем.
    </p>`;

  return pageShell('Почты', 'emails', extraStyles, body);
}

// ═══════════════════════════════════════════════════════════════════════════════
// INSTAGRAM
// ═══════════════════════════════════════════════════════════════════════════════

export function instagramPage(
  posts: Array<{ id: number; url: string; order: number; isActive: boolean }>,
  flash?: { type: 'success' | 'error'; message: string },
) {
  const rows = posts
    .map(
      (p) => `
    <tr draggable="true" data-id="${p.id}">
      <td class="drag-cell"><span class="drag-handle" title="Перетащить для изменения порядка">&#10303;</span></td>
      <td><span class="url-text">${escHtml(p.url)}</span></td>
      <td><span class="order-badge">${p.order}</span></td>
      <td>
        <form method="POST" action="/admin/instagram/${p.id}/toggle" style="margin:0;display:inline;">
          <input type="hidden" name="isActive" value="${p.isActive ? 'false' : 'true'}">
          <button type="submit" class="status-btn ${p.isActive ? 'status-active' : 'status-inactive'}">
            ${p.isActive ? '&#10003; Активен' : '&#10005; Неактивен'}
          </button>
        </form>
      </td>
      <td>
        <form method="POST" action="/admin/instagram/${p.id}/delete" style="margin:0;display:inline;">
          <button type="submit" class="del-btn" onclick="return confirm('Удалить пост?')">&#10005; Удалить</button>
        </form>
      </td>
    </tr>
  `,
    )
    .join('');

  const extraStyles = `
    .drag-cell { width: 40px; }
    .url-text { font-family: monospace; font-size: 13px; color: #374151; word-break: break-all; }
    .order-badge {
      display: inline-block;
      background: #f1f5f9; color: #64748b;
      font-size: 12px; font-weight: 700;
      padding: 4px 12px; border-radius: 20px;
    }
    .status-btn {
      padding: 5px 14px; border-radius: 20px;
      font-size: 12px; font-weight: 600;
      cursor: pointer; transition: all 0.2s; border: 1px solid;
    }
    .status-active { background: #dcfce7; color: #166534; border-color: #bbf7d0; }
    .status-active:hover { background: #bbf7d0; }
    .status-inactive { background: #fef2f2; color: #dc2626; border-color: #fecaca; }
    .status-inactive:hover { background: #fecaca; }
  `;

  const body = `
    <div class="breadcrumbs">
      <a href="/admin">&#127968; Главная</a>
      <span class="sep">&#8250;</span>
      <span>Instagram посты</span>
    </div>

    <div class="page-header">
      <div>
        <h1>Instagram посты</h1>
        <p>Управление постами, отображаемыми на сайте</p>
      </div>
    </div>

    ${flashHtml(flash)}

    <div class="add-card">
      <h3>Добавить новый пост</h3>
      <form method="POST" action="/admin/instagram" class="add-form">
        <div class="field">
          <label>URL поста</label>
          <input type="url" name="url" placeholder="https://www.instagram.com/p/..." required />
        </div>
        <button type="submit" class="primary-btn">+ Добавить</button>
      </form>
    </div>

    <div class="table-card">
      <div class="table-header">
        <h3>Список постов</h3>
        <span class="count-badge">${posts.length} постов</span>
      </div>
      ${
        posts.length === 0
          ? `
        <div class="empty">
          <span class="empty-icon">&#128248;</span>
          Пока нет добавленных постов. Добавьте первый выше.
        </div>
      `
          : `
      <table>
        <thead>
          <tr>
            <th style="width:40px;"></th>
            <th>URL</th>
            <th style="width:100px;">Порядок</th>
            <th style="width:150px;">Статус</th>
            <th style="width:100px;">Действие</th>
          </tr>
        </thead>
        <tbody id="sortable-tbody">${rows}</tbody>
      </table>
      `
      }
    </div>`;

  return pageShell(
    'Instagram посты',
    'instagram',
    extraStyles,
    body,
    dragReorderScript('sortable-tbody', '/admin/instagram/reorder'),
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MERCH LIST
// ═══════════════════════════════════════════════════════════════════════════════

export type MerchItemRow = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  images: string[];
  category: string | null;
  inStock: boolean;
  sizes: string[];
  colors: string[];
  order: number;
  createdAt: Date;
};

export function merchPage(
  items: MerchItemRow[],
  flash?: { type: 'success' | 'error'; message: string },
) {
  const rows = items
    .map((item) => {
      const date = new Date(item.createdAt).toLocaleDateString('ru-RU');
      return `
      <tr data-id="${item.id}" draggable="true">
        <td style="cursor:grab;color:#94a3b8;font-size:18px;padding:12px 8px;user-select:none;">&#8942;</td>
        <td><span class="id">#${item.id}</span></td>
        <td>
          ${item.image ? `<img src="${escHtml(item.image)}" alt="" style="width:52px;height:52px;object-fit:cover;border-radius:8px;border:1px solid #e2e8f0;" onerror="this.style.display='none'" />` : '<div style="width:52px;height:52px;border-radius:8px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;font-size:20px;">&#128717;</div>'}
        </td>
        <td><span class="name">${escHtml(item.name)}</span>${item.category ? `<br/><span style="font-size:11px;color:#64748b;">${escHtml(item.category)}</span>` : ''}</td>
        <td style="font-family:monospace;font-weight:600;">${item.price.toLocaleString('ru-RU')} &#8376;</td>
        <td>
          <span class="badge" style="background:${item.inStock ? '#dcfce7' : '#fee2e2'};color:${item.inStock ? '#166534' : '#991b1b'};">
            ${item.inStock ? 'В наличии' : 'Нет'}
          </span>
        </td>
        <td style="font-size:12px;color:#64748b;">${escHtml(item.sizes.join(', ')) || '&#8212;'}</td>
        <td><span class="date">${date}</span></td>
        <td style="white-space:nowrap;">
          <a href="/admin/merch/${item.id}/edit" class="tbl-btn">&#9998; Изменить</a>
          <button type="button" class="tbl-btn tbl-del" onclick="openDeleteModal(${item.id}, '${escHtml(item.name)}')">&#215; Удалить</button>
        </td>
      </tr>`;
    })
    .join('');

  const extraStyles = `
    .id { font-size: 12px; color: #94a3b8; font-weight: 600; }
    .name { font-weight: 600; color: #0f172a; }
    .date { font-size: 13px; color: #64748b; }
    .tbl-btn {
      display: inline-block; padding: 6px 12px; border-radius: 8px;
      border: 1.5px solid #e2e8f0; font-size: 12px; font-weight: 600;
      cursor: pointer; background: #fff; margin-right: 4px;
      text-decoration: none; color: #0f172a; transition: all 0.2s;
    }
    .tbl-btn:hover { border-color: #f4a724; background: #fffbeb; }
    .tbl-del:hover { border-color: #dc2626 !important; color: #dc2626 !important; background: #fef2f2 !important; }
  `;

  const body = `
    <div class="breadcrumbs">
      <a href="/admin">&#127968; Главная</a>
      <span class="sep">&#8250;</span>
      <span>Мерч</span>
    </div>

    <div class="page-header">
      <div>
        <h1>Управление мерчем</h1>
        <p>Перетаскивайте строки для изменения порядка</p>
      </div>
      <div style="display:flex;gap:8px;">
        <a href="/admin/merch" class="refresh-btn">&#8635; Обновить</a>
        <a href="/admin/merch/new" class="primary-btn">&#43; Добавить товар</a>
      </div>
    </div>

    ${flashHtml(flash)}

    <div class="table-card">
      <div class="table-header">
        <h3>Товары <span class="count-badge">${items.length}</span></h3>
        <span style="font-size:12px;color:#94a3b8;">&#8942; Перетащите для изменения порядка</span>
      </div>
      ${
        items.length === 0
          ? `
        <div class="empty">
          <span class="empty-icon">&#128717;</span>
          <p style="font-size:16px;font-weight:600;margin-bottom:8px;">Товаров пока нет</p>
          <a href="/admin/merch/new" class="primary-btn" style="margin-top:8px;">&#43; Добавить первый товар</a>
        </div>
      `
          : `
      <div style="overflow-x:auto;">
      <table>
        <thead>
          <tr>
            <th style="width:32px;"></th>
            <th>ID</th>
            <th>Фото</th>
            <th>Название</th>
            <th>Цена</th>
            <th>Статус</th>
            <th>Размеры</th>
            <th>Добавлен</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody id="merch-tbody">${rows}</tbody>
      </table>
      </div>
      `
      }
    </div>`;

  const scripts =
    deleteModalScript('/admin/merch') +
    dragReorderScript('merch-tbody', '/admin/merch/reorder');
  return pageShell('Мерч', 'merch', extraStyles, body, scripts);
}

// ═══════════════════════════════════════════════════════════════════════════════
// MERCH FORM (new / edit)
// ═══════════════════════════════════════════════════════════════════════════════

const MERCH_FORM_STYLES = `
  .form-card {
    background: #fff; border-radius: 14px; padding: 28px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02);
    margin-bottom: 24px; border: 1px solid #f1f5f9;
  }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  .form-group { display: flex; flex-direction: column; gap: 5px; }
  .form-group.full { grid-column: 1/-1; }
  .form-group label { font-size: 12px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.03em; }
  .form-group input, .form-group textarea, .form-group select {
    padding: 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 14px;
    outline: none; transition: all 0.2s; font-family: inherit; background: #fff;
  }
  .upload-area {
    border: 2px dashed #e2e8f0; border-radius: 12px; padding: 24px; text-align: center;
    cursor: pointer; transition: all 0.2s; background: #fafbfc; position: relative;
  }
  .upload-area:hover { border-color: #f4a724; background: #fffbeb; }
  .upload-area input[type=file] { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
  .upload-area-icon { font-size: 32px; margin-bottom: 8px; opacity: 0.6; }
  .upload-area-text { font-size: 13px; color: #64748b; }
  .upload-area-text strong { color: #0f172a; }
  .img-preview { margin-top: 12px; display: flex; flex-wrap: wrap; gap: 8px; }
  .img-preview-item img { width: 72px; height: 72px; object-fit: cover; border-radius: 8px; border: 1px solid #e2e8f0; }
  .current-img { display: flex; align-items: center; gap: 12px; background: #f8fafc; border-radius: 10px; padding: 10px 14px; margin-bottom: 12px; border: 1px solid #f1f5f9; }
  .current-img img { width: 56px; height: 56px; object-fit: cover; border-radius: 8px; }
  .current-img span { font-size: 12px; color: #64748b; }
  .form-actions { display: flex; gap: 12px; align-items: center; margin-top: 24px; padding-top: 24px; border-top: 1px solid #f1f5f9; }
  .submit-btn {
    padding: 12px 28px; background: linear-gradient(135deg, #f4a724, #e8890a); color: #0f172a;
    border: none; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer;
    transition: all 0.2s; box-shadow: 0 2px 8px rgba(244,167,36,0.25);
  }
  .submit-btn:hover { opacity: 0.9; box-shadow: 0 4px 12px rgba(244,167,36,0.35); }
  .cancel-link { padding: 12px 20px; background: #f1f5f9; border-radius: 10px; font-size: 14px; font-weight: 600; color: #374151; text-decoration: none; }
  .cancel-link:hover { background: #e2e8f0; }
`;

export function merchFormPage(
  mode: 'new' | 'edit',
  item?: MerchItemRow,
  flash?: { type: 'error'; message: string },
) {
  const title = mode === 'new' ? 'Добавить товар' : 'Редактировать товар';
  const action =
    mode === 'new' ? '/admin/merch/create' : `/admin/merch/${item!.id}/update`;
  const val = (field: keyof MerchItemRow, fallback = '') => {
    if (!item) return fallback;
    const v = item[field];
    return v != null ? String(v) : fallback;
  };

  const body = `
    <div class="page-header">
      <div>
        <a href="/admin/merch" style="font-size:13px;color:#64748b;text-decoration:none;">&#8592; Назад к мерчу</a>
        <h1 style="margin-top:4px;">${escHtml(title)}</h1>
      </div>
    </div>

    ${flash ? `<div class="flash flash-error">${escHtml(flash.message)}</div>` : ''}

    <div class="form-card">
      <form method="POST" action="${action}" enctype="multipart/form-data">
        <div class="form-grid">
          <div class="form-group">
            <label>Название *</label>
            <input type="text" name="name" required value="${escHtml(val('name'))}" placeholder="Худи Scandic School" />
          </div>

          <div class="form-group">
            <label>Цена (тенге) *</label>
            <input type="number" name="price" required min="0" value="${val('price', '0')}" placeholder="12000" />
          </div>

          <div class="form-group full">
            <label>Описание *</label>
            <textarea name="description" required rows="3" placeholder="Описание товара..." style="resize:vertical;">${escHtml(val('description'))}</textarea>
          </div>

          <div class="form-group">
            <label>Категория</label>
            <input type="text" name="category" value="${escHtml(val('category'))}" placeholder="Одежда" />
          </div>

          <div class="form-group">
            <label>Наличие</label>
            <select name="inStock">
              <option value="true" ${!item || item.inStock ? 'selected' : ''}>В наличии</option>
              <option value="false" ${item && !item.inStock ? 'selected' : ''}>Нет в наличии</option>
            </select>
          </div>

          <div class="form-group">
            <label>Размеры</label>
            <input type="text" name="sizes" value="${escHtml(item?.sizes.join(', ') || '')}" placeholder="S, M, L, XL" />
            <span class="hint">Через запятую</span>
          </div>

          <div class="form-group">
            <label>Цвета</label>
            <input type="text" name="colors" value="${escHtml(item?.colors.join(', ') || '')}" placeholder="Синий, Белый" />
            <span class="hint">Через запятую</span>
          </div>

          <div class="form-group full">
            <label>Главное изображение &#8212; загрузить файл</label>
            ${item?.image ? `<div class="current-img"><img src="${escHtml(item.image)}" alt="" /><span>Текущее изображение. Загрузите новое чтобы заменить.</span></div>` : ''}
            <div class="upload-area">
              <input type="file" name="imageFile" accept="image/*" id="main-file-input" />
              <div class="upload-area-icon">&#128444;</div>
              <div class="upload-area-text"><strong>Нажмите или перетащите</strong><br/>PNG, JPG, WebP до 10 МБ</div>
              <div class="img-preview" id="main-preview"></div>
            </div>
            <span class="hint">Или укажите URL напрямую:</span>
            <input type="text" name="imageUrl" value="${item?.image && !item.image.startsWith('/uploads/') ? escHtml(item.image) : ''}" placeholder="https://example.com/image.jpg" style="margin-top:4px;" />
          </div>

          <div class="form-group full">
            <label>Дополнительные изображения &#8212; загрузить файлы</label>
            <div class="upload-area">
              <input type="file" name="extraFiles" accept="image/*" multiple id="extra-file-input" />
              <div class="upload-area-icon">&#128444;&#128444;</div>
              <div class="upload-area-text"><strong>Нажмите или перетащите несколько файлов</strong><br/>PNG, JPG, WebP</div>
              <div class="img-preview" id="extra-preview"></div>
            </div>
            <span class="hint">Существующие доп. изображения (URL через запятую, будут объединены с загруженными):</span>
            <input type="text" name="existingImages" value="${escHtml(item?.images.join(', ') || '')}" placeholder="https://img1.jpg, https://img2.jpg" style="margin-top:4px;" />
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="submit-btn">${mode === 'new' ? '&#43; Добавить товар' : '&#128190; Сохранить изменения'}</button>
          <a href="/admin/merch" class="cancel-link">Отмена</a>
        </div>
      </form>
    </div>`;

  const scripts = `<script>
  document.getElementById('main-file-input').addEventListener('change', function() {
    var preview = document.getElementById('main-preview');
    preview.textContent = '';
    if (this.files && this.files[0]) {
      var reader = new FileReader();
      var el = document.createElement('div');
      el.className = 'img-preview-item';
      var img = document.createElement('img');
      reader.onload = function(e) { img.src = e.target.result; };
      reader.readAsDataURL(this.files[0]);
      el.appendChild(img);
      preview.appendChild(el);
    }
  });
  document.getElementById('extra-file-input').addEventListener('change', function() {
    var preview = document.getElementById('extra-preview');
    preview.textContent = '';
    Array.from(this.files).forEach(function(file) {
      var reader = new FileReader();
      var el = document.createElement('div');
      el.className = 'img-preview-item';
      var img = document.createElement('img');
      reader.onload = function(e) { img.src = e.target.result; };
      reader.readAsDataURL(file);
      el.appendChild(img);
      preview.appendChild(el);
    });
  });
</script>`;

  return pageShell(title, 'merch', MERCH_FORM_STYLES, body, scripts);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ORDERS
// ═══════════════════════════════════════════════════════════════════════════════

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; color: string }
> = {
  NEW: { label: 'Новый', bg: '#dbeafe', color: '#1e40af' },
  IN_PROGRESS: { label: 'В работе', bg: '#fef3c7', color: '#92400e' },
  REJECTED: { label: 'Отклонён', bg: '#fee2e2', color: '#991b1b' },
  SOLD: { label: 'Продан', bg: '#dcfce7', color: '#166534' },
};

export type OrderRow = {
  id: number;
  parentName: string;
  childrenNames: string;
  phone: string;
  items: any;
  total: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export function ordersPage(
  orders: OrderRow[],
  flash?: { type: 'success' | 'error'; message: string },
) {
  const totalNew = orders.filter((o) => o.status === 'NEW').length;
  const totalInProgress = orders.filter(
    (o) => o.status === 'IN_PROGRESS',
  ).length;
  const totalSold = orders.filter((o) => o.status === 'SOLD').length;
  const totalRejected = orders.filter((o) => o.status === 'REJECTED').length;

  const rows = orders
    .map((order) => {
      const date = new Date(order.createdAt);
      const dateStr = date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      const timeStr = date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const items = order.items as Array<{
        name: string;
        price: number;
        quantity: number;
        selectedSize?: string;
        selectedColor?: string;
      }>;
      const itemsSummary = items
        .map((i) => `${escHtml(i.name)} x${i.quantity}`)
        .join(', ');
      const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.NEW;

      const statusOptions = Object.entries(STATUS_CONFIG)
        .map(
          ([key, val]) =>
            `<option value="${key}" ${key === order.status ? 'selected' : ''}>${val.label}</option>`,
        )
        .join('');

      return `
      <tr>
        <td><span style="font-size:12px;color:#94a3b8;font-weight:600;">#${order.id}</span></td>
        <td>
          <span style="font-weight:600;color:#0f172a;">${escHtml(order.parentName)}</span>
          <br/><span style="font-size:12px;color:#64748b;">${escHtml(order.childrenNames)}</span>
        </td>
        <td><span style="font-family:monospace;font-size:13px;">${escHtml(order.phone)}</span></td>
        <td style="max-width:200px;">
          <span style="font-size:12px;color:#374151;" title="${escHtml(itemsSummary)}">${escHtml(itemsSummary.length > 50 ? itemsSummary.slice(0, 50) + '...' : itemsSummary)}</span>
        </td>
        <td style="font-family:monospace;font-weight:600;white-space:nowrap;">${order.total.toLocaleString('ru-RU')} &#8376;</td>
        <td>
          <form method="POST" action="/admin/orders/${order.id}/status" style="margin:0;display:inline-flex;align-items:center;gap:6px;">
            <select name="status" onchange="this.form.submit()" style="padding:5px 10px;border-radius:8px;border:1.5px solid #e2e8f0;font-size:12px;font-weight:600;cursor:pointer;background:${cfg.bg};color:${cfg.color};">
              ${statusOptions}
            </select>
          </form>
        </td>
        <td>
          <span style="font-size:13px;color:#374151;">${dateStr}</span>
          <br/><span style="font-size:11px;color:#94a3b8;">${timeStr}</span>
        </td>
      </tr>`;
    })
    .join('');

  const extraStyles = `
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
    .stat-card {
      background: #fff; border-radius: 14px; padding: 22px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02);
      border: 1px solid #f1f5f9;
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
    .stat-label { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
    .stat-value { font-size: 32px; font-weight: 800; margin-top: 6px; letter-spacing: -0.02em; }
    @media (max-width: 900px) { .stats { grid-template-columns: repeat(2, 1fr); } }
  `;

  const body = `
    <div class="breadcrumbs">
      <a href="/admin">&#127968; Главная</a>
      <span class="sep">&#8250;</span>
      <span>Заказы мерча</span>
    </div>

    <div class="page-header">
      <div>
        <h1>Заказы мерча</h1>
        <p>Управление заказами и изменение статусов</p>
      </div>
      <a href="/admin/orders" class="refresh-btn">&#8635; Обновить</a>
    </div>

    ${flashHtml(flash)}

    <div class="stats">
      <div class="stat-card stat-card-accent" style="border-left-color:#3b82f6;">
        <div class="stat-icon" style="background:rgba(59,130,246,0.12);">&#127381;</div>
        <div class="stat-label">Новые</div>
        <div class="stat-value" style="color:#1e40af;">${totalNew}</div>
      </div>
      <div class="stat-card stat-card-accent" style="border-left-color:#f59e0b;">
        <div class="stat-icon" style="background:rgba(245,158,11,0.12);">&#9881;</div>
        <div class="stat-label">В работе</div>
        <div class="stat-value" style="color:#92400e;">${totalInProgress}</div>
      </div>
      <div class="stat-card stat-card-accent" style="border-left-color:#22c55e;">
        <div class="stat-icon" style="background:rgba(34,197,94,0.12);">&#10003;</div>
        <div class="stat-label">Проданы</div>
        <div class="stat-value" style="color:#166534;">${totalSold}</div>
      </div>
      <div class="stat-card stat-card-accent" style="border-left-color:#ef4444;">
        <div class="stat-icon" style="background:rgba(239,68,68,0.12);">&#10005;</div>
        <div class="stat-label">Отклонены</div>
        <div class="stat-value" style="color:#991b1b;">${totalRejected}</div>
      </div>
    </div>

    <div class="table-card">
      <div class="table-header">
        <h3>Все заказы</h3>
        <span class="count-badge">${orders.length} заказов</span>
      </div>
      ${
        orders.length === 0
          ? `
        <div class="empty">
          <span class="empty-icon">&#128722;</span>
          <p style="font-size:16px;font-weight:600;margin-bottom:8px;">Заказов пока нет</p>
        </div>
      `
          : `
      <div style="overflow-x:auto;">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Клиент</th>
            <th>Телефон</th>
            <th>Товары</th>
            <th>Сумма</th>
            <th>Статус</th>
            <th>Дата</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      </div>
      `
      }
    </div>`;

  return pageShell('Заказы', 'orders', extraStyles, body);
}

// ═══════════════════════════════════════════════════════════════════════════════
// NEWS LIST
// ═══════════════════════════════════════════════════════════════════════════════

export function newsListPage(
  items: Array<{
    id: number;
    title: string;
    publishedAt: Date;
    author: string;
    tags: string[];
    isActive: boolean;
  }>,
  flash?: { type: 'success' | 'error'; message: string },
) {
  const rows = items
    .map((item) => {
      const dateStr = new Date(item.publishedAt).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      const tagsStr = item.tags.map((t) => escHtml(t)).join(', ') || '&#8212;';
      return `
      <tr>
        <td><span class="id">#${item.id}</span></td>
        <td><span class="name">${escHtml(item.title)}</span></td>
        <td><span class="date">${dateStr}</span></td>
        <td>${escHtml(item.author)}</td>
        <td><span class="tags-text">${tagsStr}</span></td>
        <td>
          <form method="POST" action="/admin/news/${item.id}/toggle" style="margin:0;display:inline;">
            <button type="submit" class="status-btn ${item.isActive ? 'status-active' : 'status-inactive'}">
              ${item.isActive ? '&#10003; Активен' : '&#10005; Неактивен'}
            </button>
          </form>
        </td>
        <td style="white-space:nowrap;">
          <a href="/admin/news/${item.id}/edit" class="tbl-btn">&#9998; Редактировать</a>
          <button type="button" class="tbl-btn tbl-del" onclick="openDeleteModal(${item.id}, '${escHtml(item.title)}')">&#215; Удалить</button>
        </td>
      </tr>`;
    })
    .join('');

  const extraStyles = `
    .id { font-size: 12px; color: #94a3b8; font-weight: 600; }
    .name { font-weight: 600; color: #0f172a; }
    .date { font-size: 13px; color: #64748b; }
    .tags-text { font-size: 12px; color: #64748b; }
    .status-btn {
      padding: 5px 14px; border-radius: 20px;
      font-size: 12px; font-weight: 600;
      cursor: pointer; transition: all 0.2s; border: 1px solid;
    }
    .status-active { background: #dcfce7; color: #166534; border-color: #bbf7d0; }
    .status-active:hover { background: #bbf7d0; }
    .status-inactive { background: #fef2f2; color: #dc2626; border-color: #fecaca; }
    .status-inactive:hover { background: #fecaca; }
    .tbl-btn {
      display: inline-block; padding: 6px 12px; border-radius: 8px;
      border: 1.5px solid #e2e8f0; font-size: 12px; font-weight: 600;
      cursor: pointer; background: #fff; margin-right: 4px;
      text-decoration: none; color: #0f172a; transition: all 0.2s;
    }
    .tbl-btn:hover { border-color: #f4a724; background: #fffbeb; }
    .tbl-del:hover { border-color: #dc2626 !important; color: #dc2626 !important; background: #fef2f2 !important; }
  `;

  const body = `
    <div class="breadcrumbs">
      <a href="/admin">&#127968; Главная</a>
      <span class="sep">&#8250;</span>
      <span>Новости</span>
    </div>

    <div class="page-header">
      <div>
        <h1>Новости</h1>
        <p>Управление новостями и статьями</p>
      </div>
      <a href="/admin/news/new" class="primary-btn">+ Добавить новость</a>
    </div>

    ${flashHtml(flash)}

    <div class="table-card">
      <div class="table-header">
        <h3>Список новостей</h3>
        <span class="count-badge">${items.length} записей</span>
      </div>
      ${
        items.length === 0
          ? `
        <div class="empty">
          <span class="empty-icon">&#128240;</span>
          <p style="font-size:16px;font-weight:600;margin-bottom:8px;">Новостей пока нет</p>
          <a href="/admin/news/new" class="primary-btn" style="margin-top:8px;">+ Добавить первую новость</a>
        </div>
      `
          : `
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Заголовок</th>
            <th>Опубликовано</th>
            <th>Автор</th>
            <th>Теги</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      `
      }
    </div>`;

  return pageShell(
    'Новости',
    'news',
    extraStyles,
    body,
    deleteModalScript('/admin/news'),
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// NEWS FORM (new / edit)
// ═══════════════════════════════════════════════════════════════════════════════

const NEWS_FORM_STYLES = `
  .form-card {
    background: #fff; border-radius: 14px; padding: 28px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02);
    margin-bottom: 24px; border: 1px solid #f1f5f9;
  }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  .form-group { display: flex; flex-direction: column; gap: 5px; }
  .form-group.full { grid-column: 1/-1; }
  .form-group label { font-size: 12px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.03em; }
  .form-group input, .form-group textarea {
    padding: 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 14px;
    outline: none; transition: all 0.2s; font-family: inherit; background: #fff;
  }
  .hint-text { font-size: 11px; color: #94a3b8; margin-top: 3px; }
  .checkbox-field { display: flex; align-items: center; gap: 10px; margin: 20px 0; }
  .checkbox-field input[type="checkbox"] { width: auto; }
  .form-actions { display: flex; gap: 12px; align-items: center; margin-top: 24px; padding-top: 24px; border-top: 1px solid #f1f5f9; }
  .submit-btn {
    padding: 12px 28px; background: linear-gradient(135deg, #f4a724, #e8890a); color: #0f172a;
    border: none; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer;
    transition: all 0.2s; box-shadow: 0 2px 8px rgba(244,167,36,0.25);
  }
  .submit-btn:hover { opacity: 0.9; box-shadow: 0 4px 12px rgba(244,167,36,0.35); }
  .cancel-link { padding: 12px 20px; background: #f1f5f9; border-radius: 10px; font-size: 14px; font-weight: 600; color: #374151; text-decoration: none; }
  .cancel-link:hover { background: #e2e8f0; }
  .banner-row { display: flex; gap: 12px; align-items: flex-end; }
  .banner-row input[type="url"] { flex: 1; }

  /* Editor.js overrides */
  .editor-section { margin-top: 18px; }
  .editor-section label { font-size: 12px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.03em; margin-bottom: 8px; display: block; }
  .editor-hint { font-size: 11px; color: #94a3b8; margin-top: 8px; line-height: 1.5; }
  .editor-hint code { background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-size: 11px; }
  #editor {
    border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 16px 20px;
    min-height: 450px; background: #fff;
  }
  .ce-block__content { max-width: 100%; }
  .ce-toolbar__content { max-width: 100%; }
  .codex-editor__redactor { padding-bottom: 120px !important; }
  .ce-header { font-weight: 700; }
  .ce-paragraph { line-height: 1.7; }
  .embed-tool { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
  .image-tool__image { border-radius: 8px; }
  .image-tool__caption { font-size: 13px; color: #64748b; }

  /* Preview mode */
  .preview-toggle {
    display: flex; gap: 0; border: 1.5px solid #e2e8f0; border-radius: 10px; overflow: hidden; margin-bottom: 12px;
  }
  .preview-toggle button {
    flex: 1; padding: 8px 18px; border: none; font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.2s; background: #fff; color: #64748b;
  }
  .preview-toggle button.active {
    background: linear-gradient(135deg, #f4a724, #e8890a); color: #0f172a;
  }
  .preview-toggle button:not(.active):hover { background: #f8fafc; }
  #preview-pane {
    display: none; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 28px 32px;
    min-height: 450px; background: #fff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    line-height: 1.8; color: #1a1a2e;
  }
  #preview-pane.active { display: block; }
  #editor.hidden { display: none; }

  /* Preview content styles */
  .preview-content h2 { font-size: 24px; font-weight: 700; margin: 28px 0 12px; color: #0f172a; }
  .preview-content h3 { font-size: 20px; font-weight: 700; margin: 24px 0 10px; color: #0f172a; }
  .preview-content h4 { font-size: 17px; font-weight: 700; margin: 20px 0 8px; color: #0f172a; }
  .preview-content p { margin: 0 0 16px; line-height: 1.8; font-size: 16px; }
  .preview-content ul, .preview-content ol { margin: 0 0 16px; padding-left: 24px; }
  .preview-content li { margin-bottom: 6px; font-size: 16px; line-height: 1.6; }
  .preview-content blockquote {
    border-left: 4px solid #f4a724; margin: 20px 0; padding: 12px 20px;
    background: #fffbf0; border-radius: 0 8px 8px 0; font-style: italic; color: #4a4a4a;
  }
  .preview-content pre {
    background: #1e293b; color: #e2e8f0; padding: 18px 22px; border-radius: 10px;
    overflow-x: auto; font-size: 14px; line-height: 1.6; margin: 16px 0;
  }
  .preview-content code {
    background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 14px; color: #e11d48;
  }
  .preview-content pre code { background: none; padding: 0; color: inherit; }
  .preview-content .preview-delimiter {
    text-align: center; margin: 32px 0; font-size: 24px; letter-spacing: 12px; color: #cbd5e1;
  }
  .preview-content .preview-image { margin: 20px 0; text-align: center; }
  .preview-content .preview-image img { max-width: 100%; border-radius: 10px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
  .preview-content .preview-image-caption {
    font-size: 13px; color: #64748b; margin-top: 8px; text-align: center; font-style: italic;
  }
  .preview-content .preview-embed { margin: 20px 0; }
  .preview-content .preview-embed iframe {
    width: 100%; border: none; border-radius: 10px; box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  }
  .preview-content .preview-table { margin: 16px 0; overflow-x: auto; }
  .preview-content .preview-table table {
    width: 100%; border-collapse: collapse; font-size: 14px;
  }
  .preview-content .preview-table th, .preview-content .preview-table td {
    border: 1px solid #e2e8f0; padding: 10px 14px; text-align: left;
  }
  .preview-content .preview-table th { background: #f8fafc; font-weight: 700; }
  .preview-content .preview-link {
    display: flex; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;
    margin: 16px 0; text-decoration: none; color: inherit; transition: box-shadow 0.2s;
  }
  .preview-content .preview-link:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
  .preview-content .preview-link-text { padding: 14px 18px; flex: 1; }
  .preview-content .preview-link-title { font-weight: 700; font-size: 15px; margin-bottom: 4px; }
  .preview-content .preview-link-desc { font-size: 13px; color: #64748b; }
  .preview-content .preview-link-url { font-size: 11px; color: #94a3b8; margin-top: 6px; }
  .preview-content mark { background: #fef08a; padding: 1px 4px; border-radius: 3px; }

  /* Warning block */
  .preview-content .preview-warning {
    display: flex; gap: 14px; padding: 16px 20px; border-radius: 10px;
    background: #fffbeb; border: 1px solid #fde68a; margin: 16px 0;
  }
  .preview-content .preview-warning-icon { font-size: 22px; flex-shrink: 0; }
  .preview-content .preview-warning-title { font-weight: 700; font-size: 15px; margin-bottom: 4px; }
  .preview-content .preview-warning-msg { font-size: 14px; color: #78350f; line-height: 1.6; }

  /* Checklist */
  .preview-content .preview-checklist { list-style: none; padding-left: 0; margin: 16px 0; }
  .preview-content .preview-checklist li { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 6px; font-size: 16px; }
  .preview-content .preview-checklist li::before { content: ''; display: inline-block; width: 18px; height: 18px; border: 2px solid #cbd5e1; border-radius: 4px; flex-shrink: 0; margin-top: 3px; }
  .preview-content .preview-checklist li.checked::before { background: #f4a724; border-color: #f4a724; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12.207 4.793a1 1 0 0 1 0 1.414l-5 5a1 1 0 0 1-1.414 0l-2.5-2.5a1 1 0 0 1 1.414-1.414L6.5 9.086l4.293-4.293a1 1 0 0 1 1.414 0z'/%3E%3C/svg%3E"); background-size: 14px; background-position: center; background-repeat: no-repeat; }

  /* Raw HTML */
  .preview-content .preview-raw {
    background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px;
    padding: 16px; margin: 16px 0; font-family: monospace; font-size: 13px;
    white-space: pre-wrap; color: #475569;
  }

  /* Attaches */
  .preview-content .preview-attach {
    display: flex; align-items: center; gap: 12px; padding: 14px 18px;
    border: 1px solid #e2e8f0; border-radius: 10px; margin: 16px 0;
    text-decoration: none; color: inherit; transition: box-shadow 0.2s;
  }
  .preview-content .preview-attach:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
  .preview-content .preview-attach-icon { font-size: 28px; flex-shrink: 0; }
  .preview-content .preview-attach-name { font-weight: 600; font-size: 14px; }
  .preview-content .preview-attach-size { font-size: 12px; color: #94a3b8; }

  /* Nested list */
  .preview-content ul ul, .preview-content ol ol, .preview-content ul ol, .preview-content ol ul {
    margin: 4px 0 4px 0; padding-left: 20px;
  }

  /* Alignment tune */
  .preview-content .align-center { text-align: center; }
  .preview-content .align-right { text-align: right; }
  .preview-content .align-left { text-align: left; }
  .preview-content .align-justify { text-align: justify; }
`;

export function newsFormPage(action: string, values: any, error?: string) {
  const v = values ?? {};
  const titleVal = escHtml(String(v.title ?? ''));
  const slugVal = escHtml(String(v.slug ?? ''));
  const descriptionVal = escHtml(String(v.description ?? ''));
  const authorVal = escHtml(String(v.author ?? ''));
  const publishedAtVal = escHtml(String(v.publishedAt ?? ''));
  const tagsVal = escHtml(
    Array.isArray(v.tags) ? v.tags.join(', ') : String(v.tags ?? ''),
  );
  const bannerUrlVal = escHtml(String(v.bannerUrl ?? ''));
  const contentVal = String(v.content ?? '');
  const isActiveChecked =
    v.isActive === true || v.isActive === 'on' || v.isActive === undefined
      ? 'checked'
      : '';

  const isEdit =
    action.includes('/admin/news/') && !action.endsWith('/admin/news');

  const errorHtml = error
    ? `<div class="flash flash-error">&#9888; ${escHtml(error)}</div>`
    : '';

  // Encode content for safe embedding in a script tag
  const contentB64 =
    typeof Buffer !== 'undefined'
      ? Buffer.from(contentVal, 'utf-8').toString('base64')
      : '';

  const body = `
    <a href="/admin/news" style="font-size:13px;color:#64748b;text-decoration:none;">&#8592; Назад к списку</a>
    <div class="page-header">
      <div>
        <h1>${isEdit ? 'Редактировать новость' : 'Новая новость'}</h1>
      </div>
    </div>

    ${errorHtml}

    <div class="form-card">
      <form id="news-form" method="POST" action="${escHtml(action)}" enctype="application/x-www-form-urlencoded">
        <div class="form-grid">
          <div class="form-group">
            <label>Заголовок *</label>
            <input type="text" name="title" value="${titleVal}" required />
          </div>
          <div class="form-group">
            <label>Slug</label>
            <input type="text" name="slug" value="${slugVal}" pattern="[a-z0-9-]+" />
            <p class="hint-text">Оставьте пустым для автогенерации</p>
          </div>
        </div>

        <div class="form-group full" style="margin-top:18px;">
          <label>Описание *</label>
          <textarea name="description" rows="3" required>${escHtml(descriptionVal)}</textarea>
        </div>

        <div class="form-grid" style="margin-top:18px;">
          <div class="form-group">
            <label>Автор *</label>
            <input type="text" name="author" value="${authorVal}" required />
          </div>
          <div class="form-group">
            <label>Дата публикации *</label>
            <input type="datetime-local" name="publishedAt" value="${publishedAtVal}" required style="padding:10px 14px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:14px;" />
          </div>
        </div>

        <div class="form-group full" style="margin-top:18px;">
          <label>Теги (через запятую)</label>
          <input type="text" name="tags" value="${tagsVal}" placeholder="школа, мероприятия, спорт" />
        </div>

        <div class="form-group full" style="margin-top:18px;">
          <label>Баннер *</label>
          <div class="banner-row">
            <input type="url" name="bannerUrl" value="${bannerUrlVal}" required placeholder="https://..." />
            <input type="file" id="banner-upload" accept="image/*" style="width:auto;" />
          </div>
          <p class="hint-text">Загрузите файл или укажите URL картинки-обложки</p>
        </div>

        <!-- Hidden field for editor content -->
        <input type="hidden" name="content" id="content-hidden" />

        <div class="editor-section">
          <label>Контент *</label>
          <div class="preview-toggle">
            <button type="button" id="btn-editor" class="active" onclick="switchToEditor()">Редактор</button>
            <button type="button" id="btn-preview" onclick="switchToPreview()">Предпросмотр</button>
          </div>
          <div id="editor"></div>
          <div id="preview-pane"><div class="preview-content" id="preview-content"></div></div>
          <p class="editor-hint" id="editor-hint">
            Нажмите <code>+</code> или <code>/</code> для выбора блока. Выравнивание текста: нажмите на абзац, в появившемся тулбаре выберите нужное выравнивание.<br/>
            <strong>YouTube / Instagram / Vimeo:</strong> вставьте ссылку (Ctrl+V) в пустой абзац — она автоматически превратится в плеер.
          </p>
        </div>

        <div class="checkbox-field">
          <input type="checkbox" name="isActive" id="isActive" ${isActiveChecked} />
          <label for="isActive" style="margin:0;">Активна</label>
        </div>

        <div class="form-actions">
          <button type="submit" class="submit-btn">${isEdit ? '&#128190; Сохранить изменения' : '+ Добавить новость'}</button>
          <a href="/admin/news" class="cancel-link">Отмена</a>
        </div>
      </form>
    </div>

    `;

  const scripts = `
<script src="https://cdn.jsdelivr.net/npm/@editorjs/editorjs@2/dist/editorjs.umd.min.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/@editorjs/header@2/dist/header.umd.min.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/@editorjs/nested-list@1/dist/nested-list.min.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/@editorjs/checklist@1/dist/bundle.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/@editorjs/quote@2/dist/bundle.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/@editorjs/warning@1/dist/bundle.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/@editorjs/code@2/dist/bundle.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/@editorjs/delimiter@1/dist/bundle.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/@editorjs/table@2/dist/table.min.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/@editorjs/image@2/dist/bundle.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/@editorjs/embed@2/dist/bundle.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/@editorjs/link@2/dist/bundle.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/@editorjs/attaches@1/dist/bundle.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/@editorjs/raw@2/dist/bundle.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/@editorjs/marker@1/dist/bundle.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/@editorjs/inline-code@1/dist/bundle.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/@editorjs/underline@1/dist/bundle.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/editorjs-paragraph-with-alignment@3/dist/bundle.js"><\/script>
<script>
(function () {
  // Decode initial content from base64
  var initialData = null;
  try {
    var raw = atob('${contentB64}');
    if (raw) {
      var parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.blocks)) initialData = parsed;
    }
  } catch(_) {}

  // ── Initialize Editor.js ──
  var editorConfig = {
    holder: 'editor',
    placeholder: 'Начните писать статью... (нажмите / для выбора блока)',
    tools: (function() {
      var t = {};
      function add(name, cls, opts) { if (cls) t[name] = Object.assign({ class: cls }, opts || {}); }
      add('paragraph', window.Paragraph, { inlineToolbar: true, config: { preserveBlank: true } });
      add('header', window.Header, { config: { levels: [1, 2, 3, 4, 5, 6], defaultLevel: 2 }, inlineToolbar: true });
      add('list', window.NestedList || window.List || window.EditorjsList, { inlineToolbar: true, config: { defaultStyle: 'unordered' } });
      add('checklist', window.Checklist, { inlineToolbar: true });
      add('quote', window.Quote, { inlineToolbar: true, config: { quotePlaceholder: 'Введите цитату', captionPlaceholder: 'Автор цитаты' } });
      add('warning', window.Warning, { inlineToolbar: true, config: { titlePlaceholder: 'Заголовок', messagePlaceholder: 'Сообщение' } });
      add('code', window.CodeTool, { config: { placeholder: 'Введите код...' } });
      add('delimiter', window.Delimiter);
      add('table', window.Table, { inlineToolbar: true, config: { rows: 2, cols: 3, withHeadings: true } });
      add('image', window.ImageTool, {
        config: {
          endpoints: { byFile: '/admin/news/upload-image', byUrl: '/admin/news/upload-image-url' },
          field: 'image',
          captionPlaceholder: 'Подпись к изображению',
        },
      });
      add('embed', window.Embed, {
        inlineToolbar: true,
        config: {
          services: {
            youtube: true, vimeo: true, instagram: true, twitter: true,
            coub: true, codepen: true, imgur: true, gfycat: true,
            'twitch-video': true, 'twitch-channel': true, pinterest: true, facebook: true,
          },
        },
      });
      add('linkTool', window.LinkTool);
      add('attaches', window.AttachesTool, { config: { endpoint: '/admin/news/upload-file', field: 'file' } });
      add('raw', window.RawTool, { config: { placeholder: 'Вставьте HTML код...' } });
      add('marker', window.Marker);
      add('inlineCode', window.InlineCode);
      add('underline', window.Underline);
      return t;
    })(),
  };

  if (initialData) editorConfig.data = initialData;

  var editor = new window.EditorJS(editorConfig);

  // ── Form submit: save Editor.js data to hidden field ──
  document.getElementById('news-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var form = this;
    editor.save().then(function(outputData) {
      if (!outputData.blocks || outputData.blocks.length === 0) {
        alert('Пожалуйста, добавьте контент статьи');
        return;
      }
      document.getElementById('content-hidden').value = JSON.stringify(outputData);
      form.submit();
    }).catch(function(err) {
      console.error('Editor.js save error:', err);
      alert('Ошибка сохранения контента');
    });
  });

  // ── Banner upload ──
  var bannerBtn = document.getElementById('banner-upload');
  if (bannerBtn) bannerBtn.addEventListener('change', async function (e) {
    var file = e.target.files && e.target.files[0]; if (!file) return;
    try {
      var fd = new FormData(); fd.append('image', file);
      var res = await fetch('/admin/news/upload-image', { method: 'POST', body: fd, credentials: 'include' });
      if (!res.ok) throw new Error('upload failed');
      var data = await res.json();
      if (data.success === 1 && data.file && data.file.url) {
        document.querySelector('input[name="bannerUrl"]').value = data.file.url;
      } else { throw new Error('upload failed'); }
    } catch (_) { alert('Upload failed'); }
    e.target.value = '';
  });

  // ── Preview mode ──
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  function renderBlock(block) {
    var d = block.data || {};
    switch (block.type) {
      case 'header':
        var lvl = d.level || 2;
        return '<h' + lvl + '>' + (d.text || '') + '</h' + lvl + '>';
      case 'paragraph':
        return '<p>' + (d.text || '') + '</p>';
      case 'list':
        var tag = d.style === 'ordered' ? 'ol' : 'ul';
        var items = (d.items || []).map(function(it) {
          var txt = typeof it === 'string' ? it : (it.content || it.text || '');
          return '<li>' + txt + '</li>';
        }).join('');
        return '<' + tag + '>' + items + '</' + tag + '>';
      case 'quote':
        return '<blockquote>' + (d.text || '') +
          (d.caption ? '<footer style="margin-top:8px;font-size:13px;color:#94a3b8;">— ' + esc(d.caption) + '</footer>' : '') +
          '</blockquote>';
      case 'code':
        return '<pre><code>' + esc(d.code || '') + '</code></pre>';
      case 'delimiter':
        return '<div class="preview-delimiter">***</div>';
      case 'image':
        var src = (d.file && d.file.url) || d.url || '';
        if (!src) return '';
        var stretched = d.stretched ? 'width:100%;' : 'max-width:680px;';
        var border = d.withBorder ? 'border:2px solid #e2e8f0;' : '';
        var bg = d.withBackground ? 'background:#f8fafc;padding:16px;' : '';
        return '<div class="preview-image" style="' + esc(bg) + '">' +
          '<img src="' + esc(src) + '" alt="' + esc(d.caption || '') + '" style="' + stretched + border + 'border-radius:10px;" />' +
          (d.caption ? '<div class="preview-image-caption">' + esc(d.caption) + '</div>' : '') +
          '</div>';
      case 'embed':
        var embedSrc = d.embed || d.source || '';
        var h = parseInt(d.height, 10) || 320;
        return '<div class="preview-embed"><iframe src="' + esc(embedSrc) + '" height="' + h + '" allowfullscreen></iframe></div>';
      case 'table':
        if (!d.content || !d.content.length) return '';
        var hasHead = d.withHeadings;
        var rows = d.content.map(function(row, i) {
          var cellTag = (hasHead && i === 0) ? 'th' : 'td';
          return '<tr>' + row.map(function(c) { return '<' + cellTag + '>' + c + '</' + cellTag + '>'; }).join('') + '</tr>';
        }).join('');
        return '<div class="preview-table"><table>' + rows + '</table></div>';
      case 'linkTool':
        var href = d.link || '#';
        var meta = d.meta || {};
        return '<a class="preview-link" href="' + esc(href) + '" target="_blank" rel="noopener">' +
          '<div class="preview-link-text">' +
          '<div class="preview-link-title">' + esc(meta.title || href) + '</div>' +
          (meta.description ? '<div class="preview-link-desc">' + esc(meta.description) + '</div>' : '') +
          '<div class="preview-link-url">' + esc(href) + '</div>' +
          '</div></a>';
      case 'checklist':
        var checkItems = (d.items || []).map(function(it) {
          var cls = it.checked ? ' class="checked"' : '';
          return '<li' + cls + '>' + (it.text || '') + '</li>';
        }).join('');
        return '<ul class="preview-checklist">' + checkItems + '</ul>';
      case 'warning':
        return '<div class="preview-warning">' +
          '<div class="preview-warning-icon">&#9888;</div>' +
          '<div><div class="preview-warning-title">' + esc(d.title || '') + '</div>' +
          '<div class="preview-warning-msg">' + (d.message || '') + '</div></div></div>';
      case 'raw':
        return '<div class="preview-raw">' + esc(d.html || '') + '</div>';
      case 'attaches':
        var fileUrl = (d.file && d.file.url) || '#';
        var fileName = d.title || (d.file && d.file.name) || 'Файл';
        var fileSize = (d.file && d.file.size) ? (d.file.size / 1024).toFixed(1) + ' KB' : '';
        var ext = (d.file && d.file.extension) || '';
        return '<a class="preview-attach" href="' + esc(fileUrl) + '" target="_blank" rel="noopener">' +
          '<div class="preview-attach-icon">&#128206;</div>' +
          '<div><div class="preview-attach-name">' + esc(fileName) + (ext ? ' .' + esc(ext) : '') + '</div>' +
          (fileSize ? '<div class="preview-attach-size">' + esc(fileSize) + '</div>' : '') +
          '</div></a>';
      default:
        return '';
    }
    // Apply text variant/alignment tunes
  }

  function applyTunes(html, block) {
    var tunes = block.tunes || {};
    var d = block.data || {};
    var align = d.alignment || (tunes.alignmentTune && tunes.alignmentTune.alignment) || '';
    if (align && align !== 'left') {
      html = '<div style="text-align:' + esc(align) + ';">' + html + '</div>';
    }
    return html;
  }

  window.switchToPreview = function() {
    document.getElementById('btn-editor').classList.remove('active');
    document.getElementById('btn-preview').classList.add('active');
    document.getElementById('editor').classList.add('hidden');
    document.getElementById('editor-hint').style.display = 'none';
    var pane = document.getElementById('preview-pane');
    pane.classList.add('active');
    editor.save().then(function(data) {
      var container = document.getElementById('preview-content');
      while (container.firstChild) container.removeChild(container.firstChild);
      if (data.blocks && data.blocks.length) {
        var wrapper = document.createElement('div');
        wrapper.innerHTML = data.blocks.map(function(b) { return applyTunes(renderBlock(b), b); }).join('');
        while (wrapper.firstChild) container.appendChild(wrapper.firstChild);
      } else {
        var empty = document.createElement('p');
        empty.style.cssText = 'color:#94a3b8;font-style:italic;';
        empty.textContent = 'Контент пуст. Вернитесь в редактор и добавьте блоки.';
        container.appendChild(empty);
      }
    });
  };

  window.switchToEditor = function() {
    document.getElementById('btn-preview').classList.remove('active');
    document.getElementById('btn-editor').classList.add('active');
    document.getElementById('editor').classList.remove('hidden');
    document.getElementById('editor-hint').style.display = '';
    document.getElementById('preview-pane').classList.remove('active');
  };

  // Store editor ref globally for debugging
  window.__newsEditor = editor;
})();
<\/script>`;

  return pageShell(
    isEdit ? 'Редактировать новость' : 'Новая новость',
    'news',
    NEWS_FORM_STYLES,
    body,
    scripts,
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTACT MESSAGES (Обращения)
// ═══════════════════════════════════════════════════════════════════════════════

export function contactMessagesPage(
  messages: Array<{
    id: number;
    name: string;
    email: string;
    phone: string | null;
    message: string;
    createdAt: Date;
  }>,
) {
  const total = messages.length;
  const today = messages.filter((m) => {
    const d = new Date(m.createdAt);
    const now = new Date();
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  }).length;

  const rows = messages
    .map((m) => {
      const date = new Date(m.createdAt);
      const dateStr = date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      const timeStr = date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const shortMsg =
        m.message.length > 120
          ? escHtml(m.message.slice(0, 120)) + '&hellip;'
          : escHtml(m.message);
      return `
      <tr>
        <td><span class="id">#${m.id}</span></td>
        <td><span class="contact-name">${escHtml(m.name)}</span></td>
        <td><a href="mailto:${escHtml(m.email)}" class="contact-email">${escHtml(m.email)}</a></td>
        <td><span class="contact-phone">${m.phone ? escHtml(m.phone) : '—'}</span></td>
        <td><span class="contact-msg" title="${escHtml(m.message)}">${shortMsg}</span></td>
        <td><span class="date">${dateStr}</span><br/><span class="time">${timeStr}</span></td>
        <td>
          <button type="button" class="del-btn" onclick="openDeleteModal(${m.id}, '${escHtml(m.name)}')">&#10005; Удалить</button>
        </td>
      </tr>`;
    })
    .join('');

  const extraStyles = `
    .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 28px; }
    .stat-card {
      background: #fff; border-radius: 14px; padding: 22px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02);
      border: 1px solid #f1f5f9;
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
    .stat-label { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
    .stat-value { font-size: 32px; font-weight: 800; color: #0f172a; margin-top: 6px; letter-spacing: -0.02em; }
    .stat-sub { font-size: 12px; color: #94a3b8; margin-top: 4px; }
    .stat-card.accent { border-color: rgba(244,167,36,0.2); }
    .stat-card.accent .stat-value { color: #f4a724; }
    .id { font-size: 12px; color: #94a3b8; font-weight: 600; }
    .contact-name { font-weight: 600; color: #0f172a; }
    .contact-email { color: #2563eb; text-decoration: none; font-size: 13px; }
    .contact-email:hover { text-decoration: underline; }
    .contact-phone { color: #374151; font-family: monospace; font-size: 13px; }
    .contact-msg { font-size: 13px; color: #475569; line-height: 1.4; }
    .date { font-size: 13px; color: #374151; }
    .time { font-size: 11px; color: #94a3b8; }
  `;

  const body = `
    <div class="breadcrumbs">
      <a href="/admin">&#127968; Главная</a>
      <span class="sep">&#8250;</span>
      <span>Обращения</span>
    </div>

    <div class="page-header">
      <div>
        <h1>Обращения</h1>
        <p>Сообщения с контактной формы</p>
      </div>
      <a href="/admin/contacts" class="refresh-btn">&#8635; Обновить</a>
    </div>

    <div class="stats">
      <div class="stat-card stat-card-accent" style="border-left-color:#f4a724;">
        <div class="stat-icon" style="background:rgba(244,167,36,0.12);">&#128172;</div>
        <div class="stat-label">Всего обращений</div>
        <div class="stat-value" style="color:#f4a724;">${total}</div>
        <div class="stat-sub">за всё время</div>
      </div>
      <div class="stat-card stat-card-accent" style="border-left-color:#22c55e;">
        <div class="stat-icon" style="background:rgba(34,197,94,0.12);">&#128161;</div>
        <div class="stat-label">Сегодня</div>
        <div class="stat-value" style="color:#22c55e;">${today}</div>
        <div class="stat-sub">новых обращений</div>
      </div>
    </div>

    <div class="table-card">
      <div class="table-header">
        <h3>Список обращений</h3>
        <span class="count-badge">${total} записей</span>
      </div>
      ${
        total === 0
          ? `
        <div class="empty" style="padding:80px 20px;">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style="margin:0 auto 20px;display:block;opacity:0.4;">
            <path d="M16 20h48c2.2 0 4 1.8 4 4v32c0 2.2-1.8 4-4 4H32l-12 10V60h-4c-2.2 0-4-1.8-4-4V24c0-2.2 1.8-4 4-4z" stroke="#94a3b8" stroke-width="2.5" fill="none"/>
            <line x1="26" y1="35" x2="54" y2="35" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round"/>
            <line x1="26" y1="45" x2="46" y2="45" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <p style="font-size:16px;font-weight:700;color:#374151;margin-bottom:6px;">Обращений пока нет</p>
          <p style="font-size:13px;color:#94a3b8;max-width:320px;margin:0 auto;">Обращения появятся здесь, когда посетители отправят сообщение через контактную форму</p>
        </div>
      `
          : `
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Имя</th>
            <th>Email</th>
            <th>Телефон</th>
            <th>Сообщение</th>
            <th>Дата</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      `
      }
    </div>`;

  return pageShell(
    'Обращения',
    'contacts',
    extraStyles,
    body,
    deleteModalScript('/admin/contacts'),
  );
}
