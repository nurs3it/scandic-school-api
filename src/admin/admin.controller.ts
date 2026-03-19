import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  Req,
  HttpCode,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Response, Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'scandic2025';
const SESSION_KEY = 'scandic_admin';

function isAuthenticated(req: Request): boolean {
  return (req.cookies as Record<string, string>)?.[SESSION_KEY] === 'true';
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

function loginPage(error = '') {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Scandic Admin — Вход</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card {
      background: #fff;
      border-radius: 16px;
      padding: 48px 40px;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 25px 50px rgba(0,0,0,0.3);
    }
    .logo {
      text-align: center;
      margin-bottom: 32px;
    }
    .logo-circle {
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, #f4a724, #e8890a);
      border-radius: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      margin-bottom: 12px;
    }
    h1 { font-size: 22px; font-weight: 700; color: #0f172a; text-align: center; }
    p.sub { font-size: 14px; color: #64748b; text-align: center; margin-top: 4px; }
    .form { margin-top: 32px; display: flex; flex-direction: column; gap: 16px; }
    label { font-size: 13px; font-weight: 600; color: #374151; display: block; margin-bottom: 6px; }
    input {
      width: 100%;
      padding: 10px 14px;
      border: 1.5px solid #e2e8f0;
      border-radius: 8px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }
    input:focus { border-color: #f4a724; box-shadow: 0 0 0 3px rgba(244,167,36,0.15); }
    .error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
      font-size: 13px;
      padding: 10px 14px;
      border-radius: 8px;
    }
    button {
      padding: 12px;
      background: linear-gradient(135deg, #f4a724, #e8890a);
      color: #0f172a;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      margin-top: 4px;
      transition: opacity 0.2s;
    }
    button:hover { opacity: 0.9; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">
      <div class="logo-circle">🏫</div>
      <h1>Scandic School</h1>
      <p class="sub">Панель администратора</p>
    </div>
    ${error ? `<div class="error">⚠️ ${error}</div>` : ''}
    <form class="form" method="POST" action="/admin/login">
      <div>
        <label>Логин</label>
        <input type="text" name="username" placeholder="admin" required autofocus />
      </div>
      <div>
        <label>Пароль</label>
        <input type="password" name="password" placeholder="••••••••" required />
      </div>
      <button type="submit">Войти →</button>
    </form>
  </div>
</body>
</html>`;
}

function dashboardPage(applications: Array<{
  id: number;
  parentName: string;
  grade: string;
  language: string;
  parentPhone: string;
  createdAt: Date;
}>) {
  const total = applications.length;
  const today = applications.filter(a => {
    const d = new Date(a.createdAt);
    const now = new Date();
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const kazakh = applications.filter(a => a.language === 'kazakh').length;
  const russian = applications.filter(a => a.language === 'russian').length;

  const rows = applications.map(a => {
    const date = new Date(a.createdAt);
    const dateStr = date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    return `
      <tr>
        <td><span class="id">#${a.id}</span></td>
        <td><span class="name">${escHtml(a.parentName)}</span></td>
        <td><span class="phone">${escHtml(a.parentPhone)}</span></td>
        <td><span class="badge grade">${GRADE_LABELS[a.grade] ?? a.grade}</span></td>
        <td><span class="badge lang-${a.language}">${LANG_LABELS[a.language] ?? a.language}</span></td>
        <td><span class="date">${dateStr}</span><br/><span class="time">${timeStr}</span></td>
      </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Scandic Admin — Заявки</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f1f5f9;
      color: #0f172a;
      min-height: 100vh;
    }
    /* Sidebar */
    .layout { display: flex; min-height: 100vh; }
    .sidebar {
      width: 240px;
      background: #0f172a;
      color: #fff;
      display: flex;
      flex-direction: column;
      padding: 24px 0;
      position: fixed;
      top: 0; left: 0; bottom: 0;
      z-index: 10;
    }
    .sidebar-logo {
      padding: 0 24px 24px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .sidebar-logo .circle {
      width: 40px; height: 40px;
      background: linear-gradient(135deg, #f4a724, #e8890a);
      border-radius: 10px;
      display: inline-flex; align-items: center; justify-content: center;
      font-size: 18px; margin-bottom: 8px;
    }
    .sidebar-logo h2 { font-size: 15px; font-weight: 700; color: #fff; }
    .sidebar-logo p { font-size: 11px; color: #64748b; margin-top: 2px; }
    .nav { padding: 16px 12px; flex: 1; }
    .nav-item {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 12px;
      border-radius: 8px;
      color: #fff;
      font-size: 14px;
      font-weight: 500;
      text-decoration: none;
      margin-bottom: 4px;
      background: rgba(244,167,36,0.15);
      border: 1px solid rgba(244,167,36,0.2);
    }
    .sidebar-footer {
      padding: 16px 12px;
      border-top: 1px solid rgba(255,255,255,0.08);
    }
    .logout {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 12px;
      border-radius: 8px;
      color: #94a3b8;
      font-size: 13px;
      text-decoration: none;
      transition: color 0.2s, background 0.2s;
    }
    .logout:hover { color: #fff; background: rgba(255,255,255,0.05); }
    /* Main */
    .main { margin-left: 240px; flex: 1; padding: 32px; }
    /* Header */
    .page-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 28px;
    }
    .page-header h1 { font-size: 22px; font-weight: 700; }
    .page-header p { font-size: 13px; color: #64748b; margin-top: 2px; }
    .refresh-btn {
      padding: 8px 16px;
      background: #fff;
      border: 1.5px solid #e2e8f0;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      color: #374151;
      text-decoration: none;
      display: inline-flex; align-items: center; gap: 6px;
      transition: border-color 0.2s;
    }
    .refresh-btn:hover { border-color: #f4a724; }
    /* Stats */
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
    .stat-card {
      background: #fff;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    .stat-label { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
    .stat-value { font-size: 32px; font-weight: 800; color: #0f172a; margin-top: 6px; }
    .stat-sub { font-size: 12px; color: #94a3b8; margin-top: 4px; }
    .stat-card.accent .stat-value { color: #f4a724; }
    /* Table */
    .table-card {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      overflow: hidden;
    }
    .table-header {
      padding: 16px 20px;
      border-bottom: 1px solid #f1f5f9;
      display: flex; align-items: center; justify-content: space-between;
    }
    .table-header h3 { font-size: 15px; font-weight: 700; }
    .count-badge {
      background: #f1f5f9;
      color: #64748b;
      font-size: 12px;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: 20px;
    }
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: #f8fafc; }
    th {
      padding: 12px 16px;
      text-align: left;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      border-bottom: 1px solid #f1f5f9;
    }
    td {
      padding: 14px 16px;
      font-size: 14px;
      border-bottom: 1px solid #f8fafc;
      vertical-align: middle;
    }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #fafbfc; }
    .id { font-size: 12px; color: #94a3b8; font-weight: 600; }
    .name { font-weight: 600; color: #0f172a; }
    .phone { color: #374151; font-family: monospace; font-size: 13px; }
    .badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
    .grade { background: #fef3c7; color: #92400e; }
    .lang-kazakh { background: #dcfce7; color: #166534; }
    .lang-russian { background: #dbeafe; color: #1e40af; }
    .date { font-size: 13px; color: #374151; }
    .time { font-size: 11px; color: #94a3b8; }
    .empty {
      text-align: center;
      padding: 60px 20px;
      color: #94a3b8;
      font-size: 14px;
    }
    .empty-icon { font-size: 40px; display: block; margin-bottom: 12px; }
  </style>
</head>
<body>
<div class="layout">
  <!-- Sidebar -->
  <aside class="sidebar">
    <div class="sidebar-logo">
      <div class="circle">🏫</div>
      <h2>Scandic School</h2>
      <p>Панель администратора</p>
    </div>
    <nav class="nav">
      <a href="/admin" class="nav-item">📋 Заявки на зачисление</a>
    </nav>
    <div class="sidebar-footer">
      <a href="/admin/logout" class="logout">← Выйти</a>
    </div>
  </aside>

  <!-- Main content -->
  <main class="main">
    <div class="page-header">
      <div>
        <h1>Запросы на зачисление</h1>
        <p>Все входящие заявки от родителей</p>
      </div>
      <a href="/admin" class="refresh-btn">↻ Обновить</a>
    </div>

    <!-- Stats -->
    <div class="stats">
      <div class="stat-card accent">
        <div class="stat-label">Всего заявок</div>
        <div class="stat-value">${total}</div>
        <div class="stat-sub">за всё время</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Сегодня</div>
        <div class="stat-value">${today}</div>
        <div class="stat-sub">новых заявок</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Казахский</div>
        <div class="stat-value">${kazakh}</div>
        <div class="stat-sub">язык обучения</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Русский</div>
        <div class="stat-value">${russian}</div>
        <div class="stat-sub">язык обучения</div>
      </div>
    </div>

    <!-- Table -->
    <div class="table-card">
      <div class="table-header">
        <h3>Список заявок</h3>
        <span class="count-badge">${total} записей</span>
      </div>
      ${total === 0 ? `
        <div class="empty">
          <span class="empty-icon">📭</span>
          Заявок пока нет
        </div>
      ` : `
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Имя родителя</th>
            <th>Телефон</th>
            <th>Класс</th>
            <th>Язык</th>
            <th>Дата</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      `}
    </div>
  </main>
</div>
</body>
</html>`;
}

function escHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

@ApiExcludeController()
@Controller('admin')
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async dashboard(@Req() req: Request, @Res() res: Response) {
    if (!isAuthenticated(req)) {
      return res.redirect('/admin/login');
    }
    const applications = await this.prisma.application.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.send(dashboardPage(applications));
  }

  @Get('login')
  loginGet(@Req() req: Request, @Res() res: Response) {
    if (isAuthenticated(req)) return res.redirect('/admin');
    return res.send(loginPage());
  }

  @Post('login')
  @HttpCode(200)
  loginPost(
    @Body() body: { username: string; password: string },
    @Res() res: Response,
  ) {
    if (body.username === ADMIN_USER && body.password === ADMIN_PASS) {
      res.cookie(SESSION_KEY, 'true', {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 8 * 60 * 60 * 1000, // 8 hours
        secure: process.env.NODE_ENV === 'production',
      });
      return res.redirect('/admin');
    }
    return res.send(loginPage('Неверный логин или пароль'));
  }

  @Get('logout')
  logout(@Res() res: Response) {
    res.clearCookie(SESSION_KEY);
    return res.redirect('/admin/login');
  }
}
