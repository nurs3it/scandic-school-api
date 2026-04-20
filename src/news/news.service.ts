import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import slugify from 'slugify';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { NewsQueryDto } from './dto/news-query.dto';

@Injectable()
export class NewsService {
  constructor(private readonly prisma: PrismaService) {}

  static computeReadingMinutes(content: string): number {
    let text = '';
    try {
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.blocks)) {
        text = parsed.blocks
          .map((b: any) => {
            if (!b.data) return '';
            if (typeof b.data.text === 'string') return b.data.text;
            if (typeof b.data.code === 'string') return b.data.code;
            if (typeof b.data.message === 'string') return b.data.message;
            if (typeof b.data.html === 'string') return b.data.html;
            if (typeof b.data.caption === 'string') return b.data.caption;
            if (Array.isArray(b.data.items)) {
              return b.data.items
                .map((i: any) => {
                  if (typeof i === 'string') return i;
                  return i?.content ?? i?.text ?? '';
                })
                .join(' ');
            }
            if (Array.isArray(b.data.content)) {
              return b.data.content
                .map((row: any) => (Array.isArray(row) ? row.join(' ') : ''))
                .join(' ');
            }
            return '';
          })
          .join(' ');
      }
    } catch {
      text = content ?? '';
    }
    const stripped = text
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const words = stripped.length === 0 ? 0 : stripped.split(' ').length;
    return Math.max(1, Math.ceil(words / 200));
  }

  private async generateUniqueSlug(
    title: string,
    excludeId?: number,
  ): Promise<string> {
    const base =
      slugify(title, { lower: true, strict: true, locale: 'ru' }) || 'news';
    let candidate = base.slice(0, 180);
    let suffix = 2;
    while (await this.slugTaken(candidate, excludeId)) {
      candidate = `${base.slice(0, 180)}-${suffix++}`;
    }
    return candidate;
  }

  private async slugTaken(slug: string, excludeId?: number): Promise<boolean> {
    const row = await this.prisma.news.findUnique({ where: { slug } });
    if (!row) return false;
    return excludeId === undefined || row.id !== excludeId;
  }

  async create(dto: CreateNewsDto) {
    let slug: string;
    if (dto.slug) {
      if (await this.slugTaken(dto.slug)) {
        throw new ConflictException(`Slug "${dto.slug}" is already taken`);
      }
      slug = dto.slug;
    } else {
      slug = await this.generateUniqueSlug(dto.title);
    }
    return this.prisma.news.create({
      data: {
        slug,
        title: dto.title,
        description: dto.description,
        bannerUrl: dto.bannerUrl,
        content: dto.content,
        author: dto.author,
        tags: dto.tags ?? [],
        publishedAt: new Date(dto.publishedAt),
        readingMinutes: NewsService.computeReadingMinutes(dto.content),
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: number, dto: UpdateNewsDto) {
    const existing = await this.prisma.news.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`News ${id} not found`);

    let slug = existing.slug;
    if (dto.slug && dto.slug !== existing.slug) {
      if (await this.slugTaken(dto.slug, id)) {
        throw new ConflictException(`Slug "${dto.slug}" is already taken`);
      }
      slug = dto.slug;
    } else if (!dto.slug && dto.title && dto.title !== existing.title) {
      slug = await this.generateUniqueSlug(dto.title, id);
    }

    const content = dto.content ?? existing.content;
    return this.prisma.news.update({
      where: { id },
      data: {
        slug,
        title: dto.title ?? existing.title,
        description: dto.description ?? existing.description,
        bannerUrl: dto.bannerUrl ?? existing.bannerUrl,
        content,
        author: dto.author ?? existing.author,
        tags: dto.tags ?? existing.tags,
        publishedAt: dto.publishedAt
          ? new Date(dto.publishedAt)
          : existing.publishedAt,
        isActive: dto.isActive ?? existing.isActive,
        readingMinutes: NewsService.computeReadingMinutes(content),
      },
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.news.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`News ${id} not found`);
    await this.prisma.news.delete({ where: { id } });
  }

  async toggleActive(id: number) {
    const existing = await this.prisma.news.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`News ${id} not found`);
    return this.prisma.news.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });
  }

  async findById(id: number) {
    const row = await this.prisma.news.findUnique({ where: { id } });
    if (!row) throw new NotFoundException(`News ${id} not found`);
    return row;
  }

  async findAllAdmin() {
    return this.prisma.news.findMany({ orderBy: { publishedAt: 'desc' } });
  }

  async findAllPublic(q: NewsQueryDto) {
    const page = q.page ?? 1;
    const pageSize = q.pageSize ?? 12;
    const where: any = { isActive: true };
    if (q.tag) where.tags = { has: q.tag };
    const [items, total] = await Promise.all([
      this.prisma.news.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.news.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async findBySlugPublic(slug: string) {
    const row = await this.prisma.news.findUnique({ where: { slug } });
    if (!row || !row.isActive) {
      throw new NotFoundException(`News "${slug}" not found`);
    }
    return row;
  }

  async getAllTags(): Promise<string[]> {
    const rows = await this.prisma.$queryRaw<{ tag: string }[]>`
      SELECT DISTINCT UNNEST(tags) AS tag
      FROM "News"
      WHERE "isActive" = true
      ORDER BY tag ASC
    `;
    return rows.map((r) => r.tag);
  }
}
