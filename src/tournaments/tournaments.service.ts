import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentMethod, Prisma } from '@prisma/client';
import slugify from 'slugify';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import {
  TournamentQueryDto,
  TournamentStatusFilter,
} from './dto/tournament-query.dto';

@Injectable()
export class TournamentsService {
  constructor(private readonly prisma: PrismaService) {}

  private async slugTaken(slug: string, excludeId?: number) {
    const row = await this.prisma.tournament.findUnique({ where: { slug } });
    if (!row) return false;
    return excludeId === undefined || row.id !== excludeId;
  }

  private async generateUniqueSlug(title: string, excludeId?: number) {
    const base = slugify(title, { lower: true, strict: true, locale: 'ru' }) || 'tournament';
    let candidate = base.slice(0, 180);
    let i = 2;
    while (await this.slugTaken(candidate, excludeId)) {
      candidate = `${base.slice(0, 180)}-${i++}`;
    }
    return candidate;
  }

  /**
   * Нормализует payment-поля по бизнес-правилам spec §4.
   * Возвращает поля или бросает BadRequestException.
   */
  private normalizePayment(input: {
    isFree?: boolean;
    price?: number;
    paymentMethod?: PaymentMethod;
    kaspiPhone?: string | null;
    kaspiQrUrl?: string | null;
  }) {
    const isFree = input.isFree ?? false;
    if (isFree) {
      return {
        isFree: true,
        price: 0,
        paymentMethod: PaymentMethod.NONE,
        kaspiPhone: null,
        kaspiQrUrl: null,
      };
    }
    const method = input.paymentMethod ?? PaymentMethod.NONE;
    if (method === PaymentMethod.NONE) {
      throw new BadRequestException(
        'Платный турнир должен иметь paymentMethod ∈ {KASPI_PHONE, KASPI_QR, BOTH}',
      );
    }
    if (
      (method === PaymentMethod.KASPI_PHONE || method === PaymentMethod.BOTH) &&
      !input.kaspiPhone
    ) {
      throw new BadRequestException('kaspiPhone обязателен для выбранного метода оплаты');
    }
    if (
      (method === PaymentMethod.KASPI_QR || method === PaymentMethod.BOTH) &&
      !input.kaspiQrUrl
    ) {
      throw new BadRequestException('kaspiQrUrl обязателен для выбранного метода оплаты');
    }
    return {
      isFree: false,
      price: input.price ?? 0,
      paymentMethod: method,
      kaspiPhone:
        method === PaymentMethod.KASPI_QR ? null : (input.kaspiPhone ?? null),
      kaspiQrUrl:
        method === PaymentMethod.KASPI_PHONE ? null : (input.kaspiQrUrl ?? null),
    };
  }

  async create(dto: CreateTournamentDto) {
    const slug = dto.slug
      ? ((await this.slugTaken(dto.slug))
          ? (() => { throw new ConflictException(`Slug "${dto.slug}" уже занят`); })()
          : dto.slug)
      : await this.generateUniqueSlug(dto.title);

    const payment = this.normalizePayment(dto);

    return this.prisma.tournament.create({
      data: {
        slug,
        title: dto.title,
        shortDescription: dto.shortDescription,
        description: dto.description,
        bannerUrl: dto.bannerUrl,
        ageGroup: dto.ageGroup,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        registrationDeadline: dto.registrationDeadline
          ? new Date(dto.registrationDeadline)
          : null,
        location: dto.location,
        stages: (dto.stages ?? []) as unknown as Prisma.InputJsonValue,
        isActive: dto.isActive ?? true,
        isRegistrationOpen: dto.isRegistrationOpen ?? true,
        order: dto.order ?? 0,
        clubId: dto.clubId,
        ...payment,
      },
    });
  }

