import type { RegistrationStatus, Tournament, TournamentRegistration } from '@prisma/client';
import { BRAND, HUMAN_STATUS } from './brand';
import { escHtml } from './escape';

const STATUS_BLOCK: Record<RegistrationStatus, { title: string; body: string; color: string }> = {
  NEW: {
    title: 'Заявка принята',
    body: 'Мы получили вашу заявку. Скоро свяжемся для подтверждения.',
    color: BRAND.secondaryMid,
  },
  PAID: {
    title: 'Оплата получена',
    body: 'Оплата получена. Ждём вас на турнире.',
    color: '#16a34a',
  },
  CONFIRMED: {
    title: 'Участие подтверждено',
    body: 'Ваше участие в турнире подтверждено. Подробности — на странице турнира.',
    color: '#16a34a',
  },
  REJECTED: {
    title: 'Заявка отклонена',
    body: 'К сожалению, заявка отклонена. Если это ошибка — свяжитесь с организаторами.',
    color: '#dc2626',
  },
  CANCELLED: {
    title: 'Заявка отменена',
    body: 'Заявка была отменена. Подать новую можно на странице турнира.',
    color: BRAND.textMuted,
  },
};

export function tournamentRegistrationStatusHtml(
  reg: TournamentRegistration,
  tournament: Tournament,
  newStatus: RegistrationStatus,
  publicTournamentUrl: string,
): string {
  const block = STATUS_BLOCK[newStatus];
  return `<!DOCTYPE html>
<html lang="ru"><body style="margin:0;background:${BRAND.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:${BRAND.secondary};">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${BRAND.bg};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background:${BRAND.cardBg};border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.08);">
        <tr><td style="background:linear-gradient(135deg, ${BRAND.secondary}, ${BRAND.secondaryMid});padding:32px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:22px;font-weight:600;">${escHtml(block.title)}</h1>
          <p style="margin:12px 0 0;color:#cbd5e1;font-size:14px;">${escHtml(tournament.title)}</p>
        </td></tr>

        <tr><td style="padding:32px;font-size:15px;line-height:1.7;">
          <p style="margin:0 0 16px;">Здравствуйте, <strong>${escHtml(reg.participantName)}</strong>!</p>
          <p style="margin:0 0 16px;">${escHtml(block.body)}</p>
          <p style="margin:0;color:${BRAND.textMuted};font-size:13px;">Текущий статус: <span style="color:${block.color};font-weight:600;">${HUMAN_STATUS[newStatus]}</span></p>

          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:32px auto 0;">
            <tr><td style="border-radius:10px;background:linear-gradient(135deg, ${BRAND.primary}, ${BRAND.primaryDark});">
              <a href="${escHtml(publicTournamentUrl)}" style="display:inline-block;padding:14px 28px;color:#fff;font-weight:600;text-decoration:none;border-radius:10px;">Страница турнира</a>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:20px 32px;border-top:1px solid ${BRAND.border};color:${BRAND.textMuted};font-size:12px;text-align:center;">${BRAND.name}</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
