import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInstagramPostDto } from './dto/create-instagram-post.dto';
import { UpdateInstagramPostDto } from './dto/update-instagram-post.dto';

@Injectable()
export class InstagramPostsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.instagramPost.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  create(dto: CreateInstagramPostDto) {
    return this.prisma.instagramPost.create({ data: dto });
  }

  async update(id: number, dto: UpdateInstagramPostDto) {
    await this.findOneOrFail(id);
    return this.prisma.instagramPost.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOneOrFail(id);
    return this.prisma.instagramPost.delete({ where: { id } });
  }

  private async findOneOrFail(id: number) {
    const post = await this.prisma.instagramPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException(`InstagramPost #${id} not found`);
    return post;
  }
}
