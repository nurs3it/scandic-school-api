import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import slugify from 'slugify';
import type { AttestationFile, AttestationSection } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface SectionInput {
  titleKk: string;
  titleRu: string;
  titleEn: string;
  parentId: number | null;
  slug?: string;
  isActive: boolean;
  order: number;
}

export type SectionNode = AttestationSection & {
  files: AttestationFile[];
  children: SectionNode[];
};

@Injectable()
export class AttestationService {
  constructor(private readonly prisma: PrismaService) {}

  private async slugTaken(slug: string, excludeId?: number) {
    const row = await this.prisma.attestationSection.findUnique({
      where: { slug },
    });
    return !!row && row.id !== excludeId;
  }

  private async resolveSlug(input: SectionInput, excludeId?: number) {
    if (input.slug) {
      if (await this.slugTaken(input.slug, excludeId))
        throw new ConflictException(`Slug "${input.slug}" уже занят`);
      return input.slug;
    }
    const base =
      slugify(input.titleEn || input.titleRu, {
        lower: true,
        strict: true,
        locale: 'ru',
      }).slice(0, 80) || 'section';
    let candidate = base;
    let i = 2;
    while (await this.slugTaken(candidate, excludeId))
      candidate = `${base}-${i++}`;
    return candidate;
  }

  /** Flat list, parents before children, with depth — for admin tree view and parent select. */
  async findAllAdmin() {
    const rows = await this.prisma.attestationSection.findMany({
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
      include: { _count: { select: { files: true } } },
    });
    const byParent = new Map<number | null, typeof rows>();
    for (const r of rows) {
      const list = byParent.get(r.parentId) ?? [];
      list.push(r);
      byParent.set(r.parentId, list);
    }
    const out: ((typeof rows)[number] & { depth: number })[] = [];
    const walk = (parentId: number | null, depth: number) => {
      for (const r of byParent.get(parentId) ?? []) {
        out.push({ ...r, depth });
        walk(r.id, depth + 1);
      }
    };
    walk(null, 0);
    return out;
  }

  /** Active sections as a nested tree; an inactive section hides its whole subtree. */
  async findTreePublic(): Promise<SectionNode[]> {
    const rows = await this.prisma.attestationSection.findMany({
      where: { isActive: true },
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
      include: { files: { orderBy: [{ order: 'asc' }, { id: 'asc' }] } },
    });
    const nodes = new Map<number, SectionNode>(
      rows.map((r) => [r.id, { ...r, children: [] }]),
    );
    const roots: SectionNode[] = [];
    for (const n of nodes.values()) {
      if (n.parentId === null) roots.push(n);
      else nodes.get(n.parentId)?.children.push(n);
    }
    return roots;
  }

  async findById(id: number) {
    const row = await this.prisma.attestationSection.findUnique({
      where: { id },
      include: { files: { orderBy: [{ order: 'asc' }, { id: 'asc' }] } },
    });
    if (!row) throw new NotFoundException(`Section ${id} not found`);
    return row;
  }

  async create(input: SectionInput) {
    return this.prisma.attestationSection.create({
      data: { ...input, slug: await this.resolveSlug(input) },
    });
  }

  async update(id: number, input: SectionInput) {
    const existing = await this.findById(id);
    // Walk up from the new parent: reaching `id` would create a cycle
    for (let p = input.parentId; p !== null; ) {
      if (p === id)
        throw new BadRequestException(
          'Раздел не может быть вложен в самого себя',
        );
      const parent = await this.prisma.attestationSection.findUnique({
        where: { id: p },
      });
      p = parent?.parentId ?? null;
    }
    const slug =
      input.slug && input.slug !== existing.slug
        ? await this.resolveSlug(input, id)
        : existing.slug;
    return this.prisma.attestationSection.update({
      where: { id },
      data: { ...input, slug },
    });
  }

  async remove(id: number) {
    await this.findById(id);
    await this.prisma.attestationSection.delete({ where: { id } });
  }

  async addFiles(sectionId: number, files: { title: string; url: string }[]) {
    const last = await this.prisma.attestationFile.aggregate({
      where: { sectionId },
      _max: { order: true },
    });
    const start = (last._max.order ?? -1) + 1;
    await this.prisma.attestationFile.createMany({
      data: files.map((f, i) => ({ ...f, sectionId, order: start + i })),
    });
  }

  async removeFile(fileId: number) {
    return this.prisma.attestationFile.delete({ where: { id: fileId } });
  }
}