  async update(id: number, dto: UpdateTournamentDto) {
    const existing = await this.prisma.tournament.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Tournament ${id} not found`);

    let slug = existing.slug;
    if (dto.slug && dto.slug !== existing.slug) {
      if (await this.slugTaken(dto.slug, id))
        throw new ConflictException(`Slug "${dto.slug}" уже занят`);
      slug = dto.slug;
    } else if (!dto.slug && dto.title && dto.title !== existing.title) {
      slug = await this.generateUniqueSlug(dto.title, id);
    }

    const payment = this.normalizePayment({
      isFree: dto.isFree ?? existing.isFree,
      price: dto.price ?? existing.price,
      paymentMethod: dto.paymentMethod ?? existing.paymentMethod,
      kaspiPhone: dto.kaspiPhone ?? existing.kaspiPhone,
      kaspiQrUrl: dto.kaspiQrUrl ?? existing.kaspiQrUrl,
    });

    return this.prisma.tournament.update({
      where: { id },
      data: {
        slug,
        title: dto.title ?? existing.title,
        shortDescription: dto.shortDescription ?? existing.shortDescription,
        description: dto.description ?? existing.description,
        bannerUrl: dto.bannerUrl ?? existing.bannerUrl,
        ageGroup: dto.ageGroup ?? existing.ageGroup,
        startDate: dto.startDate ? new Date(dto.startDate) : existing.startDate,
        endDate: dto.endDate ? new Date(dto.endDate) : existing.endDate,
        registrationDeadline:
          dto.registrationDeadline !== undefined
            ? dto.registrationDeadline
              ? new Date(dto.registrationDeadline)
              : null
            : existing.registrationDeadline,
        location: dto.location ?? existing.location,
        stages:
          dto.stages !== undefined
            ? (dto.stages as unknown as Prisma.InputJsonValue)
            : (existing.stages as Prisma.InputJsonValue),
        isActive: dto.isActive ?? existing.isActive,
        isRegistrationOpen: dto.isRegistrationOpen ?? existing.isRegistrationOpen,
        order: dto.order ?? existing.order,
        clubId: dto.clubId !== undefined ? dto.clubId : existing.clubId,
        ...payment,
      },
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.tournament.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Tournament ${id} not found`);
    await this.prisma.tournament.delete({ where: { id } });
  }

  async toggleActive(id: number) {
    const existing = await this.prisma.tournament.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Tournament ${id} not found`);
    return this.prisma.tournament.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });
  }

  async findById(id: number) {
    const row = await this.prisma.tournament.findUnique({
      where: { id },
      include: { club: true },
    });
    if (!row) throw new NotFoundException(`Tournament ${id} not found`);
    return row;
  }

  async findAllAdmin() {
    return this.prisma.tournament.findMany({
      orderBy: [{ order: 'asc' }, { startDate: 'desc' }],
      include: { club: { select: { id: true, name: true, slug: true } } },
    });
  }

  async findAllPublic(q: TournamentQueryDto) {
    const page = q.page ?? 1;
    const pageSize = q.pageSize ?? 24;
    const now = new Date();
    const where: Prisma.TournamentWhereInput = { isActive: true };
    if (q.clubId) where.clubId = q.clubId;
    if (q.ageGroup) where.ageGroup = q.ageGroup;
    if (q.status === TournamentStatusFilter.upcoming) {
      where.startDate = { gt: now };
    } else if (q.status === TournamentStatusFilter.ongoing) {
      where.AND = [{ startDate: { lte: now } }, { endDate: { gte: now } }];
    } else if (q.status === TournamentStatusFilter.past) {
      where.endDate = { lt: now };
    }
    const [items, total] = await Promise.all([
      this.prisma.tournament.findMany({
        where,
        orderBy:
          q.status === TournamentStatusFilter.past
            ? { startDate: 'desc' }
            : { startDate: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { club: { select: { id: true, name: true, slug: true } } },
      }),
      this.prisma.tournament.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async findBySlugPublic(slug: string) {
    const row = await this.prisma.tournament.findUnique({
      where: { slug },
      include: { club: true },
    });
    if (!row || !row.isActive)
      throw new NotFoundException(`Tournament "${slug}" not found`);
    return row;
  }

  async getDistinctAgeGroups(): Promise<string[]> {
    const rows = await this.prisma.tournament.findMany({
      where: { isActive: true, ageGroup: { not: null } },
      distinct: ['ageGroup'],
      select: { ageGroup: true },
    });
    return rows.map((r) => r.ageGroup as string).sort();
  }
}
