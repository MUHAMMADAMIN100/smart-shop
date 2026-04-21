import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
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

  async toggle(userId: string, productId: string) {
    const existing = await this.prisma.favorite.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (existing) {
      await this.prisma.favorite.delete({ where: { id: existing.id } });
      return { favorite: false };
    }
    await this.prisma.favorite.create({ data: { userId, productId } });
    return { favorite: true };
  }
}
