import { escHtml, pageShell, flashHtml } from '../admin.templates';
import { HUMAN_STATUS } from '../../mail/templates/brand';
import type { TournamentRegistration, RegistrationStatus } from '@prisma/client';

// ─── Status badge config ──────────────────────────────────────────────────────

const STATUS_BG: Record<string, string> = {
  NEW: '#64748b',
  PAID: '#f59e0b',
  CONFIRMED: '#10b981',
  REJECTED: '#dc2626',
  CANCELLED: '#94a3b8',
};

function statusBadge(status: string): string {
  const bg = STATUS_BG[status] ?? '#94a3b8';
  const label = HUMAN_STATUS[status] ?? escHtml(status);
  return `<span style="display:inline-block;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;background:${bg};color:#fff;">${label}</span>`;
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const LIST_STYLES = `
  .filter-form { background:#fff;border-radius:14px;padding:20px 24px;margin-bottom:20px;border:1px solid #f1f5f9;box-shadow:0 1px 3px rgba(0,0,0,0.04); }
  .filter-row { display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end; }
  .filter-group { display:flex;flex-direction:column;gap:4px;min-width:140px; }
  .filter-group label { font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.03em; }
  .filter-group input, .filter-group select { padding:8px 12px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:13px;font-family:inherit;background:#fff; }
  .filter-btn { padding:9px 20px;background:linear-gradient(135deg,#f4a724,#e8890a);color:#0f172a;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer; }
  .filter-reset { padding:9px 16px;background:#f1f5f9;border-radius:8px;font-size:13px;font-weight:600;color:#374151;text-decoration:none; }
  .filter-reset:hover { background:#e2e8f0; }
  .name { font-weight:600;color:#0f172a; }
  .tbl-btn {
    display:inline-block;padding:6px 12px;border-radius:8px;
    border:1.5px solid #e2e8f0;font-size:12px;font-weight:600;
    cursor:pointer;background:#fff;margin-right:4px;
    text-decoration:none;color:#0f172a;transition:all 0.2s;
  }
  .tbl-btn:hover { border-color:#f4a724;background:#fffbeb; }
  .pagination { display:flex;gap:6px;justify-content:center;margin-top:20px;flex-wrap:wrap; }
  .pagination a, .pagination span {
    display:inline-block;padding:7px 14px;border-radius:8px;font-size:13px;font-weight:600;
    border:1.5px solid #e2e8f0;text-decoration:none;color:#374151;background:#fff;
  }
  .pagination a:hover { border-color:#f4a724;background:#fffbeb; }
  .pagination .current { background:linear-gradient(135deg,#f4a724,#e8890a);color:#0f172a;border-color:#f4a724; }
`;

const DETAIL_STYLES = `
  .detail-grid { display:grid;grid-template-columns:1fr 320px;gap:24px; }
  @media (max-width:900px) { .detail-grid { grid-template-columns:1fr; } }
  .detail-card {
    background:#fff;border-radius:14px;padding:28px;
    box-shadow:0 1px 3px rgba(0,0,0,0.04),0 4px 12px rgba(0,0,0,0.02);
    margin-bottom:24px;border:1px solid #f1f5f9;
  }
  .detail-label { font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:2px; }
  .detail-value { font-size:15px;color:#0f172a;margin-bottom:16px; }
  .detail-section { margin-top:20px;padding-top:16px;border-top:1px solid #f1f5f9; }
  .detail-section-title { font-size:13px;font-weight:700;color:#374151;margin-bottom:8px; }
  aside.detail-aside { position:sticky;top:24px; }
  .aside-card {
    background:#fff;border-radius:14px;padding:24px;
    box-shadow:0 1px 3px rgba(0,0,0,0.04),0 4px 12px rgba(0,0,0,0.02);
    border:1px solid #f1f5f9;margin-bottom:16px;
  }
  .aside-label { font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px; }
  .form-group { display:flex;flex-direction:column;gap:5px;margin-bottom:12px; }
  .form-group label { font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.03em; }
  .form-group select, .form-group textarea {
    padding:10px 14px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:14px;
    outline:none;transition:all 0.2s;font-family:inherit;background:#fff;
  }
  .form-group select:focus, .form-group textarea:focus { border-color:#f4a724; }
  .submit-btn {
    width:100%;padding:11px 20px;background:linear-gradient(135deg,#f4a724,#e8890a);color:#0f172a;
    border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;
    transition:all 0.2s;box-shadow:0 2px 8px rgba(244,167,36,0.25);
  }
  .submit-btn:hover { opacity:0.9; }
  .btn-danger {
    width:100%;padding:10px 20px;background:#fff;border:1.5px solid #dc2626;color:#dc2626;
    border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;transition:all 0.2s;
  }
  .btn-danger:hover { background:#fef2f2; }
  .hint-text { font-size:11px;color:#94a3b8;margin-top:4px; }
`;

// ─── Registrations list ───────────────────────────────────────────────────────

export function registrationsListPage(
  items: (TournamentRegistration & {
    tournament: { id: number; title: string; slug: string };
  })[],
  query: {
    tournamentId?: number;
    status?: string;
    from?: string;
    to?: string;
    search?: string;
    page: number;
    pageSize: number;
  },
  total: number,
  tournaments: { id: number; title: string }[],
): string {
  const statusOptions = ['NEW', 'PAID', 'CONFIRMED', 'REJECTED', 'CANCELLED'];

  const tournamentOptionsHtml =
    `<option value="">Все турниры</option>` +
    tournaments
      .map(
        (t) =>
          `<option value="${t.id}" ${query.tournamentId === t.id ? 'selected' : ''}>${escHtml(t.title)}</option>`,
      )
      .join('');

  const statusOptionsHtml =
    `<option value="">Все статусы</option>` +
    statusOptions
      .map(
        (s) =>
          `<option value="${s}" ${query.status === s ? 'selected' : ''}>${HUMAN_STATUS[s] ?? s}</option>`,
      )
      .join('');

  const rows = items
    .map((item) => {
      const dateStr = new Date(item.createdAt).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      return `
      <tr>
        <td style="font-size:12px;color:#64748b;white-space:nowrap;">${dateStr}</td>
        <td><span class="name">${escHtml(item.participantName)}</span>${item.parentName ? `<br/><span style="font-size:11px;color:#64748b;">Родитель: ${escHtml(item.parentName)}</span>` : ''}</td>
        <td style="font-size:13px;">${escHtml(item.phone)}</td>
        <td style="font-size:13px;">${item.email ? escHtml(item.email) : '&#8212;'}</td>
        <td><a href="/admin/tournaments/${item.tournament.id}/edit" style="font-size:12px;color:#6366f1;text-decoration:none;">${escHtml(item.tournament.title)}</a></td>
        <td>${statusBadge(item.status)}</td>
        <td><a href="/admin/tournament-registrations/${item.id}" class="tbl-btn">&#128065; Открыть</a></td>
      </tr>`;
    })
    .join('');

  // Pagination
  const totalPages = Math.max(1, Math.ceil(total / query.pageSize));
  const buildPageUrl = (p: number): string => {
    const params = new URLSearchParams();
    if (query.tournamentId) params.set('tournamentId', String(query.tournamentId));
    if (query.status) params.set('status', query.status);
    if (query.from) params.set('from', query.from);
    if (query.to) params.set('to', query.to);
    if (query.search) params.set('search', query.search);
    params.set('page', String(p));
    params.set('pageSize', String(query.pageSize));
    return `/admin/tournament-registrations?${params.toString()}`;
  };

  let paginationHtml = '';
  if (totalPages > 1) {
    const links: string[] = [];
    if (query.page > 1) {
      links.push(`<a href="${escHtml(buildPageUrl(query.page - 1))}">&#8592; Назад</a>`);
    }
    for (let p = 1; p <= totalPages; p++) {
      if (
        p === 1 ||
        p === totalPages ||
        Math.abs(p - query.page) <= 2
      ) {
        if (p === query.page) {
          links.push(`<span class="current">${p}</span>`);
        } else {
          links.push(`<a href="${escHtml(buildPageUrl(p))}">${p}</a>`);
        }
      } else if (
        (p === 2 && query.page > 4) ||
        (p === totalPages - 1 && query.page < totalPages - 3)
      ) {
        links.push(`<span style="color:#94a3b8;">&#8230;</span>`);
      }
    }
    if (query.page < totalPages) {
      links.push(`<a href="${escHtml(buildPageUrl(query.page + 1))}">Вперёд &#8594;</a>`);
    }
    paginationHtml = `<div class="pagination">${links.join('')}</div>`;
  }

  const body = `
    <div class="breadcrumbs">
      <a href="/admin">&#127968; Главная</a>
      <span class="sep">&#8250;</span>
      <span>Заявки на турниры</span>
    </div>

    <div class="page-header">
      <div>
        <h1>Заявки на турниры</h1>
        <p>Всего записей: ${total}</p>
      </div>
    </div>

    <div class="filter-form">
      <form method="GET" action="/admin/tournament-registrations">
        <div class="filter-row">
          <div class="filter-group">
            <label>Турнир</label>
            <select name="tournamentId">${tournamentOptionsHtml}</select>
          </div>
          <div class="filter-group">
            <label>Статус</label>
            <select name="status">${statusOptionsHtml}</select>
          </div>
          <div class="filter-group">
            <label>Дата от</label>
            <input type="date" name="from" value="${escHtml(query.from ?? '')}" />
          </div>
          <div class="filter-group">
            <label>Дата до</label>
            <input type="date" name="to" value="${escHtml(query.to ?? '')}" />
          </div>
          <div class="filter-group" style="flex:1;min-width:180px;">
            <label>Поиск</label>
            <input type="text" name="search" value="${escHtml(query.search ?? '')}" placeholder="Имя, телефон, email..." />
          </div>
          <button type="submit" class="filter-btn">Применить</button>
          <a href="/admin/tournament-registrations" class="filter-reset">Сбросить</a>
        </div>
        <input type="hidden" name="pageSize" value="${query.pageSize}" />
      </form>
    </div>

    <div class="table-card">
      <div class="table-header">
        <h3>Заявки <span class="count-badge">${total}</span></h3>
      </div>
      ${
        items.length === 0
          ? `
        <div class="empty">
          <span class="empty-icon">&#128221;</span>
          <p style="font-size:16px;font-weight:600;margin-bottom:8px;">Заявок не найдено</p>
        </div>
      `
          : `
      <div style="overflow-x:auto;">
      <table>
        <thead>
          <tr>
            <th>Дата</th>
            <th>ФИО</th>
            <th>Телефон</th>
            <th>Email</th>
            <th>Турнир</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      </div>
      `
      }
    </div>

    ${paginationHtml}`;

  return pageShell('Заявки на турниры', 'tournament-registrations', LIST_STYLES, body, '');
}

// ─── Registration detail ──────────────────────────────────────────────────────

export function registrationDetailPage(
  reg: TournamentRegistration & {
    tournament: { id: number; title: string; slug: string };
  },
  flash?: string,
): string {
  const statusOptions: RegistrationStatus[] = [
    'NEW',
    'PAID',
    'CONFIRMED',
    'REJECTED',
    'CANCELLED',
  ];

  const dateStr = new Date(reg.createdAt).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const statusSelectOptions = statusOptions
    .map(
      (s) =>
        `<option value="${s}" ${reg.status === s ? 'selected' : ''}>${HUMAN_STATUS[s] ?? s}</option>`,
    )
    .join('');

  const flashHtmlStr = flash ? flashHtml({ type: 'success', message: flash }) : '';

  const body = `
    <a href="/admin/tournament-registrations" style="font-size:13px;color:#64748b;text-decoration:none;">&#8592; Назад к заявкам</a>
    <div class="page-header">
      <div>
        <h1 style="margin-top:4px;">Заявка #${reg.id}</h1>
        <p>${escHtml(reg.tournament.title)}</p>
      </div>
    </div>

    ${flashHtmlStr}

    <div class="detail-grid">
      <!-- LEFT: participant info -->
      <div>
        <div class="detail-card">
          <div class="detail-label">Участник</div>
          <div class="detail-value" style="font-size:18px;font-weight:700;">${escHtml(reg.participantName)}</div>

          ${reg.parentName ? `<div class="detail-label">Родитель / Представитель</div><div class="detail-value">${escHtml(reg.parentName)}</div>` : ''}

          <div class="detail-label">Телефон</div>
          <div class="detail-value"><a href="tel:${escHtml(reg.phone)}" style="color:#0f172a;">${escHtml(reg.phone)}</a></div>

          <div class="detail-label">Email</div>
          <div class="detail-value">${reg.email ? `<a href="mailto:${escHtml(reg.email)}" style="color:#6366f1;">${escHtml(reg.email)}</a>` : '&#8212;'}</div>

          ${reg.grade ? `<div class="detail-label">Класс / Возрастная группа</div><div class="detail-value">${escHtml(reg.grade)}</div>` : ''}

          <div class="detail-label">Турнир</div>
          <div class="detail-value"><a href="/admin/tournaments/${reg.tournament.id}/edit" style="color:#6366f1;">${escHtml(reg.tournament.title)}</a></div>

          <div class="detail-label">Дата подачи заявки</div>
          <div class="detail-value">${dateStr}</div>

          ${reg.comment ? `
          <div class="detail-section">
            <div class="detail-section-title">&#128172; Комментарий участника</div>
            <div style="font-size:14px;color:#374151;line-height:1.6;background:#f8fafc;border-radius:8px;padding:12px 16px;">${escHtml(reg.comment)}</div>
          </div>
          ` : ''}

          ${reg.paymentNote || reg.receiptUrl ? `
          <div class="detail-section">
            <div class="detail-section-title">&#128179; Подтверждение оплаты</div>
            ${reg.paymentNote ? `<div style="font-size:14px;color:#374151;margin-bottom:8px;">${escHtml(reg.paymentNote)}</div>` : ''}
            ${reg.receiptUrl ? `<a href="${escHtml(reg.receiptUrl)}" target="_blank" rel="noopener" style="font-size:13px;color:#6366f1;">&#128269; Открыть квитанцию</a>` : ''}
          </div>
          ` : ''}

          ${reg.adminNote ? `
          <div class="detail-section">
            <div class="detail-section-title">&#128221; Заметка администратора</div>
            <div style="font-size:14px;color:#374151;line-height:1.6;background:#fffbeb;border-radius:8px;padding:12px 16px;border:1px solid #fde68a;">${escHtml(reg.adminNote)}</div>
          </div>
          ` : ''}
        </div>
      </div>

      <!-- RIGHT: actions -->
      <aside class="detail-aside">
        <div class="aside-card">
          <div class="aside-label">Текущий статус</div>
          <div style="margin-bottom:20px;">${statusBadge(reg.status)}</div>

          <div class="aside-label">Изменить статус</div>
          <form method="POST" action="/admin/tournament-registrations/${reg.id}/status">
            <div class="form-group">
              <label>Новый статус</label>
              <select name="status" required>
                ${statusSelectOptions}
              </select>
            </div>
            <div class="form-group">
              <label>Заметка администратора (опц.)</label>
              <textarea name="adminNote" rows="3" placeholder="Заметка видна только администраторам...">${escHtml(reg.adminNote ?? '')}</textarea>
            </div>
            <button type="submit" class="submit-btn">&#9998; Обновить статус</button>
            <p class="hint-text" style="margin-top:8px;">
              ${reg.email ? '&#9993;&#65039; При смене статуса участнику отправится email' : '&#128683; Email не будет отправлен (не указан)'}
            </p>
          </form>
        </div>

        <div class="aside-card">
          <div class="aside-label" style="color:#dc2626;">Удалить заявку</div>
          <form method="POST" action="/admin/tournament-registrations/${reg.id}/delete" onsubmit="return confirm('Удалить заявку безвозвратно?');">
            <button type="submit" class="btn-danger">&#128465; Удалить заявку</button>
          </form>
        </div>
      </aside>
    </div>`;

  return pageShell(
    'Заявка #' + reg.id,
    'tournament-registrations',
    DETAIL_STYLES,
    body,
    '',
  );
}
