import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProductListQuery, ProductUpsertDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async list(q: ProductListQuery) {
    const page = q.page ?? 1;
    const pageSize = q.pageSize ?? 12;
    const where: Prisma.ProductWhereInput = { isActive: true };

    if (q.search) {
      where.OR = [
        { title: { contains: q.search, mode: 'insensitive' } },
        { description: { contains: q.search, mode: 'insensitive' } },
        { processor: { contains: q.search, mode: 'insensitive' } },
      ];
    }
    if (q.brand) where.brand = { slug: q.brand };
    if (q.category) where.category = { slug: q.category };
    if (q.featured === 'true') where.isFeatured = true;

    if (q.minPrice != null || q.maxPrice != null) {
      where.basePrice = {};
      if (q.minPrice != null) where.basePrice.gte = q.minPrice;
      if (q.maxPrice != null) where.basePrice.lte = q.maxPrice;
    }

    const variantFilter: Prisma.ProductVariantWhereInput = {};
    if (q.color) variantFilter.color = { equals: q.color, mode: 'insensitive' };
    if (q.storageGb) variantFilter.storageGb = q.storageGb;
    if (q.ramGb) variantFilter.ramGb = q.ramGb;
    if (Object.keys(variantFilter).length) {
      where.variants = { some: variantFilter };
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    switch (q.sort) {
      case 'price_asc': orderBy = { basePrice: 'asc' }; break;
      case 'price_desc': orderBy = { basePrice: 'desc' }; break;
      case 'rating': orderBy = { rating: 'desc' }; break;
      case 'popular': orderBy = { reviewsCount: 'desc' }; break;
      case 'newest': default: orderBy = { createdAt: 'desc' };
    }

    const [total, items] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          brand: true,
          category: true,
          images: { orderBy: { order: 'asc' }, take: 1 },
          variants: { orderBy: { price: 'asc' } },
        },
      }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      pages: Math.ceil(total / pageSize),
    };
  }

  async facets() {
    const [brands, storages, rams, colors, priceAgg] = await Promise.all([
      this.prisma.brand.findMany({
        orderBy: { name: 'asc' },
        include: { _count: { select: { products: true } } },
      }),
      this.prisma.productVariant.groupBy({
        by: ['storageGb'],
        orderBy: { storageGb: 'asc' },
      }),
      this.prisma.productVariant.groupBy({
        by: ['ramGb'],
        orderBy: { ramGb: 'asc' },
      }),
      this.prisma.productVariant.groupBy({
        by: ['color'],
        orderBy: { color: 'asc' },
      }),
      this.prisma.product.aggregate({
        where: { isActive: true },
        _min: { basePrice: true },
        _max: { basePrice: true },
      }),
    ]);

    return {
      brands: brands.map((b) => ({
        id: b.id,
        slug: b.slug,
        name: b.name,
        logo: b.logo,
        count: b._count.products,
      })),
      storageGb: storages.map((s) => s.storageGb),
      ramGb: rams.map((r) => r.ramGb),
      colors: colors.map((c) => c.color),
      priceMin: priceAgg._min.basePrice ?? 0,
      priceMax: priceAgg._max.basePrice ?? 0,
    };
  }

  async suggest(term: string) {
    if (!term || term.length < 2) return [];
    return this.prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { title: { contains: term, mode: 'insensitive' } },
          { processor: { contains: term, mode: 'insensitive' } },
        ],
      },
      take: 8,
      select: {
        id: true,
        slug: true,
        title: true,
        basePrice: true,
        images: { take: 1, orderBy: { order: 'asc' } },
      },
    });
  }

  async getBySlug(slug: string) {
    const p = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        brand: true,
        category: true,
        images: { orderBy: { order: 'asc' } },
        variants: { orderBy: [{ storageGb: 'asc' }, { color: 'asc' }] },
        reviews: {
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        questions: {
          include: {
            user: { select: { id: true, name: true } },
            answers: {
              include: { user: { select: { id: true, name: true, role: true } } },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!p) throw new NotFoundException('Product not found');
    return p;
  }

  async related(slug: string) {
    const p = await this.prisma.product.findUnique({ where: { slug } });
    if (!p) return [];
    return this.prisma.product.findMany({
      where: {
        isActive: true,
        id: { not: p.id },
        OR: [{ brandId: p.brandId }, { categoryId: p.categoryId }],
      },
      take: 8,
      orderBy: { rating: 'desc' },
      include: {
        brand: true,
        images: { take: 1, orderBy: { order: 'asc' } },
        variants: { take: 1, orderBy: { price: 'asc' } },
      },
    });
  }

  async compare(ids: string[]) {
    if (!ids.length) return [];
    return this.prisma.product.findMany({
      where: { id: { in: ids } },
      include: {
        brand: true,
        category: true,
        images: { take: 1, orderBy: { order: 'asc' } },
        variants: { orderBy: { price: 'asc' } },
      },
    });
  }

  async create(dto: ProductUpsertDto) {
    return this.prisma.product.create({
      data: {
        slug: dto.slug,
        title: dto.title,
        description: dto.description,
        brandId: dto.brandId,
        categoryId: dto.categoryId,
        basePrice: dto.basePrice,
        discount: dto.discount ?? 0,
        releaseYear: dto.releaseYear,
        screenSize: dto.screenSize,
        screenType: dto.screenType,
        resolution: dto.resolution,
        refreshRate: dto.refreshRate,
        processor: dto.processor,
        batteryMah: dto.batteryMah,
        camerasMp: dto.camerasMp,
        os: dto.os,
        weight: dto.weight,
        waterproof: dto.waterproof,
        isFeatured: dto.isFeatured ?? false,
        isActive: dto.isActive ?? true,
        images: {
          create: dto.images.map((i, idx) => ({
            url: i.url,
            alt: i.alt,
            order: i.order ?? idx,
          })),
        },
        variants: {
          create: dto.variants.map((v) => ({
            color: v.color,
            colorHex: v.colorHex,
            storageGb: v.storageGb,
            ramGb: v.ramGb,
            price: v.price,
            stock: v.stock,
            sku: v.sku,
          })),
        },
      },
      include: { variants: true, images: true },
    });
  }

  async update(id: string, dto: ProductUpsertDto) {
    await this.prisma.product.findUniqueOrThrow({ where: { id } });
    return this.prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.productVariant.deleteMany({ where: { productId: id } });
      return tx.product.update({
        where: { id },
        data: {
          slug: dto.slug,
          title: dto.title,
          description: dto.description,
          brandId: dto.brandId,
          categoryId: dto.categoryId,
          basePrice: dto.basePrice,
          discount: dto.discount ?? 0,
          releaseYear: dto.releaseYear,
          screenSize: dto.screenSize,
          screenType: dto.screenType,
          resolution: dto.resolution,
          refreshRate: dto.refreshRate,
          processor: dto.processor,
          batteryMah: dto.batteryMah,
          camerasMp: dto.camerasMp,
          os: dto.os,
          weight: dto.weight,
          waterproof: dto.waterproof,
          isFeatured: dto.isFeatured ?? false,
          isActive: dto.isActive ?? true,
          images: {
            create: dto.images.map((i, idx) => ({
              url: i.url,
              alt: i.alt,
              order: i.order ?? idx,
            })),
          },
          variants: {
            create: dto.variants.map((v) => ({
              color: v.color,
              colorHex: v.colorHex,
              storageGb: v.storageGb,
              ramGb: v.ramGb,
              price: v.price,
              stock: v.stock,
              sku: v.sku,
            })),
          },
        },
        include: { variants: true, images: true },
      });
    });
  }

  async remove(id: string) {
    await this.prisma.product.delete({ where: { id } });
    return { ok: true };
  }
}
