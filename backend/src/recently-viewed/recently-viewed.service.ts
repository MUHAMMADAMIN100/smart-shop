import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecentlyViewedService {
  constructor(private prisma: PrismaService) {}

  track(userId: string, productId: string) {
    return this.prisma.recentlyViewed.upsert({
      where: { userId_productId: { userId, productId } },
      update: { viewedAt: new Date() },
      create: { userId, productId },
    });
  }

  list(userId: string) {
    return this.prisma.recentlyViewed.findMany({
      where: { userId },
      orderBy: { viewedAt: 'desc' },
      take: 12,
      include: {
        product: {
          include: {
            brand: true,
            images: { take: 1, orderBy: { order: 'asc' } },
            variants: { take: 1, orderBy: { price: 'asc' } },
          },
        },
      },
    });
  }
}
