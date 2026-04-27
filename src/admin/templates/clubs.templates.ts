import { escHtml, pageShell, flashHtml } from '../admin.templates';
import {
  EDITORJS_STYLES,
  editorjsFieldHtml,
  editorjsScripts,
  imagePreviewScript,
  encodeContentB64,
} from './editorjs.helper';
import type { Club } from '@prisma/client';

// ─── Shared styles ────────────────────────────────────────────────────────────

const LIST_STYLES = `
  .id { font-size: 12px; color: #94a3b8; font-weight: 600; }
  .name { font-weight: 600; color: #0f172a; }
  .slug-text { font-size: 11px; color: #64748b; }
  .tbl-btn {
    display: inline-block; padding: 6px 12px; border-radius: 8px;
    border: 1.5px solid #e2e8f0; font-size: 12px; font-weight: 600;
    cursor: pointer; background: #fff; margin-right: 4px;
    text-decoration: none; color: #0f172a; transition: all 0.2s;
  }
  .tbl-btn:hover { border-color: #f4a724; background: #fffbeb; }
  .tbl-del:hover { border-color: #dc2626 !important; color: #dc2626 !important; background: #fef2f2 !important; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
`;

const FORM_STYLES = `
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
  .preview-img-box { margin-top: 12px; }
  .preview-img-box img {
    max-width: 100%; max-height: 240px; border-radius: 10px;
    border: 1px solid #e2e8f0; display: none;
  }
  ${EDITORJS_STYLES}
`;

// ─── Clubs list ───────────────────────────────────────────────────────────────

