import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export class CreateOrderDto {
  @IsOptional() @IsString() addressId?: string;
  @IsOptional() @IsString() note?: string;

  @IsString() fullName!: string;
  @IsString() phone!: string;
  @IsString() country!: string;
  @IsString() city!: string;
  @IsString() street!: string;
  @IsOptional() @IsString() postalCode?: string;
}

export class UpdateStatusDto {
  @IsEnum(OrderStatus)
  status!: OrderStatus;
}

function genOrderNumber() {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const rand = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `SP-${stamp}-${rand}`;
}

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateOrderDto) {
    const cart = await this.prisma.cartItem.findMany({
      where: { userId },
      include: { variant: { include: { product: true } } },
    });
    if (cart.length === 0) throw new BadRequestException('Cart is empty');

    for (const it of cart) {
      if (it.variant.stock < it.quantity) {
        throw new BadRequestException(`Not enough stock for ${it.variant.product.title}`);
      }
    }

    const subtotal = cart.reduce((s, it) => s + it.variant.price * it.quantity, 0);
    const discount = cart.reduce((s, it) => {
      const d = it.variant.product.discount ?? 0;
      return s + Math.floor((it.variant.price * d) / 100) * it.quantity;
    }, 0);
    const shipping = subtotal >= 50000 ? 0 : 500;
    const total = subtotal - discount + shipping;

    return this.prisma.$transaction(async (tx) => {
      for (const it of cart) {
        await tx.productVariant.update({
          where: { id: it.variantId },
          data: { stock: { decrement: it.quantity } },
        });
      }

      const order = await tx.order.create({
        data: {
          orderNumber: genOrderNumber(),
          userId,
          addressId: dto.addressId,
          status: 'PENDING',
          subtotal,
          discount,
          shipping,
          total,
          note: dto.note,
          shipFullName: dto.fullName,
          shipPhone: dto.phone,
          shipCountry: dto.country,
          shipCity: dto.city,
          shipStreet: dto.street,
          shipPostal: dto.postalCode,
          items: {
            create: cart.map((it) => ({
              variantId: it.variantId,
              productTitle: it.variant.product.title,
              color: it.variant.color,
              storageGb: it.variant.storageGb,
              ramGb: it.variant.ramGb,
              priceAtTime: it.variant.price,
              quantity: it.quantity,
            })),
          },
        },
        include: { items: true },
      });

      await tx.cartItem.deleteMany({ where: { userId } });
      return order;
    });
  }

  listForUser(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });
  }

  async getById(userId: string | null, id: string, isAdmin = false) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        user: { select: { id: true, email: true, name: true, phone: true } },
      },
    });
    if (!order) throw new NotFoundException();
    if (!isAdmin && order.userId !== userId) throw new ForbiddenException();
    return order;
  }

  async cancel(userId: string, id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order || order.userId !== userId) throw new NotFoundException();
    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      throw new BadRequestException('Cannot cancel this order');
    }
    return this.prisma.$transaction(async (tx) => {
      for (const it of order.items) {
        await tx.productVariant.update({
          where: { id: it.variantId },
          data: { stock: { increment: it.quantity } },
        });
      }
      return tx.order.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: { items: true },
      });
    });
  }

  adminList(filter: { status?: OrderStatus; search?: string }) {
    return this.prisma.order.findMany({
      where: {
        ...(filter.status ? { status: filter.status } : {}),
        ...(filter.search
          ? {
              OR: [
                { orderNumber: { contains: filter.search, mode: 'insensitive' } },
                { shipFullName: { contains: filter.search, mode: 'insensitive' } },
                { shipPhone: { contains: filter.search } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, email: true, name: true } },
        items: true,
      },
      take: 100,
    });
  }

  updateStatus(id: string, status: OrderStatus) {
    return this.prisma.order.update({ where: { id }, data: { status } });
  }
}
