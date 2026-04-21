import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';

export class CreateReviewDto {
  @IsString() productId!: string;
  @IsInt() @Min(1) @Max(5) rating!: number;
  @IsOptional() @IsString() title?: string;
  @IsString() body!: string;
}

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateReviewDto) {
    const existing = await this.prisma.review.findUnique({
      where: { userId_productId: { userId, productId: dto.productId } },
    });
    if (existing) throw new BadRequestException('You already reviewed this product');

    const hasOrder = await this.prisma.order.findFirst({
      where: {
        userId,
        status: { in: ['SHIPPED', 'DELIVERED'] },
        items: { some: { variant: { productId: dto.productId } } },
      },
    });

    const review = await this.prisma.review.create({
      data: {
        userId,
        productId: dto.productId,
        rating: dto.rating,
        title: dto.title,
        body: dto.body,
        verified: !!hasOrder,
      },
    });
    await this.recalcRating(dto.productId);
    return review;
  }

  async remove(userId: string, id: string, isAdmin: boolean) {
    const r = await this.prisma.review.findUnique({ where: { id } });
    if (!r) throw new NotFoundException();
    if (!isAdmin && r.userId !== userId) throw new ForbiddenException();
    await this.prisma.review.delete({ where: { id } });
    await this.recalcRating(r.productId);
    return { ok: true };
  }

  private async recalcRating(productId: string) {
    const agg = await this.prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: true,
    });
    await this.prisma.product.update({
      where: { id: productId },
      data: {
        rating: agg._avg.rating ?? 0,
        reviewsCount: agg._count,
      },
    });
  }
}
