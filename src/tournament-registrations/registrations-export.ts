import * as path from 'path';
import ExcelJS from 'exceljs';
// pdfmake 0.3.x ships only CJS — use require + cast to typed singleton.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfmake = require('pdfmake') as {
  setFonts(fonts: Record<string, unknown>): void;
  setLocalAccessPolicy(cb: (p: string) => boolean): void;
  setUrlAccessPolicy(cb: (u: string) => boolean): void;
  createPdf(doc: TDocumentDefinitions): { getBuffer(): Promise<Buffer> };
};
import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import type { TournamentRegistration } from '@prisma/client';
import { HUMAN_STATUS } from '../mail/templates/brand';

export type ExportRow = TournamentRegistration & {
  tournament: { id: number; title: string; slug: string };
};

const COLUMNS: Array<{ header: string; key: keyof ExportRow | 'tournamentTitle'; width: number }> = [
  { header: 'ID', key: 'id', width: 6 },
  { header: 'Дата подачи', key: 'createdAt', width: 18 },
  { header: 'Турнир', key: 'tournamentTitle', width: 32 },
  { header: 'ФИО', key: 'participantName', width: 28 },
  { header: 'Дата рождения', key: 'birthDate', width: 14 },
  { header: 'FIDE ID', key: 'fideId', width: 12 },
  { header: 'Телефон', key: 'phone', width: 16 },
  { header: 'Email', key: 'email', width: 26 },
  { header: 'Статус', key: 'status', width: 14 },
  { header: 'Комментарий участника', key: 'comment', width: 30 },
  { header: 'Способ/заметка оплаты', key: 'paymentNote', width: 22 },
  { header: 'Ссылка на чек', key: 'receiptUrl', width: 40 },
  { header: 'Заметка администратора', key: 'adminNote', width: 30 },
];

function formatDateTime(d: Date | string | null | undefined): string {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleDateString('ru-RU');
}

function cellValue(row: ExportRow, key: (typeof COLUMNS)[number]['key']): string {
  switch (key) {
    case 'id':
      return String(row.id);
    case 'createdAt':
      return formatDateTime(row.createdAt);
    case 'tournamentTitle':
      return row.tournament?.title ?? '';
    case 'birthDate':
      return formatDate(row.birthDate);
    case 'status':
      return HUMAN_STATUS[row.status] ?? row.status;
    default: {
      const v = row[key as keyof ExportRow];
      return v == null ? '' : String(v);
    }
  }
}

export async function buildXlsx(rows: ExportRow[]): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Scandic Admin';
  wb.created = new Date();
  const ws = wb.addWorksheet('Заявки');

  ws.columns = COLUMNS.map((c) => ({ header: c.header, key: c.key, width: c.width }));

  const headerRow = ws.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FF0F172A' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF4A724' },
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'left' };
  headerRow.height = 22;

  rows.forEach((row) => {
    const obj: Record<string, string> = {};
    for (const col of COLUMNS) obj[col.key] = cellValue(row, col.key);
    const r = ws.addRow(obj);
    r.alignment = { vertical: 'top', wrapText: true };
    const receiptIdx = COLUMNS.findIndex((c) => c.key === 'receiptUrl') + 1;
    const receipt = row.receiptUrl;
    if (receipt) {
      const cell = r.getCell(receiptIdx);
      cell.value = { text: receipt, hyperlink: receipt } as ExcelJS.CellHyperlinkValue;
      cell.font = { color: { argb: 'FF2563EB' }, underline: true };
    }
  });

  ws.views = [{ state: 'frozen', ySplit: 1 }];
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: COLUMNS.length } };

  const buffer = await wb.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

const FONTS_DIR = path.join(
  path.dirname(require.resolve('pdfmake/package.json')),
  'build',
  'fonts',
  'Roboto',
);

