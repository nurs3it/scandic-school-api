import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateMerchOrderDto } from './dto/create-merch-order.dto';

function escHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

@Injectable()
export class MerchOrdersService {
  private readonly logger = new Logger(MerchOrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async create(dto: CreateMerchOrderDto) {
    const order = await this.prisma.merchOrder.create({
      data: {
        parentName: dto.parentName,
        childrenNames: dto.childrenNames,
        phone: dto.phone,
        items: dto.items as any,
        total: dto.total,
      },
    });

    this.sendNotification(order).catch((err) =>
      this.logger.error('Failed to send order notification', err),
    );

    return { success: true, orderId: order.id };
  }

  private async sendNotification(order: {
    id: number;
    parentName: string;
    childrenNames: string;
    phone: string;
    items: any;
    total: number;
    createdAt: Date;
  }) {
    const recipients = await this.prisma.notificationEmail.findMany();
    if (!recipients.length) return;

    const emails = recipients.map((r) => r.email);
    const items = order.items as Array<{
      name: string;
      price: number;
      quantity: number;
      selectedSize?: string;
      selectedColor?: string;
    }>;

    const dateStr = new Date(order.createdAt).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const itemRows = items
      .map(
        (item) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#0f172a;">
            ${escHtml(item.name)}
            ${item.selectedSize ? `<br/><span style="font-size:12px;color:#64748b;">Размер: ${escHtml(item.selectedSize)}</span>` : ''}
            ${item.selectedColor ? `<br/><span style="font-size:12px;color:#64748b;">Цвет: ${escHtml(item.selectedColor)}</span>` : ''}
          </td>
          <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;text-align:right;font-family:monospace;">${(item.price * item.quantity).toLocaleString('ru-RU')} &#8376;</td>
        </tr>`,
      )
      .join('');

    const adminUrl = process.env.ADMIN_URL || 'http://localhost:3001/admin';

    const html = `<!DOCTYPE html>
<html lang="ru">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#0f172a,#1e3a5f);padding:32px 40px;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:20px;font-weight:700;">Scandic School</h1>
              <p style="color:#94a3b8;margin:4px 0 0;font-size:13px;">Панель администратора</p>
            </td>
          </tr>
          <tr>
            <td style="background:#dcfce7;border-bottom:1px solid #bbf7d0;padding:14px 40px;">
              <p style="margin:0;font-size:14px;font-weight:600;color:#166534;">&#128722; Новый заказ мерча #${order.id}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;margin-bottom:20px;">
                <tr><td style="padding:20px 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr><td style="padding:6px 0;"><span style="font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;">Родитель</span><br/><span style="font-size:15px;color:#0f172a;">${escHtml(order.parentName)}</span></td></tr>
                    <tr><td style="padding:6px 0;border-top:1px solid #f1f5f9;"><span style="font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;">Дети</span><br/><span style="font-size:15px;color:#0f172a;">${escHtml(order.childrenNames)}</span></td></tr>
                    <tr><td style="padding:6px 0;border-top:1px solid #f1f5f9;"><span style="font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;">Телефон</span><br/><span style="font-size:15px;font-family:monospace;color:#0f172a;">${escHtml(order.phone)}</span></td></tr>
                    <tr><td style="padding:6px 0;border-top:1px solid #f1f5f9;"><span style="font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;">Дата</span><br/><span style="font-size:15px;color:#0f172a;">${dateStr}</span></td></tr>
                  </table>
                </td></tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:20px;">
                <thead>
                  <tr style="background:#f8fafc;">
                    <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;">Товар</th>
                    <th style="padding:10px 12px;text-align:center;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;">Кол-во</th>
                    <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;">Сумма</th>
                  </tr>
                </thead>
                <tbody>${itemRows}</tbody>
                <tfoot>
                  <tr style="background:#f8fafc;">
                    <td colspan="2" style="padding:12px;font-size:15px;font-weight:700;">Итого</td>
                    <td style="padding:12px;font-size:15px;font-weight:700;text-align:right;font-family:monospace;">${order.total.toLocaleString('ru-RU')} &#8376;</td>
                  </tr>
                </tfoot>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td align="center">
                  <a href="${adminUrl}/orders" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#f4a724,#e8890a);color:#0f172a;font-size:15px;font-weight:700;text-decoration:none;border-radius:10px;">
                    Посмотреть заказы &#8594;
                  </a>
                </td></tr>
              </table>
            </td>
          </tr>
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

    await this.mail.sendOrderNotification(
      emails,
      order.id,
      order.parentName,
      html,
    );
  }
}
