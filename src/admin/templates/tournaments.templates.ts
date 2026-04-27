import { escHtml, pageShell, flashHtml } from '../admin.templates';
import type { Tournament, Club } from '@prisma/client';

// ─── Shared styles ────────────────────────────────────────────────────────────

const LIST_STYLES = `
  .id { font-size: 12px; color: #94a3b8; font-weight: 600; }
  .name { font-weight: 600; color: #0f172a; }
  .slug-text { font-size: 11px; color: #64748b; }
  .club-text { font-size: 11px; color: #6366f1; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
  .tbl-btn {
    display: inline-block; padding: 6px 12px; border-radius: 8px;
    border: 1.5px solid #e2e8f0; font-size: 12px; font-weight: 600;
    cursor: pointer; background: #fff; margin-right: 4px;
    text-decoration: none; color: #0f172a; transition: all 0.2s;
  }
  .tbl-btn:hover { border-color: #f4a724; background: #fffbeb; }
  .tbl-del:hover { border-color: #dc2626 !important; color: #dc2626 !important; background: #fef2f2 !important; }
`;

const FORM_STYLES = `
  .form-card {
    background: #fff; border-radius: 14px; padding: 28px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02);
    margin-bottom: 24px; border: 1px solid #f1f5f9;
  }
  fieldset { border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin-bottom: 20px; }
  legend { font-size: 12px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.05em; padding: 0 8px; }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  .form-group { display: flex; flex-direction: column; gap: 5px; }
  .form-group.full { grid-column: 1/-1; }
  .form-group label { font-size: 12px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.03em; }
  .form-group input, .form-group textarea, .form-group select {
    padding: 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 14px;
    outline: none; transition: all 0.2s; font-family: inherit; background: #fff;
  }
  .form-group input:focus, .form-group textarea:focus, .form-group select:focus { border-color: #f4a724; }
  .hint-text { font-size: 11px; color: #94a3b8; margin-top: 3px; }
  .checkbox-field { display: flex; align-items: center; gap: 10px; margin: 8px 0; }
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
  .current-img { display: flex; align-items: center; gap: 12px; background: #f8fafc; border-radius: 10px; padding: 10px 14px; margin-bottom: 12px; border: 1px solid #f1f5f9; }
  .current-img img { width: 56px; height: 56px; object-fit: cover; border-radius: 8px; }
  .current-img span { font-size: 12px; color: #64748b; }
  .upload-area {
    border: 2px dashed #e2e8f0; border-radius: 12px; padding: 24px; text-align: center;
    cursor: pointer; transition: all 0.2s; background: #fafbfc; position: relative;
  }
  .upload-area:hover { border-color: #f4a724; background: #fffbeb; }
  .upload-area input[type=file] { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
  .upload-area-icon { font-size: 32px; margin-bottom: 8px; opacity: 0.6; }
  .upload-area-text { font-size: 13px; color: #64748b; }
  .upload-area-text strong { color: #0f172a; }
  .stage-add-btn {
    margin-top: 8px; padding: 8px 16px; background: #f1f5f9; border: 1.5px solid #e2e8f0;
    border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; color: #374151;
    transition: all 0.2s;
  }
  .stage-add-btn:hover { border-color: #f4a724; background: #fffbeb; }
`;

// ─── Tournaments list ─────────────────────────────────────────────────────────

