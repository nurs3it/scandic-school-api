import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, RegistrationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { MailService } from '../mail/mail.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { RegistrationsQueryDto } from './dto/registrations-query.dto';

@Injectable()
export class TournamentRegistrationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly mail: MailService,
  ) {}

  async createForSlug(
    slug: string,
    dto: CreateRegistrationDto,
    receipt?: Express.Multer.File,
  ) {
    const tournament = await this.prisma.tournament.findUnique({ where: { slug } });
    if (!tournament || !tournament.isActive)
      throw new NotFoundException(`Tournament "${slug}" not found`);
    if (!tournament.isRegistrationOpen)
      throw new BadRequestException('Регистрация закрыта');
    if (tournament.registrationDeadline && tournament.registrationDeadline < new Date())
      throw new BadRequestException('Срок регистрации истёк');

    let receiptUrl: string | null = null;
    if (receipt) {
      receiptUrl = await this.storage.uploadTournamentReceipt(receipt);
    }

    const registration = await this.prisma.tournamentRegistration.create({
      data: {
        tournamentId: tournament.id,
        participantName: dto.participantName,
        phone: dto.phone,
        email: dto.email,
        fideId: dto.fideId,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        comment: dto.comment,
        receiptUrl,
        paymentNote: dto.paymentNote,
        status: RegistrationStatus.NEW,
      },
    });

    this.mail
      .sendTournamentRegistrationToAdmins(registration, tournament)
      .catch(() => undefined);

    return { id: registration.id, status: registration.status };
  }

  async listPublicBySlug(slug: string, page = 1, pageSize = 200) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!tournament) throw new NotFoundException(`Tournament "${slug}" not found`);
    const where: Prisma.TournamentRegistrationWhereInput = {
      tournamentId: tournament.id,
    };
    const [items, total] = await Promise.all([
      this.prisma.tournamentRegistration.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          participantName: true,
          phone: true,
          email: true,
          fideId: true,
          birthDate: true,
          comment: true,
          status: true,
          createdAt: true,
        },
      }),
      this.prisma.tournamentRegistration.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async listAdmin(q: RegistrationsQueryDto) {
    const page = q.page ?? 1;
    const pageSize = q.pageSize ?? 50;
    const where: Prisma.TournamentRegistrationWhereInput = {};
    if (q.tournamentId) where.tournamentId = q.tournamentId;
    if (q.status) where.status = q.status;
    if (q.from || q.to) {
      where.createdAt = {};
      if (q.from) (where.createdAt as Prisma.DateTimeFilter).gte = new Date(q.from);
      if (q.to) (where.createdAt as Prisma.DateTimeFilter).lte = new Date(q.to);
    }
    if (q.search) {
      where.OR = [
        { participantName: { contains: q.search, mode: 'insensitive' } },
        { phone: { contains: q.search } },
        { email: { contains: q.search, mode: 'insensitive' } },
        { fideId: { contains: q.search, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.tournamentRegistration.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { tournament: { select: { id: true, title: true, slug: true } } },
      }),
      this.prisma.tournamentRegistration.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async exportAdmin(q: Omit<RegistrationsQueryDto, 'page' | 'pageSize'>) {
    const where: Prisma.TournamentRegistrationWhereInput = {};
    if (q.tournamentId) where.tournamentId = q.tournamentId;
    if (q.status) where.status = q.status;
    if (q.from || q.to) {
      where.createdAt = {};
      if (q.from) (where.createdAt as Prisma.DateTimeFilter).gte = new Date(q.from);
      if (q.to) (where.createdAt as Prisma.DateTimeFilter).lte = new Date(q.to);
    }
    if (q.search) {
      where.OR = [
        { participantName: { contains: q.search, mode: 'insensitive' } },
        { phone: { contains: q.search } },
        { email: { contains: q.search, mode: 'insensitive' } },
        { fideId: { contains: q.search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.tournamentRegistration.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { tournament: { select: { id: true, title: true, slug: true } } },
    });
  }

  async findByIdAdmin(id: number) {
    const row = await this.prisma.tournamentRegistration.findUnique({
      where: { id },
      include: { tournament: true },
    });
    if (!row) throw new NotFoundException(`Registration ${id} not found`);
    return row;
  }

  async updateStatus(id: number, dto: UpdateStatusDto) {
    const existing = await this.prisma.tournamentRegistration.findUnique({
      where: { id },
      include: { tournament: true },
    });
    if (!existing) throw new NotFoundException(`Registration ${id} not found`);
    const oldStatus = existing.status;

    const updated = await this.prisma.tournamentRegistration.update({
      where: { id },
      data: { status: dto.status, adminNote: dto.adminNote ?? existing.adminNote },
      include: { tournament: true },
    });

    if (
      updated.email &&
      updated.status !== RegistrationStatus.NEW &&
      updated.status !== oldStatus
    ) {
      this.mail
        .sendRegistrationStatusUpdateToParticipant(
          updated,
          updated.tournament,
          oldStatus,
          updated.status,
        )
        .catch(() => undefined);
    }
    return updated;
  }

  async remove(id: number) {
    const existing = await this.prisma.tournamentRegistration.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Registration ${id} not found`);
    await this.prisma.tournamentRegistration.delete({ where: { id } });
  }
}
