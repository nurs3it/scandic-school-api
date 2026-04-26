import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import slugify from 'slugify';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';

@Injectable()
export class ClubsService {
  constructor(private readonly prisma: PrismaService) {}

  private async slugTaken(slug: string, excludeId?: number) {
    const row = await this.prisma.club.findUnique({ where: { slug } });
    if (!row) return false;
    return excludeId === undefined || row.id !== excludeId;
  }

  private async generateUniqueSlug(name: string, excludeId?: number) {
    const base = slugify(name, { lower: true, strict: true, locale: 'ru' }) || 'club';
    let candidate = base.slice(0, 180);
    let i = 2;
    while (await this.slugTaken(candidate, excludeId)) {
      candidate = `${base.slice(0, 180)}-${i++}`;
    }
    return candidate;
  }

  async create(dto: CreateClubDto) {
    const slug = dto.slug
      ? ((await this.slugTaken(dto.slug))
          ? (() => { throw new ConflictException(`Slug "${dto.slug}" уже занят`); })()
          : dto.slug)
      : await this.generateUniqueSlug(dto.name);
    return this.prisma.club.create({
      data: {
        slug,
        name: dto.name,
        shortDescription: dto.shortDescription,
        description: dto.description,
        image: dto.image,
        ageRange: dto.ageRange,
        schedule: dto.schedule,
        teacher: dto.teacher,
        isActive: dto.isActive ?? true,
        order: dto.order ?? 0,
      },
    });
  }

  async update(id: number, dto: UpdateClubDto) {
    const existing = await this.prisma.club.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Club ${id} not found`);
    let slug = existing.slug;
    if (dto.slug && dto.slug !== existing.slug) {
      if (await this.slugTaken(dto.slug, id))
        throw new ConflictException(`Slug "${dto.slug}" уже занят`);
      slug = dto.slug;
    } else if (!dto.slug && dto.name && dto.name !== existing.name) {
      slug = await this.generateUniqueSlug(dto.name, id);
    }
    return this.prisma.club.update({
      where: { id },
      data: {
        slug,
        name: dto.name ?? existing.name,
        shortDescription: dto.shortDescription ?? existing.shortDescription,
        description: dto.description ?? existing.description,
        image: dto.image ?? existing.image,
        ageRange: dto.ageRange ?? existing.ageRange,
        schedule: dto.schedule ?? existing.schedule,
        teacher: dto.teacher ?? existing.teacher,
        isActive: dto.isActive ?? existing.isActive,
        order: dto.order ?? existing.order,
      },
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.club.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Club ${id} not found`);
    await this.prisma.club.delete({ where: { id } });
  }

  async toggleActive(id: number) {
    const existing = await this.prisma.club.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Club ${id} not found`);
    return this.prisma.club.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });
  }

  async findById(id: number) {
    const row = await this.prisma.club.findUnique({ where: { id } });
    if (!row) throw new NotFoundException(`Club ${id} not found`);
    return row;
  }

  async findAllAdmin() {
    return this.prisma.club.findMany({ orderBy: [{ order: 'asc' }, { id: 'desc' }] });
  }

  async findAllPublic(opts: { withTournaments?: boolean }) {
    return this.prisma.club.findMany({
      where: { isActive: true },
      orderBy: [{ order: 'asc' }, { id: 'desc' }],
      include: opts.withTournaments
        ? {
            tournaments: {
              where: { isActive: true, endDate: { gte: new Date() } },
              orderBy: { startDate: 'asc' },
              take: 5,
            },
          }
        : undefined,
    });
  }

  async findBySlugPublic(slug: string) {
    const row = await this.prisma.club.findUnique({
      where: { slug },
      include: {
        tournaments: {
          where: { isActive: true },
          orderBy: { startDate: 'desc' },
        },
      },
    });
    if (!row || !row.isActive)
      throw new NotFoundException(`Club "${slug}" not found`);
    return row;
  }
}