export function clubsListPage(clubs: Club[], flash?: string): string {
  const rows = clubs
    .map((club) => {
      const activeBg = club.isActive ? '#dcfce7' : '#f1f5f9';
      const activeColor = club.isActive ? '#166534' : '#64748b';
      const activeLabel = club.isActive ? 'Активен' : 'Неактивен';
      return `
      <tr>
        <td>
          ${club.image ? `<img src="${escHtml(club.image)}" alt="" style="width:60px;height:60px;object-fit:cover;border-radius:8px;border:1px solid #e2e8f0;" onerror="this.style.display='none'" />` : '<div style="width:60px;height:60px;border-radius:8px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;font-size:24px;">&#9818;</div>'}
        </td>
        <td>
          <span class="name">${escHtml(club.name)}</span>
          <br/><span class="slug-text">${escHtml(club.slug)}</span>
        </td>
        <td style="font-size:13px;color:#64748b;">${club.ageRange ? escHtml(club.ageRange) : '&#8212;'}</td>
        <td>
          <span class="badge" style="background:${activeBg};color:${activeColor};">${activeLabel}</span>
        </td>
        <td style="font-size:13px;color:#64748b;">${club.order}</td>
        <td style="white-space:nowrap;">
          <a href="/admin/clubs/${club.id}/edit" class="tbl-btn">&#9998; Изменить</a>
          <form method="POST" action="/admin/clubs/${club.id}/delete" style="display:inline;" onsubmit="return confirm('Удалить кружок &laquo;${escHtml(club.name)}&raquo;?');">
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
      <span>Кружки</span>
    </div>

    <div class="page-header">
      <div>
        <h1>Кружки</h1>
        <p>Каталог школьных кружков</p>
      </div>
      <a href="/admin/clubs/new" class="primary-btn">&#43; Новый кружок</a>
    </div>

    ${flash ? flashHtml({ type: 'success', message: flash }) : ''}

    <div class="table-card">
      <div class="table-header">
        <h3>Список кружков <span class="count-badge">${clubs.length}</span></h3>
      </div>
      ${
        clubs.length === 0
          ? `
        <div class="empty">
          <span class="empty-icon">&#9818;</span>
          <p style="font-size:16px;font-weight:600;margin-bottom:8px;">Кружков пока нет. Создайте первый.</p>
          <a href="/admin/clubs/new" class="primary-btn" style="margin-top:8px;">&#43; Создать кружок</a>
        </div>
      `
          : `
      <div style="overflow-x:auto;">
      <table>
        <thead>
          <tr>
            <th>Фото</th>
            <th>Название / Slug</th>
            <th>Возраст</th>
            <th>Активен</th>
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

  return pageShell('Кружки', 'clubs', LIST_STYLES, body, '');
}

// ─── Club form (new / edit) ───────────────────────────────────────────────────

export function clubFormPage(
  mode: 'create' | 'edit',
  club?: Club,
  error?: string,
): string {
  const title = mode === 'create' ? 'Новый кружок' : 'Редактировать кружок';
  const action =
    mode === 'create' ? '/admin/clubs' : `/admin/clubs/${club!.id}`;

  const val = (field: keyof Club, fallback = ''): string => {
    if (!club) return fallback;
    const v = club[field];
    return v != null ? escHtml(String(v)) : fallback;
  };

  const isActiveChecked =
    club === undefined || club.isActive ? 'checked' : '';

  const errorHtml = error
    ? `<div class="flash flash-error">&#9888; ${escHtml(error)}</div>`
    : '';

  const body = `
    <a href="/admin/clubs" style="font-size:13px;color:#64748b;text-decoration:none;">&#8592; Назад к кружкам</a>
    <div class="page-header">
      <div>
        <h1 style="margin-top:4px;">${escHtml(title)}</h1>
      </div>
    </div>

    ${errorHtml}

    <div class="form-card">
      <form id="club-form" method="POST" action="${action}" enctype="multipart/form-data">
        <div class="form-grid">
          <div class="form-group">
            <label>Название *</label>
            <input type="text" name="name" required maxlength="200" value="${val('name')}" placeholder="Шахматный кружок" />
          </div>
          <div class="form-group">
            <label>URL-слаг (опц., автогенерация из name)</label>
            <input type="text" name="slug" maxlength="200" value="${val('slug')}" placeholder="shahmatnyj-kruzhok" />
            <p class="hint-text">Оставьте пустым для автогенерации</p>
          </div>

          <div class="form-group full">
            <label>Краткое описание</label>
            <textarea name="shortDescription" rows="2" maxlength="500" placeholder="Краткое описание кружка...">${val('shortDescription')}</textarea>
          </div>

          <div class="form-group full">
            ${editorjsFieldHtml({ fieldName: 'description', holderId: 'club-editor', hiddenId: 'club-description-hidden', label: 'Полное описание' })}
          </div>

          <div class="form-group full">
            <label>Изображение${mode === 'create' ? ' *' : ''}</label>
            ${club?.image ? `<div class="current-img"><img src="${escHtml(club.image)}" alt="" /><span>Текущее изображение. Загрузите новое чтобы заменить.</span></div>` : ''}
            <div class="upload-area">
              <input type="file" name="image" accept="image/*"${mode === 'create' ? ' required' : ''} />
              <div class="upload-area-icon">&#128444;</div>
              <div class="upload-area-text"><strong>Нажмите или перетащите</strong><br/>PNG, JPG, WebP до 10 МБ</div>
            </div>
            <div class="preview-img-box"><img id="club-image-preview" alt="Предпросмотр" /></div>
          </div>

          <div class="form-group">
            <label>Возрастной диапазон</label>
            <input type="text" name="ageRange" value="${val('ageRange')}" placeholder="8-14" />
          </div>

          <div class="form-group">
            <label>Расписание</label>
            <input type="text" name="schedule" value="${val('schedule')}" placeholder="Пн, Ср 15:00-17:00" />
          </div>

          <div class="form-group">
            <label>Преподаватель</label>
            <input type="text" name="teacher" value="${val('teacher')}" placeholder="Иванов Иван Иванович" />
          </div>

          <div class="form-group">
            <label>Порядок сортировки</label>
            <input type="number" name="order" value="${club != null ? String(club.order) : '0'}" min="0" />
          </div>

          <div class="form-group full">
            <label class="checkbox-field">
              <input type="checkbox" name="isActive" value="1" ${isActiveChecked} />
              Активен (показывать на сайте)
            </label>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="submit-btn">${mode === 'create' ? '&#43; Создать кружок' : '&#128190; Сохранить изменения'}</button>
          <a href="/admin/clubs" class="cancel-link">Отмена</a>
        </div>
      </form>
    </div>`;

  const contentB64 = encodeContentB64(club?.description ?? '');

  const script = `<script>
  (function() {
    var slugInput = document.querySelector('input[name="slug"]');
    var nameInput = document.querySelector('input[name="name"]');
    function translit(s) {
      return s.toLowerCase().replace(/[а-яё]/g, function(ch) {
        var map = {а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'e',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'c',ч:'ch',ш:'sh',щ:'sch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya'};
        return map[ch] || ch;
      }).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }
    if (slugInput && nameInput) {
      if (slugInput.value) slugInput.dataset.touched = '1';
      nameInput.addEventListener('input', function() {
        if (slugInput.dataset.touched) return;
        slugInput.value = translit(nameInput.value);
      });
      slugInput.addEventListener('input', function() { slugInput.dataset.touched = '1'; });
    }
    ${imagePreviewScript('image', 'club-image-preview')}
  })();
</script>
${editorjsScripts({ formId: 'club-form', contentB64, holderId: 'club-editor', hiddenId: 'club-description-hidden' })}`;

  return pageShell(title, 'clubs', FORM_STYLES, body, script);
}
