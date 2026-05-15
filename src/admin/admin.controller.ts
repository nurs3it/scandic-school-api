import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Res,
  Req,
  HttpCode,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import {
  FileInterceptor,
  FileFieldsInterceptor,
} from '@nestjs/platform-express';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Response, Request } from 'express';
import { memoryStorage } from 'multer';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { NewsService } from '../news/news.service';
import { ClubsService } from '../clubs/clubs.service';
import { TournamentsService } from '../tournaments/tournaments.service';
import { TournamentRegistrationsService } from '../tournament-registrations/tournament-registrations.service';
import {
  buildPdf,
  buildTxt,
  buildXlsx,
  describeFilters,
  type ExportRow,
} from '../tournament-registrations/registrations-export';
import { AdminGuard, isAuthenticated, SESSION_KEY } from './admin.guard';
import {
  loginPage,
  dashboardPage,
  emailsPage,
  instagramPage,
  merchPage,
  merchFormPage,
  ordersPage,
  newsListPage,
  newsFormPage,
  contactMessagesPage,
} from './admin.templates';
import {
  clubsListPage,
  clubFormPage,
} from './templates/clubs.templates';
import {
  tournamentsListPage,
  tournamentFormPage,
} from './templates/tournaments.templates';
import {
  registrationsListPage,
  registrationDetailPage,
} from './templates/registrations.templates';

// ─── File upload config (memory buffer → Supabase Storage) ────────────────────

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
];

function imageFileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Недопустимый тип файла: ${file.mimetype}. Разрешены только изображения.`,
      ),
      false,
    );
  }
}

const uploadConfig = {
  storage: memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: imageFileFilter,
};

const ALLOWED_ATTACH_MIME_TYPES = [
  ...ALLOWED_MIME_TYPES,
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
  'application/x-zip-compressed',
  'text/plain',
  'text/csv',
];

function attachFileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) {
  if (ALLOWED_ATTACH_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Недопустимый тип файла: ${file.mimetype}`), false);
  }
}

const attachUploadConfig = {
  storage: memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: attachFileFilter,
};

// ─── Auth constants ───────────────────────────────────────────────────────────

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'scandic2025';

// ─── Controller ───────────────────────────────────────────────────────────────

