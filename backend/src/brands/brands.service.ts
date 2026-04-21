import { Injectable, NotFoundException } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';

export class BrandDto {
  @IsString() name!: string;
  @IsString() slug!: string;
  @IsOptional() @IsString() logo?: string;
}

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.brand.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    });
  }

  async getBySlug(slug: string) {
    const b = await this.prisma.brand.findUnique({ where: { slug } });
    if (!b) throw new NotFoundException();
    return b;
  }

  create(dto: BrandDto) {
    return this.prisma.brand.create({ data: dto });
  }

  update(id: string, dto: BrandDto) {
    return this.prisma.brand.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.brand.delete({ where: { id } });
  }
}
