import { escHtml, pageShell, flashHtml } from '../admin.templates';
import type { AttestationFile, AttestationSection } from '@prisma/client';

type AdminRow = AttestationSection & {
  depth: number;
  _count: { files: number };
};

// ─── Shared styles ────────────────────────────────────────────────────────────

const STYLES = `
  .name { font-weight: 600; color: #0f172a; }
  .sub { font-size: 11px; color: #94a3b8; }
  .tbl-btn {
    display: inline-block; padding: 6px 12px; border-radius: 8px;
    border: 1.5px solid #e2e8f0; font-size: 12px; font-weight: 600;
    cursor: pointer; background: #fff; margin-right: 4px;
    text-decoration: none; color: #0f172a; transition: all 0.2s;
  }
  .tbl-btn:hover { border-color: #f4a724; background: #fffbeb; }
  .tbl-del:hover { border-color: #dc2626 !important; color: #dc2626 !important; background: #fef2f2 !important; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
  .form-card {
    background: #fff; border-radius: 14px; padding: 28px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02);
    margin-bottom: 24px; border: 1px solid #f1f5f9;
  }
  .form-card h3 { font-size: 16px; margin-bottom: 16px; }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  .form-group { display: flex; flex-direction: column; gap: 5px; }
  .form-group.full { grid-column: 1/-1; }
  .form-group label { font-size: 12px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.03em; }
  .form-group input, .form-group select {
    padding: 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 14px;
    outline: none; transition: all 0.2s; font-family: inherit; background: #fff;
  }
  .form-group input:focus, .form-group select:focus { border-color: #f4a724; }
  .hint-text { font-size: 11px; color: #94a3b8; margin-top: 3px; }
  .checkbox-field { display: flex; align-items: center; gap: 10px; margin: 8px 0; }
  .checkbox-field input[type="checkbox"] { width: auto; }
  .form-actions { display: flex; gap: 12px; align-items: center; margin-top: 24px; padding-top: 24px; border-top: 1px solid #f1f5f9; }
  .submit-btn {
    padding: 12px 28px; background: linear-gradient(135deg, #f4a724, #e8890a); color: #0f172a;
    border: none; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer;
  }
  .cancel-link { padding: 12px 20px; background: #f1f5f9; border-radius: 10px; font-size: 14px; font-weight: 600; color: #374151; text-decoration: none; }
  .file-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
  .file-row a.file-link { flex: 1; color: #0f172a; font-size: 14px; text-decoration: none; }
  .file-row a.file-link:hover { color: #e8890a; }
  .ext { font-size: 11px; font-weight: 700; color: #64748b; background: #f1f5f9; border-radius: 6px; padding: 3px 8px; }
  @media (max-width: 720px) { .form-grid { grid-template-columns: 1fr; } }
`;

function fileExt(url: string) {
  return (url.split('?')[0].split('.').pop() || 'file').toUpperCase();
}

// ─── Sections tree ────────────────────────────────────────────────────────────

export function attestationListPage(rows: AdminRow[], flash?: string): string {
  const tr = rows
    .map((r) => {
      const activeBg = r.isActive ? '#dcfce7' : '#f1f5f9';
      const activeColor = r.isActive ? '#166534' : '#64748b';
      return `
      <tr>
        <td style="padding-left:${16 + r.depth * 24}px;">
          ${r.depth ? '<span class="sub">&#8627;</span> ' : ''}<span class="name">${escHtml(r.titleRu)}</span>
          <br/><span class="sub">${escHtml(r.titleKk)}</span>
        </td>
        <td style="font-size:13px;color:#64748b;">${r._count.files}</td>
        <td><span class="badge" style="background:${activeBg};color:${activeColor};">${r.isActive ? 'Виден' : 'Скрыт'}</span></td>
        <td style="font-size:13px;color:#64748b;">${r.order}</td>
        <td style="white-space:nowrap;">
          <a href="/admin/attestation/${r.id}/edit" class="tbl-btn">&#9998; Изменить</a>
          <a href="/admin/attestation/new?parentId=${r.id}" class="tbl-btn">&#43; Подраздел</a>
          <form method="POST" action="/admin/attestation/${r.id}/delete" style="display:inline;" onsubmit="return confirm('Удалить раздел вместе с подразделами и файлами?');">
            <button type="submit" class="tbl-btn tbl-del">&#215;</button>
          </form>
        </td>
      </tr>`;
    })
    .join('');

  const body = `
    <div class="breadcrumbs">
      <a href="/admin">&#127968; Главная</a>
      <span class="sep">&#8250;</span>
      <span>Аттестация</span>
    </div>

    <div class="page-header">
      <div>
        <h1>Аттестация</h1>
        <p>Разделы и документы страницы «Аттестация» на сайте</p>
      </div>
      <a href="/admin/attestation/new" class="primary-btn">&#43; Раздел</a>
    </div>

    ${flash ? flashHtml({ type: 'success', message: flash }) : ''}

    <div class="table-card">
      <div class="table-header">
        <h3>Разделы <span class="count-badge">${rows.length}</span></h3>
      </div>
      ${
        rows.length === 0
          ? `<div class="empty"><p>Разделов пока нет.</p></div>`
          : `
      <div style="overflow-x:auto;">
      <table>
        <thead>
          <tr><th>Название</th><th>Файлов</th><th>Статус</th><th>Порядок</th><th>Действия</th></tr>
        </thead>
        <tbody>${tr}</tbody>
      </table>
      </div>`
      }
    </div>`;

  return pageShell('Аттестация', 'attestation', STYLES, body);
}

