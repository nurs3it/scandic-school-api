import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';

@Injectable()
export class ContactMessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async findAll() {
    return this.prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateContactMessageDto) {
    const message = await this.prisma.contactMessage.create({ data: dto });

    const emails = await this.prisma.notificationEmail.findMany();
    const recipients = emails.map((e) => e.email);
    void this.mail.sendContactNotification(recipients, message);

    return message;
  }
}
