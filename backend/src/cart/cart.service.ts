import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { IsInt, IsString, Min } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';

export class AddCartDto {
  @IsString() variantId!: string;
  @IsInt() @Min(1) quantity!: number;
}

export class UpdateCartDto {
  @IsInt() @Min(1) quantity!: number;
}

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.cartItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      include: {
        variant: {
          include: {
            product: {
              include: {
                brand: true,
                images: { take: 1, orderBy: { order: 'asc' } },
              },
            },
          },
        },
      },
    });
  }

  async add(userId: string, dto: AddCartDto) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: dto.variantId },
    });
    if (!variant) throw new NotFoundException('Variant not found');
    if (variant.stock < dto.quantity) throw new BadRequestException('Not enough stock');

    return this.prisma.cartItem.upsert({
      where: { userId_variantId: { userId, variantId: dto.variantId } },
      update: { quantity: { increment: dto.quantity } },
      create: { userId, variantId: dto.variantId, quantity: dto.quantity },
    });
  }

  async update(userId: string, id: string, dto: UpdateCartDto) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id },
      include: { variant: true },
    });
    if (!item || item.userId !== userId) throw new NotFoundException();
    if (item.variant.stock < dto.quantity) throw new BadRequestException('Not enough stock');
    return this.prisma.cartItem.update({ where: { id }, data: { quantity: dto.quantity } });
  }

  async remove(userId: string, id: string) {
    const item = await this.prisma.cartItem.findUnique({ where: { id } });
    if (!item || item.userId !== userId) throw new NotFoundException();
    await this.prisma.cartItem.delete({ where: { id } });
    return { ok: true };
  }

  clear(userId: string) {
    return this.prisma.cartItem.deleteMany({ where: { userId } });
  }
}