export function tournamentsListPage(
  items: (Tournament & { club?: { id: number; name: string } | null })[],
  flash?: string,
): string {
  const rows = items
    .map((item) => {
      const startStr = new Date(item.startDate).toLocaleDateString('ru');
      const endStr = new Date(item.endDate).toLocaleDateString('ru');
      const priceStr = item.isFree
        ? 'Бесплатно'
        : `${item.price.toLocaleString('ru-RU')} &#8376;`;

      const activeBg = item.isActive ? '#dcfce7' : '#f1f5f9';
      const activeColor = item.isActive ? '#166534' : '#64748b';
      const activeLabel = item.isActive ? 'Активен' : 'Неактивен';

      const regBg = item.isRegistrationOpen ? '#dbeafe' : '#f1f5f9';
      const regColor = item.isRegistrationOpen ? '#1e40af' : '#64748b';
      const regLabel = item.isRegistrationOpen ? 'Запись открыта' : 'Запись закрыта';

      return `
      <tr>
        <td>
          ${item.bannerUrl ? `<img src="${escHtml(item.bannerUrl)}" alt="" style="width:60px;height:60px;object-fit:cover;border-radius:8px;border:1px solid #e2e8f0;" onerror="this.style.display='none'" />` : '<div style="width:60px;height:60px;border-radius:8px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;font-size:24px;">&#127942;</div>'}
        </td>
        <td>
          <span class="name">${escHtml(item.title)}</span>
          <br/><span class="slug-text">${escHtml(item.slug)}</span>
          ${item.club ? `<br/><span class="club-text">&#9818; ${escHtml(item.club.name)}</span>` : ''}
        </td>
        <td style="font-size:13px;color:#64748b;white-space:nowrap;">${startStr} &#8212; ${endStr}</td>
        <td style="font-size:13px;font-weight:600;">${priceStr}</td>
        <td>
          <span class="badge" style="background:${activeBg};color:${activeColor};margin-bottom:4px;display:inline-block;">${activeLabel}</span>
          <br/>
          <span class="badge" style="background:${regBg};color:${regColor};margin-top:2px;">${regLabel}</span>
        </td>
        <td style="font-size:13px;color:#64748b;">${item.order}</td>
        <td style="white-space:nowrap;">
          <a href="/admin/tournaments/${item.id}/edit" class="tbl-btn">&#9998; Изменить</a>
          <form method="POST" action="/admin/tournaments/${item.id}/delete" style="display:inline;" onsubmit="return confirm('Удалить турнир &laquo;${escHtml(item.title)}&raquo;?');">
            <button type="submit" class="tbl-btn tbl-del">&#215; Удалить</button>
          </form>
        </td>
      </tr>`;
    })
    .join('');

  const body = `
    <div class="breadcrumbs">
      <a href="/admin">&#127968; Главная</a>
      <span class="sep">&#8250;</span>
      <span>Турниры</span>
    </div>

    <div class="page-header">
      <div>
        <h1>Турниры</h1>
        <p>Управление школьными турнирами</p>
      </div>
      <a href="/admin/tournaments/new" class="primary-btn">&#43; Новый турнир</a>
    </div>

    ${flash ? flashHtml({ type: 'success', message: flash }) : ''}

    <div class="table-card">
      <div class="table-header">
        <h3>Список турниров <span class="count-badge">${items.length}</span></h3>
      </div>
      ${
        items.length === 0
          ? `
        <div class="empty">
          <span class="empty-icon">&#127942;</span>
          <p style="font-size:16px;font-weight:600;margin-bottom:8px;">Турниров пока нет. Создайте первый.</p>
          <a href="/admin/tournaments/new" class="primary-btn" style="margin-top:8px;">&#43; Создать турнир</a>
        </div>
      `
          : `
      <div style="overflow-x:auto;">
      <table>
        <thead>
          <tr>
            <th>Баннер</th>
            <th>Название / Slug / Кружок</th>
            <th>Даты</th>
            <th>Цена</th>
            <th>Видимость</th>
            <th>Порядок</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      </div>
      `
      }
    </div>`;

  return pageShell('Турниры', 'tournaments', LIST_STYLES, body, '');
}

// ─── Tournament form (new / edit) ─────────────────────────────────────────────

type TournamentStage = {
  title: string;
  date?: string;
  description?: string;
};

type TournamentWithStages = Tournament & {
  stages?: TournamentStage[] | unknown;
  club?: { id: number; name: string } | null;
};

export function tournamentFormPage(
  mode: 'create' | 'edit',
  tournament: TournamentWithStages | null | undefined,
  clubs: { id: number; name: string }[],
  error?: string,
): string {
  const title = mode === 'create' ? 'Новый турнир' : 'Редактировать турнир';
  const action =
    mode === 'create' ? '/admin/tournaments' : `/admin/tournaments/${tournament?.id}`;

  const val = (field: keyof Tournament, fallback = ''): string => {
    if (!tournament) return fallback;
    const v = tournament[field];
    return v != null ? escHtml(String(v)) : fallback;
  };

  // Dates for datetime-local inputs
  const toDatetimeLocal = (d: Date | string | null | undefined): string => {
    if (!d) return '';
    try {
      return new Date(d).toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  const startDateVal = toDatetimeLocal(tournament?.startDate);
  const endDateVal = toDatetimeLocal(tournament?.endDate);
  const regDeadlineVal = toDatetimeLocal(tournament?.registrationDeadline);

  const isFreeChecked = tournament?.isFree ? 'checked' : '';
  const isActiveChecked =
    tournament == null || tournament.isActive ? 'checked' : '';
  const isRegOpenChecked =
    tournament == null || tournament.isRegistrationOpen ? 'checked' : '';

  const paymentMethod = tournament?.paymentMethod ?? 'NONE';

  // Payment method options
  const pmOptions = ['NONE', 'KASPI_PHONE', 'KASPI_QR', 'BOTH'];
  const pmLabels: Record<string, string> = {
    NONE: 'Не указан',
    KASPI_PHONE: 'Каспи (номер телефона)',
    KASPI_QR: 'Каспи (QR-код)',
    BOTH: 'Оба способа',
  };
  const pmOptionsHtml = pmOptions
    .map(
      (pm) =>
        `<option value="${pm}" ${paymentMethod === pm ? 'selected' : ''}>${pmLabels[pm]}</option>`,
    )
    .join('');

  // Club select
  const clubId = tournament?.clubId;
  const clubOptionsHtml =
    `<option value="">— Без кружка —</option>` +
    clubs
      .map(
        (c) =>
          `<option value="${c.id}" ${clubId === c.id ? 'selected' : ''}>${escHtml(c.name)}</option>`,
      )
      .join('');

  // Stages
  let stagesArray: TournamentStage[] = [];
  if (tournament?.stages) {
    try {
      const raw = tournament.stages;
      if (Array.isArray(raw)) {
        stagesArray = raw as TournamentStage[];
      } else if (typeof raw === 'string') {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) stagesArray = parsed as TournamentStage[];
      }
    } catch {
      stagesArray = [];
    }
  }

  const stagesHtml = stagesArray
    .map(
      (s, i) => `
    <div class="stage-row" style="border:1px solid #e2e8f0;border-radius:8px;padding:12px;margin-bottom:8px;">
      <div style="display:grid;grid-template-columns:2fr 1fr auto;gap:8px;">
        <input data-field="title" name="stages[${i}][title]" placeholder="Название этапа" maxlength="200" value="${escHtml(s.title ?? '')}" style="padding:8px 12px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:14px;font-family:inherit;" />
        <input data-field="date" name="stages[${i}][date]" type="datetime-local" value="${escHtml(s.date ?? '')}" style="padding:8px 12px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:14px;font-family:inherit;" />
        <button type="button" data-action="remove" style="color:#dc2626;background:none;border:none;cursor:pointer;font-size:20px;">&#215;</button>
      </div>
      <textarea data-field="description" name="stages[${i}][description]" placeholder="Описание (опц.)" rows="2" maxlength="2000" style="width:100%;margin-top:8px;padding:8px 12px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:14px;font-family:inherit;resize:vertical;">${escHtml(s.description ?? '')}</textarea>
    </div>`,
    )
    .join('');

  const errorHtml = error
    ? `<div class="flash flash-error">&#9888; ${escHtml(error)}</div>`
    : '';

  const body = `
    <a href="/admin/tournaments" style="font-size:13px;color:#64748b;text-decoration:none;">&#8592; Назад к турнирам</a>
    <div class="page-header">
      <div>
        <h1 style="margin-top:4px;">${escHtml(title)}</h1>
      </div>
    </div>

    ${errorHtml}

    <div class="form-card">
      <form method="POST" action="${action}" enctype="multipart/form-data">

        <fieldset>
          <legend>Основное</legend>
          <div class="form-grid">
            <div class="form-group">
              <label>Название *</label>
              <input type="text" name="title" required maxlength="200" value="${val('title')}" placeholder="Шахматный турнир 2025" />
            </div>
            <div class="form-group">
              <label>URL-слаг (опц., автогенерация)</label>
              <input type="text" name="slug" maxlength="200" value="${val('slug')}" placeholder="shahmatnyj-turnir-2025" />
              <p class="hint-text">Оставьте пустым для автогенерации</p>
            </div>

            <div class="form-group full">
              <label>Краткое описание</label>
              <textarea name="shortDescription" rows="2" maxlength="500" placeholder="Краткое описание турнира...">${val('shortDescription')}</textarea>
            </div>

            <div class="form-group full">
              <label>Полное описание (Markdown)</label>
              <textarea name="description" rows="10" placeholder="Полное описание...">${val('description')}</textarea>
            </div>

            <div class="form-group">
              <label>Возрастная группа</label>
              <input type="text" name="ageGroup" value="${val('ageGroup')}" placeholder="U-12, U-14" />
            </div>

            <div class="form-group">
              <label>Место проведения</label>
              <input type="text" name="location" value="${val('location')}" placeholder="Актовый зал, ул. Примерная 1" />
            </div>

            <div class="form-group full">
              <label>Баннер${mode === 'create' ? ' *' : ''}</label>
              ${tournament?.bannerUrl ? `<div class="current-img"><img src="${escHtml(tournament.bannerUrl)}" alt="" /><span>Текущий баннер. Загрузите новый чтобы заменить.</span></div>` : ''}
              <div class="upload-area">
                <input type="file" name="banner" accept="image/*"${mode === 'create' ? ' required' : ''} />
                <div class="upload-area-icon">&#128444;</div>
                <div class="upload-area-text"><strong>Нажмите или перетащите</strong><br/>PNG, JPG, WebP до 10 МБ</div>
              </div>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Даты</legend>
          <div class="form-grid">
            <div class="form-group">
              <label>Дата начала *</label>
              <input type="datetime-local" name="startDate" required value="${escHtml(startDateVal)}" />
            </div>
            <div class="form-group">
              <label>Дата окончания *</label>
              <input type="datetime-local" name="endDate" required value="${escHtml(endDateVal)}" />
            </div>
            <div class="form-group">
              <label>Дедлайн записи</label>
              <input type="datetime-local" name="registrationDeadline" value="${escHtml(regDeadlineVal)}" />
              <p class="hint-text">Опциональный дедлайн для записи на турнир</p>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Этапы</legend>
          <div id="stages-container">${stagesHtml}</div>
          <button type="button" class="stage-add-btn" data-action="add-stage">&#43; Добавить этап</button>
          <template id="stage-template">
            <div class="stage-row" style="border:1px solid #e2e8f0;border-radius:8px;padding:12px;margin-bottom:8px;">
              <div style="display:grid;grid-template-columns:2fr 1fr auto;gap:8px;">
                <input data-field="title" placeholder="Название этапа" maxlength="200" style="padding:8px 12px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:14px;font-family:inherit;" />
                <input data-field="date" type="datetime-local" style="padding:8px 12px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:14px;font-family:inherit;" />
                <button type="button" data-action="remove" style="color:#dc2626;background:none;border:none;cursor:pointer;font-size:20px;">&#215;</button>
              </div>
              <textarea data-field="description" placeholder="Описание (опц.)" rows="2" maxlength="2000" style="width:100%;margin-top:8px;padding:8px 12px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:14px;font-family:inherit;resize:vertical;"></textarea>
            </div>
          </template>
        </fieldset>

        <fieldset>
          <legend>Кружок</legend>
          <div class="form-group">
            <label>Привязать к кружку</label>
            <select name="clubId">
              ${clubOptionsHtml}
            </select>
          </div>
        </fieldset>

        <fieldset>
          <legend>Оплата</legend>
          <div class="form-group">
            <label class="checkbox-field">
              <input type="checkbox" name="isFree" value="1" ${isFreeChecked} />
              Бесплатный турнир
            </label>
          </div>

          <div id="payment-fields" style="margin-top:16px;">
            <div class="form-grid">
              <div class="form-group">
                <label>Стоимость участия (₸)</label>
                <input type="number" name="price" min="0" value="${tournament?.price != null ? String(tournament.price) : '0'}" />
              </div>
              <div class="form-group">
                <label>Способ оплаты</label>
                <select name="paymentMethod">
                  ${pmOptionsHtml}
                </select>
              </div>
              <div class="form-group" id="kaspi-phone-field">
                <label>Номер Каспи (KZ формат)</label>
                <input type="text" name="kaspiPhone" value="${val('kaspiPhone')}" placeholder="+7 777 123 4567" />
              </div>
              <div class="form-group" id="kaspi-qr-field">
                <label>QR-код Каспи${mode === 'create' ? '' : ''}</label>
                ${tournament?.kaspiQrUrl ? `<div class="current-img"><img src="${escHtml(tournament.kaspiQrUrl)}" alt="" /><span>Текущий QR. Загрузите новый чтобы заменить.</span></div>` : ''}
                <div class="upload-area">
                  <input type="file" name="kaspiQr" accept="image/*" />
                  <div class="upload-area-icon">&#128247;</div>
                  <div class="upload-area-text"><strong>QR-код для оплаты</strong><br/>PNG, JPG</div>
                </div>
              </div>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Видимость и порядок</legend>
          <div class="form-grid">
            <div class="form-group">
              <label class="checkbox-field">
                <input type="checkbox" name="isActive" value="1" ${isActiveChecked} />
                Активен (показывать на сайте)
              </label>
            </div>
            <div class="form-group">
              <label class="checkbox-field">
                <input type="checkbox" name="isRegistrationOpen" value="1" ${isRegOpenChecked} />
                Запись открыта
              </label>
            </div>
            <div class="form-group">
              <label>Порядок сортировки</label>
              <input type="number" name="order" value="${tournament?.order != null ? String(tournament.order) : '0'}" min="0" />
            </div>
          </div>
        </fieldset>

        <div class="form-actions">
          <button type="submit" class="submit-btn">${mode === 'create' ? '&#43; Создать турнир' : '&#128190; Сохранить изменения'}</button>
          <a href="/admin/tournaments" class="cancel-link">Отмена</a>
        </div>
      </form>
    </div>`;

  const scripts = `<script>
  // ── Slug autogeneration ──
  const slugInput = document.querySelector('input[name="slug"]');
  const titleInput = document.querySelector('input[name="title"]');
  const translit = (s) => s.toLowerCase().replace(/[а-яё]/g, ch => ({а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'e',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'c',ч:'ch',ш:'sh',щ:'sch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya'}[ch] || ch))
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (slugInput && titleInput) {
    if (slugInput.value) slugInput.dataset.touched = '1';
    titleInput.addEventListener('input', () => {
      if (slugInput.dataset.touched) return;
      slugInput.value = translit(titleInput.value);
    });
    slugInput.addEventListener('input', () => { slugInput.dataset.touched = '1'; });
  }

  // ── Stages ──
  const stagesContainer = document.getElementById('stages-container');
  const stageTpl = document.getElementById('stage-template');

  function reindexStages() {
    stagesContainer.querySelectorAll('.stage-row').forEach((row, i) => {
      row.querySelectorAll('[data-field]').forEach((el) => {
        el.setAttribute('name', 'stages[' + i + '][' + el.dataset.field + ']');
      });
    });
  }
  reindexStages();

  document.querySelector('[data-action="add-stage"]').addEventListener('click', () => {
    const node = stageTpl.content.firstElementChild.cloneNode(true);
    stagesContainer.appendChild(node);
    reindexStages();
  });

  stagesContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="remove"]');
    if (!btn) return;
    btn.closest('.stage-row').remove();
    reindexStages();
  });

  // ── Payment toggle ──
  const isFreeCb = document.querySelector('input[name="isFree"]');
  const paymentFields = document.getElementById('payment-fields');
  const methodSel = document.querySelector('select[name="paymentMethod"]');
  const phoneField = document.getElementById('kaspi-phone-field');
  const qrField = document.getElementById('kaspi-qr-field');

  function togglePayment() {
    const free = isFreeCb.checked;
    paymentFields.style.display = free ? 'none' : '';
    if (!free) {
      const m = methodSel.value;
      phoneField.style.display = (m === 'KASPI_PHONE' || m === 'BOTH') ? '' : 'none';
      qrField.style.display = (m === 'KASPI_QR' || m === 'BOTH') ? '' : 'none';
    }
  }
  isFreeCb.addEventListener('change', togglePayment);
  methodSel.addEventListener('change', togglePayment);
  togglePayment();
<\/script>`;

  return pageShell(title, 'tournaments', FORM_STYLES, body, scripts);
}
