import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMerchItemDto } from './dto/create-merch-item.dto';
import { UpdateMerchItemDto } from './dto/update-merch-item.dto';

@Injectable()
export class MerchService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.merchItem.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
  }

  findAllActive() {
    return this.prisma.merchItem.findMany({
      where: { inStock: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.merchItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`MerchItem #${id} not found`);
    return item;
  }

  create(dto: CreateMerchItemDto) {
    return this.prisma.merchItem.create({ data: dto });
  }

  async update(id: number, dto: UpdateMerchItemDto) {
    await this.findOne(id);
    return this.prisma.merchItem.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.merchItem.delete({ where: { id } });
  }
}
