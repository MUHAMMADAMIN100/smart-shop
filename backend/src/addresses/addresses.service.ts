import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';

export class AddressDto {
  @IsString() fullName!: string;
  @IsString() phone!: string;
  @IsString() country!: string;
  @IsString() city!: string;
  @IsString() street!: string;
  @IsOptional() @IsString() postalCode?: string;
  @IsOptional() @IsBoolean() isDefault?: boolean;
}

@Injectable()
export class AddressesService {
  constructor(private prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async create(userId: string, dto: AddressDto) {
    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    return this.prisma.address.create({ data: { ...dto, userId } });
  }

  async update(userId: string, id: string, dto: AddressDto) {
    const existing = await this.prisma.address.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException();
    if (existing.userId !== userId) throw new ForbiddenException();

    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, id: { not: id } },
        data: { isDefault: false },
      });
    }
    return this.prisma.address.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.address.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException();
    if (existing.userId !== userId) throw new ForbiddenException();
    await this.prisma.address.delete({ where: { id } });
    return { ok: true };
  }
}