@ApiExcludeController()
@Controller('admin')
export class AdminController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly news: NewsService,
    private readonly clubs: ClubsService,
    private readonly tournaments: TournamentsService,
    private readonly registrations: TournamentRegistrationsService,
  ) {}

  // ── Auth (no guard — these handle their own auth) ───────────────────────────

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
        maxAge: 8 * 60 * 60 * 1000,
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

  // ── Dashboard (applications) ────────────────────────────────────────────────

  @Get()
  @UseGuards(AdminGuard)
  async dashboard(@Res() res: Response) {
    const applications = await this.prisma.application.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.send(dashboardPage(applications));
  }

  @Post('applications/:id/delete')
  @HttpCode(302)
  @UseGuards(AdminGuard)
  async applicationDelete(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    await this.prisma.application.delete({ where: { id } });
    return res.redirect('/admin');
  }

  // ── Emails ──────────────────────────────────────────────────────────────────

  @Get('emails')
  @UseGuards(AdminGuard)
  async emailsGet(@Req() req: Request, @Res() res: Response) {
    const emails = await this.prisma.notificationEmail.findMany({
      orderBy: { createdAt: 'desc' },
    });
    const query = req.query as Record<string, string>;
    const flash = query['added']
      ? { type: 'success' as const, message: 'Email успешно добавлен' }
      : undefined;
    return res.send(emailsPage(emails, flash));
  }

  @Post('emails')
  @HttpCode(302)
  @UseGuards(AdminGuard)
  async emailsPost(@Body() body: { email: string }, @Res() res: Response) {
    const email = (body.email || '').trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const emails = await this.prisma.notificationEmail.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return res.send(
        emailsPage(emails, {
          type: 'error',
          message: 'Введите корректный email адрес',
        }),
      );
    }
    try {
      await this.prisma.notificationEmail.create({ data: { email } });
    } catch {
      const emails = await this.prisma.notificationEmail.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return res.send(
        emailsPage(emails, {
          type: 'error',
          message: `Адрес ${email} уже добавлен`,
        }),
      );
    }
    return res.redirect('/admin/emails?added=1');
  }

  @Post('emails/:id/delete')
  @HttpCode(302)
  @UseGuards(AdminGuard)
  async emailDelete(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    await this.prisma.notificationEmail.delete({ where: { id } });
    return res.redirect('/admin/emails');
  }

  // ── Instagram ───────────────────────────────────────────────────────────────

  @Get('instagram')
  @UseGuards(AdminGuard)
  async instagramGet(@Res() res: Response) {
    const posts = await this.prisma.instagramPost.findMany({
      orderBy: { order: 'asc' },
    });
    return res.send(instagramPage(posts));
  }

  @Post('instagram')
  @HttpCode(302)
  @UseGuards(AdminGuard)
  async instagramPost(@Body() body: { url: string }, @Res() res: Response) {
    const url = (body.url || '').trim();
    if (!url) return res.redirect('/admin/instagram');
    try {
      const maxPost = await this.prisma.instagramPost.findFirst({
        orderBy: { order: 'desc' },
      });
      const nextOrder = (maxPost?.order ?? -1) + 1;
      await this.prisma.instagramPost.create({
        data: { url, order: nextOrder, isActive: true },
      });
    } catch (e) {
      console.error('Instagram create error:', e);
    }
    return res.redirect('/admin/instagram');
  }

  @Post('instagram/reorder')
  @HttpCode(302)
  @UseGuards(AdminGuard)
  async instagramReorder(@Body() body: { ids: string }, @Res() res: Response) {
    const ids = (body.ids || '').split(',').map(Number).filter(Boolean);
    await Promise.all(
      ids.map((id, index) =>
        this.prisma.instagramPost.update({
          where: { id },
          data: { order: index },
        }),
      ),
    );
    return res.redirect('/admin/instagram');
  }

  @Post('instagram/:id/toggle')
  @HttpCode(302)
  @UseGuards(AdminGuard)
  async instagramToggle(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { isActive: string },
    @Res() res: Response,
  ) {
    await this.prisma.instagramPost
      .update({ where: { id }, data: { isActive: body.isActive === 'true' } })
      .catch(() => null);
    return res.redirect('/admin/instagram');
  }

  @Post('instagram/:id/delete')
  @HttpCode(302)
  @UseGuards(AdminGuard)
  async instagramDelete(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    await this.prisma.instagramPost.delete({ where: { id } }).catch(() => null);
    return res.redirect('/admin/instagram');
  }

  // ── Merch list ──────────────────────────────────────────────────────────────

  @Get('merch')
  @UseGuards(AdminGuard)
  async merchGet(@Req() req: Request, @Res() res: Response) {
    const items = await this.prisma.merchItem.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
    const q = req.query as Record<string, string>;
    const flash = q['added']
      ? { type: 'success' as const, message: 'Товар успешно добавлен' }
      : q['updated']
        ? { type: 'success' as const, message: 'Товар успешно обновлён' }
        : q['deleted']
          ? { type: 'success' as const, message: 'Товар удалён' }
          : undefined;
    return res.send(merchPage(items, flash));
  }

  // ── Merch new form ──────────────────────────────────────────────────────────

  @Get('merch/new')
  @UseGuards(AdminGuard)
  merchNewGet(@Res() res: Response) {
    return res.send(merchFormPage('new'));
  }

  // ── Merch create ────────────────────────────────────────────────────────────

  @Post('merch/create')
  @HttpCode(302)
  @UseGuards(AdminGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'imageFile', maxCount: 1 },
        { name: 'extraFiles', maxCount: 10 },
      ],
      uploadConfig,
    ),
  )
  async merchCreate(
    @Req() req: Request,
    @Res() res: Response,
    @UploadedFiles()
    files: {
      imageFile?: Express.Multer.File[];
      extraFiles?: Express.Multer.File[];
    },
  ) {
    const body = req.body as Record<string, string>;
    const name = (body.name || '').trim();
    const description = (body.description || '').trim();
    const price = parseInt(body.price || '0', 10);

    if (!name || !description || isNaN(price)) {
      return res.send(
        merchFormPage('new', undefined, {
          type: 'error',
          message: 'Заполните обязательные поля',
        }),
      );
    }

    const uploadedMain = files?.imageFile?.[0];
    const imageUrl = (body.imageUrl || '').trim();
    const image = uploadedMain
      ? await this.storage.upload(uploadedMain)
      : imageUrl;

    const existingImages = (body.existingImages || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const extraUrls = files?.extraFiles?.length
      ? await this.storage.uploadMultiple(files.extraFiles)
      : [];
    const allImages = [...existingImages, ...extraUrls];

    const sizes = (body.sizes || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const colors = (body.colors || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const category = (body.category || '').trim() || null;
    const inStock = body.inStock !== 'false';

    const maxItem = await this.prisma.merchItem.findFirst({
      orderBy: { order: 'desc' },
    });
    const order = (maxItem?.order ?? -1) + 1;

    await this.prisma.merchItem.create({
      data: {
        name,
        description,
        price,
        image,
        images: allImages,
        category,
        inStock,
        sizes,
        colors,
        order,
      },
    });
    return res.redirect('/admin/merch?added=1');
  }

  // ── Merch edit form ─────────────────────────────────────────────────────────

  @Get('merch/:id/edit')
  @UseGuards(AdminGuard)
  async merchEditGet(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const item = await this.prisma.merchItem
      .findUnique({ where: { id } })
      .catch(() => null);
    if (!item) return res.redirect('/admin/merch');
    return res.send(merchFormPage('edit', item));
  }

  // ── Merch update ────────────────────────────────────────────────────────────

  @Post('merch/:id/update')
  @HttpCode(302)
  @UseGuards(AdminGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'imageFile', maxCount: 1 },
        { name: 'extraFiles', maxCount: 10 },
      ],
      uploadConfig,
    ),
  )
  async merchUpdate(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
    @UploadedFiles()
    files: {
      imageFile?: Express.Multer.File[];
      extraFiles?: Express.Multer.File[];
    },
  ) {
    const body = req.body as Record<string, string>;
    const name = (body.name || '').trim();
    const description = (body.description || '').trim();
    const price = parseInt(body.price || '0', 10);

    if (!name || !description || isNaN(price)) {
      const item = await this.prisma.merchItem
        .findUnique({ where: { id } })
        .catch(() => null);
      return res.send(
        merchFormPage('edit', item ?? undefined, {
          type: 'error',
          message: 'Заполните обязательные поля',
        }),
      );
    }

    const uploadedMain = files?.imageFile?.[0];
    const imageUrl = (body.imageUrl || '').trim();
    const existing = await this.prisma.merchItem.findUnique({ where: { id } });
    const image = uploadedMain
      ? await this.storage.upload(uploadedMain)
      : imageUrl || existing?.image || '';

    const existingImages = (body.existingImages || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const extraUrls = files?.extraFiles?.length
      ? await this.storage.uploadMultiple(files.extraFiles)
      : [];
    const allImages = [...existingImages, ...extraUrls];

    const sizes = (body.sizes || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const colors = (body.colors || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const category = (body.category || '').trim() || null;
    const inStock = body.inStock !== 'false';

    await this.prisma.merchItem
      .update({
        where: { id },
        data: {
          name,
          description,
          price,
          image,
          images: allImages,
          category,
          inStock,
          sizes,
          colors,
        },
      })
      .catch(() => null);
    return res.redirect('/admin/merch?updated=1');
  }

  // ── Merch reorder ───────────────────────────────────────────────────────────

  @Post('merch/reorder')
  @HttpCode(302)
  @UseGuards(AdminGuard)
  async merchReorder(@Body() body: { ids: string }, @Res() res: Response) {
    const ids = (body.ids || '').split(',').map(Number).filter(Boolean);
    await Promise.all(
      ids.map((id, index) =>
        this.prisma.merchItem.update({ where: { id }, data: { order: index } }),
      ),
    );
    return res.redirect('/admin/merch');
  }

  // ── Merch delete ────────────────────────────────────────────────────────────

  @Post('merch/:id/delete')
  @HttpCode(302)
  @UseGuards(AdminGuard)
  async merchDelete(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    await this.prisma.merchItem.delete({ where: { id } }).catch(() => null);
    return res.redirect('/admin/merch?deleted=1');
  }

  // ── Orders ──────────────────────────────────────────────────────────────────

  @Get('orders')
  @UseGuards(AdminGuard)
  async ordersGet(@Req() req: Request, @Res() res: Response) {
    const orders = await this.prisma.merchOrder.findMany({
      orderBy: { createdAt: 'desc' },
    });
    const q = req.query as Record<string, string>;
    const flash = q['updated']
      ? { type: 'success' as const, message: 'Статус заказа обновлён' }
      : undefined;
    return res.send(ordersPage(orders, flash));
  }

  @Post('orders/:id/status')
  @HttpCode(302)
  @UseGuards(AdminGuard)
  async orderStatusUpdate(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: string },
    @Res() res: Response,
  ) {
    const validStatuses = ['NEW', 'IN_PROGRESS', 'REJECTED', 'SOLD'];
    if (validStatuses.includes(body.status)) {
      await this.prisma.merchOrder
        .update({ where: { id }, data: { status: body.status as any } })
        .catch(() => null);
    }
    return res.redirect('/admin/orders?updated=1');
  }

  // ── News list ───────────────────────────────────────────────────────────────

  @Get('news')
  @UseGuards(AdminGuard)
  async newsList(@Res() res: Response) {
    const items = await this.news.findAllAdmin();
    return res.send(newsListPage(items));
  }

  // ── News new form ──────────────────────────────────────────────────────────

  @Get('news/new')
  @UseGuards(AdminGuard)
  newsNew(@Res() res: Response) {
    const now = new Date();
    const tz = now.getTimezoneOffset() * 60000;
    const localIso = new Date(now.getTime() - tz).toISOString().slice(0, 16);
    return res.send(
      newsFormPage('/admin/news', {
        publishedAt: localIso,
        isActive: true,
        tags: [],
      }),
    );
  }

  // ── News edit form ─────────────────────────────────────────────────────────

  @Get('news/:id/edit')
  @UseGuards(AdminGuard)
  async newsEdit(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const row = await this.news.findById(id);
    const d = new Date(row.publishedAt);
    const tz = d.getTimezoneOffset() * 60000;
    const localIso = new Date(d.getTime() - tz).toISOString().slice(0, 16);
    return res.send(
      newsFormPage(`/admin/news/${id}`, { ...row, publishedAt: localIso }),
    );
  }

  // ── News upload image (Editor.js format) ────────────────────────────────────

  @Post('news/upload-image')
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('image', uploadConfig))
  async newsUploadImage(
    @Res() res: Response,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) return res.json({ success: 0 });
    try {
      const url = await this.storage.uploadNewsImage(
        file.buffer,
        file.originalname,
        file.mimetype,
      );
      return res.json({ success: 1, file: { url } });
    } catch (e: any) {
      return res.json({ success: 0, message: e?.message ?? 'Upload failed' });
    }
  }

  @Post('news/upload-image-url')
  @UseGuards(AdminGuard)
  async newsUploadImageByUrl(
    @Body() body: { url: string },
    @Res() res: Response,
  ) {
    const url = (body.url || '').trim();
    if (!url) return res.json({ success: 0 });
    return res.json({ success: 1, file: { url } });
  }

  // ── News upload file (attaches) ─────────────────────────────────────────────

  @Post('news/upload-file')
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('file', attachUploadConfig))
  async newsUploadFile(
    @Res() res: Response,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) return res.json({ success: 0 });
    try {
      // multer parses multipart filename as latin1 — decode back to utf8 so Cyrillic is preserved
      const originalName = Buffer.from(file.originalname, 'latin1').toString(
        'utf8',
      );
      const url = await this.storage.uploadNewsAttach(
        file.buffer,
        originalName,
        file.mimetype,
      );
      const ext = originalName.split('.').pop()?.toLowerCase() || '';
      return res.json({
        success: 1,
        file: {
          url,
          name: originalName,
          size: file.size,
          extension: ext,
        },
      });
    } catch (e: any) {
      return res.json({ success: 0, message: e?.message ?? 'Upload failed' });
    }
  }

  // ── News create ────────────────────────────────────────────────────────────

  @Post('news')
  @HttpCode(302)
  @UseGuards(AdminGuard)
  async newsCreate(@Body() body: any, @Res() res: Response) {
    const dto = this.buildNewsDto(body);
    try {
      await this.news.create(dto);
    } catch (e: any) {
      return res.send(
        newsFormPage('/admin/news', body, e?.message ?? 'Ошибка сохранения'),
      );
    }
    return res.redirect('/admin/news');
  }

  // ── News update ────────────────────────────────────────────────────────────

  @Post('news/:id')
  @HttpCode(302)
  @UseGuards(AdminGuard)
  async newsUpdate(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @Res() res: Response,
  ) {
    const dto = this.buildNewsDto(body);
    try {
      await this.news.update(id, dto);
    } catch (e: any) {
      return res.send(
        newsFormPage(
          `/admin/news/${id}`,
          { ...body, id },
          e?.message ?? 'Ошибка сохранения',
        ),
      );
    }
    return res.redirect('/admin/news');
  }

  // ── News delete ────────────────────────────────────────────────────────────

  @Post('news/:id/delete')
  @HttpCode(302)
  @UseGuards(AdminGuard)
  async newsDelete(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    await this.news.remove(id).catch(() => null);
    return res.redirect('/admin/news');
  }

  // ── News toggle ────────────────────────────────────────────────────────────

  @Post('news/:id/toggle')
  @HttpCode(302)
  @UseGuards(AdminGuard)
  async newsToggle(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    await this.news.toggleActive(id).catch(() => null);
    return res.redirect('/admin/news');
  }

  private buildNewsDto(body: any) {
    return {
      title: (body.title ?? '').trim(),
      description: (body.description ?? '').trim(),
      bannerUrl: (body.bannerUrl ?? '').trim(),
      content: body.content ?? '',
      author: (body.author ?? '').trim(),
      tags: String(body.tags ?? '')
        .split(',')
        .map((t: string) => t.trim())
        .filter(Boolean),
      publishedAt: body.publishedAt
        ? new Date(body.publishedAt).toISOString()
        : new Date().toISOString(),
      isActive: body.isActive === 'on' || body.isActive === true,
      slug: (body.slug ?? '').trim() || undefined,
    };
  }

  // ── Contact messages (Обращения) ─────────────────────────────────────────────

  @Get('contacts')
  @UseGuards(AdminGuard)
  async contactsGet(@Res() res: Response) {
    const messages = await this.prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.send(contactMessagesPage(messages));
  }

  @Post('contacts/:id/delete')
  @HttpCode(302)
  @UseGuards(AdminGuard)
  async contactDelete(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    await this.prisma.contactMessage
      .delete({ where: { id } })
      .catch(() => null);
    return res.redirect('/admin/contacts');
  }

  // ── Upload image (AJAX) ─────────────────────────────────────────────────────

  @Post('upload')
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('file', uploadConfig))
  async uploadImage(
    @Res() res: Response,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    const url = await this.storage.upload(file);
    return res.json({ url });
  }

  // ── Clubs ───────────────────────────────────────────────────────────────────

  @UseGuards(AdminGuard)
  @Get('clubs')
  async clubsList(@Req() req: Request, @Res() res: Response) {
    const items = await this.clubs.findAllAdmin();
    const flash =
      req.query.added ? 'Кружок создан' :
      req.query.updated ? 'Кружок обновлён' :
      req.query.deleted ? 'Кружок удалён' : undefined;
    return res.send(clubsListPage(items, flash));
  }

  @UseGuards(AdminGuard)
  @Get('clubs/new')
  clubNew(@Res() res: Response) {
    return res.send(clubFormPage('create'));
  }

  @UseGuards(AdminGuard)
  @Post('clubs')
  @UseInterceptors(FileInterceptor('image', uploadConfig))
  async clubCreate(
    @Body() body: any,
    @UploadedFile() image: Express.Multer.File,
    @Res() res: Response,
  ) {
    try {
      if (!image) throw new Error('Картинка обязательна');
      const imageUrl = await this.storage.uploadClubImage(image);
      await this.clubs.create({
        name: body.name,
        shortDescription: body.shortDescription,
        description: body.description,
        image: imageUrl,
        ageRange: body.ageRange || undefined,
        schedule: body.schedule || undefined,
        teacher: body.teacher || undefined,
        isActive: body.isActive === '1',
        order: body.order ? parseInt(body.order, 10) : 0,
        slug: body.slug || undefined,
      });
      return res.redirect('/admin/clubs?added=1');
    } catch (e: any) {
      return res.send(clubFormPage('create', undefined, e.message));
    }
  }

  @UseGuards(AdminGuard)
  @Get('clubs/:id/edit')
  async clubEdit(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const club = await this.clubs.findById(id);
    return res.send(clubFormPage('edit', club));
  }

  @UseGuards(AdminGuard)
  @Post('clubs/:id')
  @UseInterceptors(FileInterceptor('image', uploadConfig))
  async clubUpdate(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @UploadedFile() image: Express.Multer.File | undefined,
    @Res() res: Response,
  ) {
    try {
      const patch: any = {
        name: body.name,
        shortDescription: body.shortDescription,
        description: body.description,
        ageRange: body.ageRange || undefined,
        schedule: body.schedule || undefined,
        teacher: body.teacher || undefined,
        isActive: body.isActive === '1',
        order: body.order ? parseInt(body.order, 10) : 0,
        slug: body.slug || undefined,
      };
      if (image) patch.image = await this.storage.uploadClubImage(image);
      await this.clubs.update(id, patch);
      return res.redirect('/admin/clubs?updated=1');
    } catch (e: any) {
      const club = await this.clubs.findById(id);
      return res.send(clubFormPage('edit', club, e.message));
    }
  }

  @UseGuards(AdminGuard)
  @Post('clubs/:id/delete')
  async clubDelete(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    await this.clubs.remove(id);
    return res.redirect('/admin/clubs?deleted=1');
  }

  // ── Tournaments ─────────────────────────────────────────────────────────────

  private parseStagesFromBody(body: any): { title: string; date: string; description?: string }[] {
    const raw = body.stages;
    if (!raw || typeof raw !== 'object') return [];
    const arr = Array.isArray(raw) ? raw : Object.values(raw);
    return (arr as any[])
      .filter((s) => s && s.title && s.date)
      .map((s) => ({
        title: String(s.title).slice(0, 200),
        date: new Date(s.date).toISOString(),
        description: s.description ? String(s.description).slice(0, 2000) : undefined,
      }));
  }

  @UseGuards(AdminGuard)
  @Get('tournaments')
  async tournamentsList(@Req() req: Request, @Res() res: Response) {
    const items = await this.tournaments.findAllAdmin();
    const flash =
      req.query.added ? 'Турнир создан' :
      req.query.updated ? 'Турнир обновлён' :
      req.query.deleted ? 'Турнир удалён' : undefined;
    return res.send(tournamentsListPage(items as any, flash));
  }

  @UseGuards(AdminGuard)
  @Get('tournaments/new')
  async tournamentNew(@Res() res: Response) {
    const clubs = await this.prisma.club.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { order: 'asc' },
    });
    return res.send(tournamentFormPage('create', undefined, clubs));
  }

  @UseGuards(AdminGuard)
  @Post('tournaments')
  @UseInterceptors(FileFieldsInterceptor(
    [{ name: 'banner', maxCount: 1 }, { name: 'kaspiQr', maxCount: 1 }],
    uploadConfig,
  ))
  async tournamentCreate(
    @Body() body: any,
    @UploadedFiles() files: { banner?: Express.Multer.File[]; kaspiQr?: Express.Multer.File[] },
    @Res() res: Response,
  ) {
    const clubs = await this.prisma.club.findMany({
      select: { id: true, name: true }, orderBy: { order: 'asc' },
    });
    try {
      const banner = files?.banner?.[0];
      if (!banner) throw new Error('Баннер обязателен');
      const bannerUrl = await this.storage.uploadTournamentBanner(banner);
      let kaspiQrUrl: string | undefined;
      if (files?.kaspiQr?.[0]) {
        kaspiQrUrl = await this.storage.uploadTournamentQr(files.kaspiQr[0]);
      }
      await this.tournaments.create({
        title: body.title,
        shortDescription: body.shortDescription,
        description: body.description,
        bannerUrl,
        ageGroup: body.ageGroup || undefined,
        startDate: new Date(body.startDate).toISOString(),
        endDate: new Date(body.endDate).toISOString(),
        registrationDeadline: body.registrationDeadline
          ? new Date(body.registrationDeadline).toISOString() : undefined,
        location: body.location || undefined,
        stages: this.parseStagesFromBody(body),
        isFree: body.isFree === '1',
        price: body.price ? parseInt(body.price, 10) : 0,
        paymentMethod: body.paymentMethod,
        kaspiPhone: body.kaspiPhone || undefined,
        kaspiQrUrl,
        isActive: body.isActive === '1',
        isRegistrationOpen: body.isRegistrationOpen === '1',
        order: body.order ? parseInt(body.order, 10) : 0,
        clubId: body.clubId ? parseInt(body.clubId, 10) : undefined,
        slug: body.slug || undefined,
      });
      return res.redirect('/admin/tournaments?added=1');
    } catch (e: any) {
      return res.send(tournamentFormPage('create', undefined, clubs, e.message));
    }
  }

  @UseGuards(AdminGuard)
  @Get('tournaments/:id/edit')
  async tournamentEdit(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const tournament = await this.tournaments.findById(id);
    const clubs = await this.prisma.club.findMany({
      select: { id: true, name: true }, orderBy: { order: 'asc' },
    });
    return res.send(tournamentFormPage('edit', tournament as any, clubs));
  }

  @UseGuards(AdminGuard)
  @Post('tournaments/:id')
  @UseInterceptors(FileFieldsInterceptor(
    [{ name: 'banner', maxCount: 1 }, { name: 'kaspiQr', maxCount: 1 }],
    uploadConfig,
  ))
  async tournamentUpdate(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @UploadedFiles() files: { banner?: Express.Multer.File[]; kaspiQr?: Express.Multer.File[] },
    @Res() res: Response,
  ) {
    try {
      const patch: any = {
        title: body.title,
        shortDescription: body.shortDescription,
        description: body.description,
        ageGroup: body.ageGroup || undefined,
        startDate: new Date(body.startDate).toISOString(),
        endDate: new Date(body.endDate).toISOString(),
        registrationDeadline: body.registrationDeadline
          ? new Date(body.registrationDeadline).toISOString() : null,
        location: body.location || undefined,
        stages: this.parseStagesFromBody(body),
        isFree: body.isFree === '1',
        price: body.price ? parseInt(body.price, 10) : 0,
        paymentMethod: body.paymentMethod,
        kaspiPhone: body.kaspiPhone || undefined,
        isActive: body.isActive === '1',
        isRegistrationOpen: body.isRegistrationOpen === '1',
        order: body.order ? parseInt(body.order, 10) : 0,
        clubId: body.clubId ? parseInt(body.clubId, 10) : null,
        slug: body.slug || undefined,
      };
      if (files?.banner?.[0]) patch.bannerUrl = await this.storage.uploadTournamentBanner(files.banner[0]);
      if (files?.kaspiQr?.[0]) patch.kaspiQrUrl = await this.storage.uploadTournamentQr(files.kaspiQr[0]);
      await this.tournaments.update(id, patch);
      return res.redirect('/admin/tournaments?updated=1');
    } catch (e: any) {
      const tournament = await this.tournaments.findById(id);
      const clubs = await this.prisma.club.findMany({
        select: { id: true, name: true }, orderBy: { order: 'asc' },
      });
      return res.send(tournamentFormPage('edit', tournament as any, clubs, e.message));
    }
  }

  @UseGuards(AdminGuard)
  @Post('tournaments/:id/delete')
  async tournamentDelete(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    await this.tournaments.remove(id);
    return res.redirect('/admin/tournaments?deleted=1');
  }

  // ── Tournament Registrations ────────────────────────────────────────────────

  @UseGuards(AdminGuard)
  @Get('tournament-registrations')
  async registrationsList(@Req() req: Request, @Res() res: Response) {
    const q: any = req.query;
    const query = {
      tournamentId: q.tournamentId ? parseInt(q.tournamentId, 10) : undefined,
      status: q.status || undefined,
      from: q.from || undefined,
      to: q.to || undefined,
      search: q.search || undefined,
      page: q.page ? parseInt(q.page, 10) : 1,
      pageSize: 50,
    };
    const { items, total } = await this.registrations.listAdmin(query as any);
    const tournaments = await this.prisma.tournament.findMany({
      select: { id: true, title: true },
      orderBy: { startDate: 'desc' },
    });
    return res.send(registrationsListPage(items as any, query, total, tournaments));
  }

  @UseGuards(AdminGuard)
  @Get('tournament-registrations/export')
  async registrationsExport(@Req() req: Request, @Res() res: Response) {
    const q: any = req.query;
    const format = String(q.format || 'xlsx').toLowerCase();
    const filter = {
      tournamentId: q.tournamentId ? parseInt(q.tournamentId, 10) : undefined,
      status: q.status || undefined,
      from: q.from || undefined,
      to: q.to || undefined,
      search: q.search || undefined,
    };

    const rows = (await this.registrations.exportAdmin(filter as any)) as ExportRow[];

    let tournamentTitle: string | undefined;
    if (filter.tournamentId) {
      const t = await this.prisma.tournament.findUnique({
        where: { id: filter.tournamentId },
        select: { title: true },
      });
      tournamentTitle = t?.title;
    }
    const filterSummary = describeFilters({ ...filter, tournamentTitle });

    const stamp = new Date().toISOString().slice(0, 16).replace(/[T:]/g, '-');
    const baseName = `tournament-registrations-${stamp}`;

    if (format === 'xlsx') {
      const buf = await buildXlsx(rows);
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${baseName}.xlsx"`,
      );
      return res.send(buf);
    }

    if (format === 'pdf') {
      const buf = await buildPdf(rows, filterSummary);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${baseName}.pdf"`,
      );
      return res.send(buf);
    }

    if (format === 'txt' || format === 'text') {
      const txt = buildTxt(rows, filterSummary);
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${baseName}.txt"`,
      );
      return res.send(txt);
    }

    return res.status(400).send('Unsupported format. Use xlsx, pdf, or txt.');
  }

  @UseGuards(AdminGuard)
  @Get('tournament-registrations/:id')
  async registrationDetail(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const reg = await this.registrations.findByIdAdmin(id);
    const flash = req.query.updated ? 'Статус обновлён' : undefined;
    return res.send(registrationDetailPage(reg as any, flash));
  }

  @UseGuards(AdminGuard)
  @Post('tournament-registrations/:id/status')
  async registrationUpdateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: any; adminNote?: string },
    @Res() res: Response,
  ) {
    await this.registrations.updateStatus(id, {
      status: body.status,
      adminNote: body.adminNote || undefined,
    });
    return res.redirect(`/admin/tournament-registrations/${id}?updated=1`);
  }

  @UseGuards(AdminGuard)
  @Post('tournament-registrations/:id/delete')
  async registrationDelete(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    await this.registrations.remove(id);
    return res.redirect('/admin/tournament-registrations');
  }
}
