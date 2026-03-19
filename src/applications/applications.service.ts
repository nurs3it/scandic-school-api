import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateApplicationDto } from './dto/create-application.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async findAll() {
    return this.prisma.application.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateApplicationDto) {
    const application = await this.prisma.application.create({ data: dto });

    const emails = await this.prisma.notificationEmail.findMany();
    const recipients = emails.map((e) => e.email);
    void this.mail.sendApplicationNotification(recipients, application);

    return application;
  }
}