// ─── Section form (new / edit) + files ────────────────────────────────────────

export function attestationFormPage(opts: {
  mode: 'create' | 'edit';
  sections: AdminRow[];
  section?: AttestationSection & { files: AttestationFile[] };
  parentId?: number | null;
  error?: string;
  flash?: string;
}): string {
  const { mode, sections, section, error, flash } = opts;
  const parentId = section ? section.parentId : (opts.parentId ?? null);
  const title = mode === 'create' ? 'Новый раздел' : 'Редактировать раздел';
  const action =
    mode === 'create'
      ? '/admin/attestation'
      : `/admin/attestation/${section!.id}`;
  const val = (v: string | number | undefined) =>
    v == null ? '' : escHtml(String(v));

  // A section can't be moved under itself or its descendants
  const blocked = new Set<number>();
  if (section) {
    blocked.add(section.id);
    for (const s of sections)
      if (s.parentId !== null && blocked.has(s.parentId)) blocked.add(s.id);
  }
  const parentOptions = sections
    .filter((s) => !blocked.has(s.id))
    .map(
      (s) =>
        `<option value="${s.id}" ${s.id === parentId ? 'selected' : ''}>${'&nbsp;&nbsp;'.repeat(s.depth * 2)}${escHtml(s.titleRu)}</option>`,
    )
    .join('');

  const filesBlock = section
    ? `
    <div class="form-card">
      <h3>Файлы <span class="count-badge">${section.files.length}</span></h3>
      ${
        section.files.length
          ? section.files
              .map(
                (f) => `
        <div class="file-row">
          <span class="ext">${fileExt(f.url)}</span>
          <a class="file-link" href="${escHtml(f.url)}" target="_blank" rel="noopener">${escHtml(f.title)}</a>
          <form method="POST" action="/admin/attestation/files/${f.id}/delete" style="margin:0;" onsubmit="return confirm('Удалить файл?');">
            <button type="submit" class="tbl-btn tbl-del">&#215; Удалить</button>
          </form>
        </div>`,
              )
              .join('')
          : '<p class="hint-text">Файлов пока нет.</p>'
      }
      <form method="POST" action="/admin/attestation/${section.id}/files" enctype="multipart/form-data" style="margin-top:20px;">
        <div class="form-group">
          <label>Загрузить файлы</label>
          <input type="file" name="files" multiple required accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.webp,.zip,.txt,.csv" />
          <span class="hint-text">Можно выбрать несколько. До 50 МБ каждый. Название на сайте = имя файла без расширения.</span>
        </div>
        <div class="form-actions"><button type="submit" class="submit-btn">&#8679; Загрузить</button></div>
      </form>
    </div>`
    : '';

  const body = `
    <a href="/admin/attestation" style="font-size:13px;color:#64748b;text-decoration:none;">&#8592; Назад к разделам</a>
    <div class="page-header"><div><h1 style="margin-top:4px;">${title}</h1></div></div>

    ${error ? flashHtml({ type: 'error', message: error }) : ''}
    ${flash ? flashHtml({ type: 'success', message: flash }) : ''}

    <div class="form-card">
      <form method="POST" action="${action}">
        <div class="form-grid">
          <div class="form-group full">
            <label>Название (рус) *</label>
            <input type="text" name="titleRu" required maxlength="300" value="${val(section?.titleRu)}" />
          </div>
          <div class="form-group full">
            <label>Название (қаз) *</label>
            <input type="text" name="titleKk" required maxlength="300" value="${val(section?.titleKk)}" />
          </div>
          <div class="form-group full">
            <label>Название (eng) *</label>
            <input type="text" name="titleEn" required maxlength="300" value="${val(section?.titleEn)}" />
          </div>
          <div class="form-group">
            <label>Родительский раздел</label>
            <select name="parentId">
              <option value="">— Верхний уровень —</option>
              ${parentOptions}
            </select>
          </div>
          <div class="form-group">
            <label>Порядок</label>
            <input type="number" name="order" value="${val(section?.order ?? 0)}" />
          </div>
          <div class="form-group">
            <label>Slug</label>
            <input type="text" name="slug" maxlength="120" pattern="[a-z0-9-]+" value="${val(section?.slug)}" />
            <span class="hint-text">Адрес страницы: /attestation/slug. Пусто — сгенерируется из английского названия.</span>
          </div>
          <div class="form-group">
            <label>&nbsp;</label>
            <div class="checkbox-field">
              <input type="checkbox" name="isActive" value="1" id="isActive" ${!section || section.isActive ? 'checked' : ''} />
              <label for="isActive" style="text-transform:none;">Показывать на сайте</label>
            </div>
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" class="submit-btn">${mode === 'create' ? 'Создать' : 'Сохранить'}</button>
          <a href="/admin/attestation" class="cancel-link">Отмена</a>
        </div>
      </form>
    </div>
    ${filesBlock}`;

  return pageShell(title, 'attestation', STYLES, body);
}