let pdfmakeReady = false;
function ensurePdfmakeConfigured(): void {
  if (pdfmakeReady) return;
  pdfmake.setFonts({
    Roboto: {
      normal: path.join(FONTS_DIR, 'Roboto-Regular.ttf'),
      bold: path.join(FONTS_DIR, 'Roboto-Medium.ttf'),
      italics: path.join(FONTS_DIR, 'Roboto-Italic.ttf'),
      bolditalics: path.join(FONTS_DIR, 'Roboto-MediumItalic.ttf'),
    },
  });
  pdfmake.setLocalAccessPolicy((p: string) => p.startsWith(FONTS_DIR));
  pdfmake.setUrlAccessPolicy(() => false);
  pdfmakeReady = true;
}

export async function buildPdf(
  rows: ExportRow[],
  filterSummary: string[],
): Promise<Buffer> {
  ensurePdfmakeConfigured();

  const headerCells = COLUMNS.map((c) => ({
    text: c.header,
    style: 'th',
  }));

  const bodyRows = rows.map((row) =>
    COLUMNS.map((c) => {
      const text = cellValue(row, c.key);
      if (c.key === 'receiptUrl' && row.receiptUrl) {
        return {
          text,
          link: row.receiptUrl,
          color: '#2563eb',
          decoration: 'underline' as const,
        };
      }
      return { text };
    }),
  );

  const doc: TDocumentDefinitions = {
    pageOrientation: 'landscape',
    pageSize: 'A3',
    pageMargins: [24, 60, 24, 40],
    defaultStyle: { font: 'Roboto', fontSize: 8 },
    header: {
      margin: [24, 20, 24, 0],
      stack: [
        { text: 'Заявки на турниры — Scandic', style: 'title' },
        {
          text: `Сформировано: ${formatDateTime(new Date())} · Всего записей: ${rows.length}`,
          style: 'meta',
        },
        ...(filterSummary.length
          ? [{ text: 'Фильтры: ' + filterSummary.join(' · '), style: 'meta' }]
          : []),
      ],
    },
    footer: (current, total) => ({
      text: `Страница ${current} из ${total}`,
      alignment: 'center',
      margin: [0, 16, 0, 0],
      fontSize: 8,
      color: '#64748b',
    }),
    content: [
      {
        table: {
          headerRows: 1,
          widths: COLUMNS.map(() => 'auto'),
          body: [headerCells, ...bodyRows],
        },
        layout: {
          fillColor: (rowIndex) =>
            rowIndex === 0 ? '#f4a724' : rowIndex % 2 === 0 ? '#f8fafc' : null,
          hLineColor: '#e2e8f0',
          vLineColor: '#e2e8f0',
        },
      },
    ],
    styles: {
      title: { fontSize: 12, bold: true, color: '#0f172a' },
      meta: { fontSize: 8, color: '#64748b', margin: [0, 2, 0, 0] },
      th: { bold: true, color: '#0f172a', fontSize: 8 },
    },
  };

  return pdfmake.createPdf(doc).getBuffer();
}

export function buildTxt(rows: ExportRow[], filterSummary: string[]): string {
  const lines: string[] = [];
  lines.push('Заявки на турниры — Scandic');
  lines.push(`Сформировано: ${formatDateTime(new Date())}`);
  lines.push(`Всего записей: ${rows.length}`);
  if (filterSummary.length) lines.push('Фильтры: ' + filterSummary.join(' · '));
  lines.push('');
  lines.push('='.repeat(80));

  rows.forEach((row, i) => {
    lines.push('');
    lines.push(`#${i + 1} · Заявка ID ${row.id}`);
    lines.push('-'.repeat(80));
    for (const col of COLUMNS) {
      if (col.key === 'id') continue;
      const v = cellValue(row, col.key);
      if (v) lines.push(`${col.header}: ${v}`);
    }
  });

  return lines.join('\n');
}

export function describeFilters(q: {
  tournamentId?: number;
  tournamentTitle?: string;
  status?: string;
  from?: string;
  to?: string;
  search?: string;
}): string[] {
  const out: string[] = [];
  if (q.tournamentId)
    out.push(`турнир = ${q.tournamentTitle ?? `#${q.tournamentId}`}`);
  if (q.status) out.push(`статус = ${HUMAN_STATUS[q.status] ?? q.status}`);
  if (q.from) out.push(`с ${q.from}`);
  if (q.to) out.push(`по ${q.to}`);
  if (q.search) out.push(`поиск = "${q.search}"`);
  return out;
}
