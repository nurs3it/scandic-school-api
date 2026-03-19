import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

export interface ApplicationNotificationData {
  id: number;
  parentName: string;
  parentPhone: string;
  grade: string;
  language: string;
  createdAt: Date;
}

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

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendApplicationNotification(
    recipients: string[],
    data: ApplicationNotificationData,
  ): Promise<void> {
    if (!recipients.length) return;
    if (!process.env.RESEND_API_KEY) {
      this.logger.warn('RESEND_API_KEY not configured, skipping email notification');
      return;
    }

    const adminUrl = process.env.ADMIN_URL || 'http://localhost:3001/admin';
    const dateStr = new Date(data.createdAt).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Новая заявка на зачисление</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f172a,#1e3a5f);padding:32px 40px;text-align:center;">
              <div style="display:inline-block;width:56px;height:56px;background:linear-gradient(135deg,#f4a724,#e8890a);border-radius:14px;line-height:56px;font-size:26px;margin-bottom:12px;">🏫</div>
              <h1 style="color:#fff;margin:0;font-size:20px;font-weight:700;">Scandic School</h1>
              <p style="color:#94a3b8;margin:4px 0 0;font-size:13px;">Панель администратора</p>
            </td>
          </tr>

          <!-- Alert banner -->
          <tr>
            <td style="background:#fef3c7;border-bottom:1px solid #fde68a;padding:14px 40px;">
              <p style="margin:0;font-size:14px;font-weight:600;color:#92400e;">🔔 Поступила новая заявка на зачисление</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 24px;font-size:15px;color:#374151;">
                Новый запрос на зачисление ожидает вашего рассмотрения. Детали заявки:
              </p>

              <!-- Details card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">
                          <span style="font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">ID заявки</span>
                          <br/>
                          <span style="font-size:15px;font-weight:700;color:#0f172a;">#${data.id}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">
                          <span style="font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Имя родителя</span>
                          <br/>
                          <span style="font-size:15px;color:#0f172a;">${escHtml(data.parentName)}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">
                          <span style="font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Телефон</span>
                          <br/>
                          <span style="font-size:15px;font-family:monospace;color:#0f172a;">${escHtml(data.parentPhone)}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">
                          <span style="font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Класс</span>
                          <br/>
                          <span style="display:inline-block;margin-top:4px;padding:3px 12px;background:#fef3c7;color:#92400e;border-radius:20px;font-size:13px;font-weight:600;">${GRADE_LABELS[data.grade] ?? data.grade}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">
                          <span style="font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Язык обучения</span>
                          <br/>
                          <span style="display:inline-block;margin-top:4px;padding:3px 12px;background:${data.language === 'kazakh' ? '#dcfce7' : '#dbeafe'};color:${data.language === 'kazakh' ? '#166534' : '#1e40af'};border-radius:20px;font-size:13px;font-weight:600;">${LANG_LABELS[data.language] ?? data.language}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;">
                          <span style="font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Дата подачи</span>
                          <br/>
                          <span style="font-size:15px;color:#0f172a;">${dateStr}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${adminUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#f4a724,#e8890a);color:#0f172a;font-size:15px;font-weight:700;text-decoration:none;border-radius:10px;">
                      Открыть панель администратора →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #f1f5f9;text-align:center;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">Это автоматическое уведомление от системы Scandic School.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    try {
      await this.resend.emails.send({
        from: 'Scandic School <noreply@scandicschools.com>',
        to: recipients,
        subject: `📋 Новая заявка #${data.id} — ${data.parentName}`,
        html,
      });
      this.logger.log(`Notification sent to ${recipients.length} recipient(s)`);
    } catch (err) {
      this.logger.error('Failed to send email notification', err);
    }
  }
}

function escHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
