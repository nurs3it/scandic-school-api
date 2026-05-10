import type { Tournament, TournamentRegistration } from '@prisma/client';
import { BRAND } from './brand';
import { escHtml } from './escape';

export function tournamentRegistrationAdminHtml(
  reg: TournamentRegistration,
  tournament: Tournament,
  adminUrl: string,
): string {
  const fmt = (d: Date) =>
    new Date(d).toLocaleString('ru-RU', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const detailUrl = `${adminUrl.replace(/\/$/, '')}/tournament-registrations/${reg.id}`;

  return `<!DOCTYPE html>
<html lang="ru"><body style="margin:0;background:${BRAND.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:${BRAND.secondary};">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${BRAND.bg};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background:${BRAND.cardBg};border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.08);">
        <tr><td style="background:linear-gradient(135deg, ${BRAND.secondary}, ${BRAND.secondaryMid});padding:32px 32px 24px;">
          <h1 style="margin:0;color:#fff;font-size:22px;font-weight:600;">Новая заявка на турнир</h1>
          <p style="margin:8px 0 0;color:#cbd5e1;font-size:14px;">${escHtml(tournament.title)}</p>
        </td></tr>

        <tr><td style="padding:32px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="font-size:14px;line-height:1.6;">
            <tr><td style="padding:6px 0;color:${BRAND.textMuted};width:160px;">Участник</td><td style="padding:6px 0;font-weight:600;">${escHtml(reg.participantName)}</td></tr>
            ${reg.birthDate ? `<tr><td style="padding:6px 0;color:${BRAND.textMuted};">Дата рождения</td><td style="padding:6px 0;">${new Date(reg.birthDate).toLocaleDateString('ru-RU')}</td></tr>` : ''}
            ${reg.fideId ? `<tr><td style="padding:6px 0;color:${BRAND.textMuted};">FIDE ID</td><td style="padding:6px 0;">${escHtml(reg.fideId)}</td></tr>` : ''}
            <tr><td style="padding:6px 0;color:${BRAND.textMuted};">Телефон</td><td style="padding:6px 0;"><a href="tel:${escHtml(reg.phone)}" style="color:${BRAND.secondaryMid};text-decoration:none;">${escHtml(reg.phone)}</a></td></tr>
            ${reg.email ? `<tr><td style="padding:6px 0;color:${BRAND.textMuted};">Email</td><td style="padding:6px 0;"><a href="mailto:${escHtml(reg.email)}" style="color:${BRAND.secondaryMid};text-decoration:none;">${escHtml(reg.email)}</a></td></tr>` : ''}
            ${reg.comment ? `<tr><td style="padding:6px 0;color:${BRAND.textMuted};vertical-align:top;">Комментарий</td><td style="padding:6px 0;white-space:pre-wrap;">${escHtml(reg.comment)}</td></tr>` : ''}
            ${reg.paymentNote ? `<tr><td style="padding:6px 0;color:${BRAND.textMuted};vertical-align:top;">Оплата</td><td style="padding:6px 0;white-space:pre-wrap;">${escHtml(reg.paymentNote)}</td></tr>` : ''}
            ${reg.receiptUrl ? `<tr><td style="padding:6px 0;color:${BRAND.textMuted};">Чек</td><td style="padding:6px 0;"><a href="${escHtml(reg.receiptUrl)}" style="color:${BRAND.secondaryMid};">Открыть файл</a></td></tr>` : ''}
            <tr><td style="padding:6px 0;color:${BRAND.textMuted};">Поступила</td><td style="padding:6px 0;">${fmt(reg.createdAt)}</td></tr>
          </table>

          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:32px auto 0;">
            <tr><td style="border-radius:10px;background:linear-gradient(135deg, ${BRAND.primary}, ${BRAND.primaryDark});">
              <a href="${escHtml(detailUrl)}" style="display:inline-block;padding:14px 28px;color:#fff;font-weight:600;text-decoration:none;border-radius:10px;">Открыть в админке</a>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:20px 32px;border-top:1px solid ${BRAND.border};color:${BRAND.textMuted};font-size:12px;text-align:center;">${BRAND.name} · уведомление от системы</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
