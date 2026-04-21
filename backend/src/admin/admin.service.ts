import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async stats() {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [
      usersCount,
      productsCount,
      ordersCount,
      revenueAgg,
      recentOrders,
      byStatus,
      topProducts,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.product.count(),
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        where: { status: { in: ['CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED'] } },
        _sum: { total: true },
      }),
      this.prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, email: true, name: true } } },
      }),
      this.prisma.order.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.orderItem.groupBy({
        by: ['productTitle'],
        where: { order: { createdAt: { gte: since } } },
        _sum: { quantity: true, priceAtTime: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
    ]);

    return {
      usersCount,
      productsCount,
      ordersCount,
      revenue: revenueAgg._sum.total ?? 0,
      recentOrders,
      ordersByStatus: byStatus,
      topProducts: topProducts.map((t) => ({
        title: t.productTitle,
        sold: t._sum.quantity ?? 0,
        revenue: (t._sum.priceAtTime ?? 0) * (t._sum.quantity ?? 0),
      })),
    };
  }

  listUsers(search?: string) {
    return this.prisma.user.findMany({
      where: search
        ? {
            OR: [
              { email: { contains: search, mode: 'insensitive' } },
              { name: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search } },
            ],
          }
        : undefined,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  setRole(id: string, role: Role) {
    return this.prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, role: true },
    });
  }
}
