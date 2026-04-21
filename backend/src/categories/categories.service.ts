import { Injectable } from '@nestjs/common';
import { IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';

export class CategoryDto {
  @IsString() name!: string;
  @IsString() slug!: string;
}

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    });
  }

  create(dto: CategoryDto) {
    return this.prisma.category.create({ data: dto });
  }

  update(id: string, dto: CategoryDto) {
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.category.delete({ where: { id } });
  }
}
