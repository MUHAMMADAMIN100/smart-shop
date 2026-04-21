import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding...');

  const adminEmail = 'admin@shop.local';
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: await argon2.hash('admin12345'),
      name: 'Admin',
      role: 'ADMIN',
    },
  });

  const userEmail = 'user@shop.local';
  await prisma.user.upsert({
    where: { email: userEmail },
    update: {},
    create: {
      email: userEmail,
      password: await argon2.hash('user12345'),
      name: 'Test User',
    },
  });

  const brands = [
    { name: 'Apple', slug: 'apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
    { name: 'Samsung', slug: 'samsung', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg' },
    { name: 'Xiaomi', slug: 'xiaomi', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Xiaomi_logo.svg' },
    { name: 'Google', slug: 'google' },
    { name: 'OnePlus', slug: 'oneplus' },
    { name: 'Honor', slug: 'honor' },
  ];
  for (const b of brands) {
    await prisma.brand.upsert({ where: { slug: b.slug }, update: {}, create: b });
  }

  const categories = [
    { name: 'Флагманы', slug: 'flagship' },
    { name: 'Средний сегмент', slug: 'midrange' },
    { name: 'Бюджетные', slug: 'budget' },
    { name: 'Игровые', slug: 'gaming' },
  ];
  for (const c of categories) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }

  const apple = await prisma.brand.findUnique({ where: { slug: 'apple' } });
  const samsung = await prisma.brand.findUnique({ where: { slug: 'samsung' } });
  const xiaomi = await prisma.brand.findUnique({ where: { slug: 'xiaomi' } });
  const google = await prisma.brand.findUnique({ where: { slug: 'google' } });
  const oneplus = await prisma.brand.findUnique({ where: { slug: 'oneplus' } });
  const honor = await prisma.brand.findUnique({ where: { slug: 'honor' } });

  const flagship = await prisma.category.findUnique({ where: { slug: 'flagship' } });
  const mid = await prisma.category.findUnique({ where: { slug: 'midrange' } });
  const budget = await prisma.category.findUnique({ where: { slug: 'budget' } });
  const gaming = await prisma.category.findUnique({ where: { slug: 'gaming' } });

  const img = (id: string) => `https://images.unsplash.com/${id}?w=1200&q=80`;

  const products: Array<{
    slug: string; title: string; description: string;
    brandId: string; categoryId: string;
    basePrice: number; discount?: number;
    releaseYear: number;
    screenSize: number; screenType: string; resolution: string; refreshRate: number;
    processor: string; batteryMah: number; camerasMp: string; os: string;
    weight: number; waterproof: string;
    isFeatured?: boolean;
    images: string[];
    variants: Array<{ color: string; colorHex: string; storageGb: number; ramGb: number; price: number; stock: number; sku: string }>;
  }> = [
    {
      slug: 'iphone-15-pro', title: 'iPhone 15 Pro',
      description: 'Титановый корпус, чип A17 Pro, камера 48 Мп и USB-C. Флагман Apple с Action button.',
      brandId: apple!.id, categoryId: flagship!.id,
      basePrice: 109900, discount: 5, releaseYear: 2023,
      screenSize: 6.1, screenType: 'OLED', resolution: '2556x1179', refreshRate: 120,
      processor: 'Apple A17 Pro', batteryMah: 3274, camerasMp: '48+12+12', os: 'iOS 17',
      weight: 187, waterproof: 'IP68', isFeatured: true,
      images: [img('photo-1695048132798-0b6af27dbf93'), img('photo-1696446701796-da61225697cc'), img('photo-1696446700051-39b1b9a2b616')],
      variants: [
        { color: 'Натуральный титан', colorHex: '#8a8a8a', storageGb: 128, ramGb: 8, price: 109900, stock: 12, sku: 'IP15P-NT-128' },
        { color: 'Натуральный титан', colorHex: '#8a8a8a', storageGb: 256, ramGb: 8, price: 119900, stock: 8, sku: 'IP15P-NT-256' },
        { color: 'Чёрный титан', colorHex: '#2e2e2e', storageGb: 256, ramGb: 8, price: 119900, stock: 10, sku: 'IP15P-BT-256' },
        { color: 'Синий титан', colorHex: '#3f4f6b', storageGb: 512, ramGb: 8, price: 139900, stock: 4, sku: 'IP15P-BLT-512' },
      ],
    },
    {
      slug: 'iphone-15', title: 'iPhone 15',
      description: 'Базовая модель с Dynamic Island, камерой 48 Мп и USB-C.',
      brandId: apple!.id, categoryId: flagship!.id,
      basePrice: 79900, releaseYear: 2023,
      screenSize: 6.1, screenType: 'OLED', resolution: '2556x1179', refreshRate: 60,
      processor: 'Apple A16 Bionic', batteryMah: 3349, camerasMp: '48+12', os: 'iOS 17',
      weight: 171, waterproof: 'IP68',
      images: [img('photo-1695634621875-c30e5b66f7e8'), img('photo-1696446701796-da61225697cc')],
      variants: [
        { color: 'Розовый', colorHex: '#ffd6d6', storageGb: 128, ramGb: 6, price: 79900, stock: 20, sku: 'IP15-PK-128' },
        { color: 'Розовый', colorHex: '#ffd6d6', storageGb: 256, ramGb: 6, price: 89900, stock: 15, sku: 'IP15-PK-256' },
        { color: 'Чёрный', colorHex: '#1a1a1a', storageGb: 128, ramGb: 6, price: 79900, stock: 22, sku: 'IP15-BK-128' },
      ],
    },
    {
      slug: 'galaxy-s24-ultra', title: 'Samsung Galaxy S24 Ultra',
      description: 'Ультра-флагман с титановым корпусом, встроенным S Pen и ИИ-функциями Galaxy AI.',
      brandId: samsung!.id, categoryId: flagship!.id,
      basePrice: 129900, discount: 10, releaseYear: 2024,
      screenSize: 6.8, screenType: 'Dynamic AMOLED 2X', resolution: '3120x1440', refreshRate: 120,
      processor: 'Snapdragon 8 Gen 3', batteryMah: 5000, camerasMp: '200+50+12+10', os: 'Android 14',
      weight: 232, waterproof: 'IP68', isFeatured: true,
      images: [img('photo-1706549592077-f76c7f29be37'), img('photo-1707343848552-893e05dba6ac')],
      variants: [
        { color: 'Титан серый', colorHex: '#8a8a8a', storageGb: 256, ramGb: 12, price: 129900, stock: 9, sku: 'S24U-GR-256' },
        { color: 'Титан чёрный', colorHex: '#222222', storageGb: 512, ramGb: 12, price: 149900, stock: 5, sku: 'S24U-BK-512' },
        { color: 'Титан фиолетовый', colorHex: '#7a6c9e', storageGb: 512, ramGb: 12, price: 149900, stock: 7, sku: 'S24U-VI-512' },
      ],
    },
    {
      slug: 'galaxy-s24', title: 'Samsung Galaxy S24',
      description: 'Компактный флагман с Galaxy AI и отличной камерой.',
      brandId: samsung!.id, categoryId: flagship!.id,
      basePrice: 79900, releaseYear: 2024,
      screenSize: 6.2, screenType: 'Dynamic AMOLED 2X', resolution: '2340x1080', refreshRate: 120,
      processor: 'Exynos 2400', batteryMah: 4000, camerasMp: '50+12+10', os: 'Android 14',
      weight: 167, waterproof: 'IP68',
      images: [img('photo-1706549592077-f76c7f29be37')],
      variants: [
        { color: 'Оникс', colorHex: '#111111', storageGb: 128, ramGb: 8, price: 79900, stock: 14, sku: 'S24-ON-128' },
        { color: 'Мрамор', colorHex: '#cfcfcf', storageGb: 256, ramGb: 8, price: 89900, stock: 11, sku: 'S24-MR-256' },
      ],
    },
    {
      slug: 'xiaomi-14', title: 'Xiaomi 14',
      description: 'Флагман Xiaomi с оптикой Leica и Snapdragon 8 Gen 3.',
      brandId: xiaomi!.id, categoryId: flagship!.id,
      basePrice: 74900, releaseYear: 2024,
      screenSize: 6.36, screenType: 'LTPO AMOLED', resolution: '2670x1200', refreshRate: 120,
      processor: 'Snapdragon 8 Gen 3', batteryMah: 4610, camerasMp: '50+50+50', os: 'Android 14 / HyperOS',
      weight: 193, waterproof: 'IP68', isFeatured: true,
      images: [img('photo-1592890288564-76628a30a657')],
      variants: [
        { color: 'Чёрный', colorHex: '#000000', storageGb: 256, ramGb: 12, price: 74900, stock: 18, sku: 'MI14-BK-256' },
        { color: 'Белый', colorHex: '#f5f5f5', storageGb: 256, ramGb: 12, price: 74900, stock: 10, sku: 'MI14-WH-256' },
        { color: 'Зелёный', colorHex: '#3e6b4e', storageGb: 512, ramGb: 16, price: 84900, stock: 6, sku: 'MI14-GR-512' },
      ],
    },
    {
      slug: 'redmi-note-13-pro', title: 'Redmi Note 13 Pro',
      description: 'Мощный смартфон среднего класса с AMOLED и 200 Мп камерой.',
      brandId: xiaomi!.id, categoryId: mid!.id,
      basePrice: 27900, discount: 15, releaseYear: 2024,
      screenSize: 6.67, screenType: 'AMOLED', resolution: '2712x1220', refreshRate: 120,
      processor: 'Snapdragon 7s Gen 2', batteryMah: 5100, camerasMp: '200+8+2', os: 'Android 13 / HyperOS',
      weight: 187, waterproof: 'IP54',
      images: [img('photo-1598327105666-5b89351aff97')],
      variants: [
        { color: 'Чёрный', colorHex: '#0f0f0f', storageGb: 128, ramGb: 8, price: 27900, stock: 30, sku: 'RN13P-BK-128' },
        { color: 'Фиолетовый', colorHex: '#5e4d86', storageGb: 256, ramGb: 8, price: 31900, stock: 20, sku: 'RN13P-VI-256' },
      ],
    },
    {
      slug: 'pixel-8-pro', title: 'Google Pixel 8 Pro',
      description: 'ИИ-смартфон от Google с лучшей вычислительной фотографией.',
      brandId: google!.id, categoryId: flagship!.id,
      basePrice: 94900, releaseYear: 2023,
      screenSize: 6.7, screenType: 'LTPO OLED', resolution: '2992x1344', refreshRate: 120,
      processor: 'Google Tensor G3', batteryMah: 5050, camerasMp: '50+48+48', os: 'Android 14',
      weight: 213, waterproof: 'IP68',
      images: [img('photo-1598327105666-5b89351aff97')],
      variants: [
        { color: 'Obsidian', colorHex: '#1a1a1a', storageGb: 128, ramGb: 12, price: 94900, stock: 8, sku: 'PX8P-OB-128' },
        { color: 'Porcelain', colorHex: '#e8e4d8', storageGb: 256, ramGb: 12, price: 104900, stock: 5, sku: 'PX8P-PO-256' },
      ],
    },
    {
      slug: 'oneplus-12', title: 'OnePlus 12',
      description: 'Производительный флагман с Hasselblad-камерой и зарядкой 100W.',
      brandId: oneplus!.id, categoryId: gaming!.id,
      basePrice: 69900, releaseYear: 2024,
      screenSize: 6.82, screenType: 'LTPO AMOLED', resolution: '3168x1440', refreshRate: 120,
      processor: 'Snapdragon 8 Gen 3', batteryMah: 5400, camerasMp: '50+64+48', os: 'Android 14 / OxygenOS',
      weight: 220, waterproof: 'IP65',
      images: [img('photo-1580910051074-3eb694886505')],
      variants: [
        { color: 'Silky Black', colorHex: '#151515', storageGb: 256, ramGb: 12, price: 69900, stock: 14, sku: 'OP12-BK-256' },
        { color: 'Flowy Emerald', colorHex: '#276a5a', storageGb: 512, ramGb: 16, price: 79900, stock: 9, sku: 'OP12-EM-512' },
      ],
    },
    {
      slug: 'honor-magic6-pro', title: 'Honor Magic6 Pro',
      description: 'Флагман Honor с Falcon Camera System и зарядкой 80W.',
      brandId: honor!.id, categoryId: flagship!.id,
      basePrice: 89900, releaseYear: 2024,
      screenSize: 6.8, screenType: 'LTPO OLED', resolution: '2800x1280', refreshRate: 120,
      processor: 'Snapdragon 8 Gen 3', batteryMah: 5600, camerasMp: '50+180+50', os: 'Android 14 / MagicOS',
      weight: 225, waterproof: 'IP68',
      images: [img('photo-1585060544812-6b45742d762f')],
      variants: [
        { color: 'Чёрный', colorHex: '#000000', storageGb: 256, ramGb: 12, price: 89900, stock: 7, sku: 'HM6P-BK-256' },
        { color: 'Зелёный', colorHex: '#2d5a3e', storageGb: 512, ramGb: 16, price: 99900, stock: 4, sku: 'HM6P-GR-512' },
      ],
    },
    {
      slug: 'redmi-13c', title: 'Redmi 13C',
      description: 'Бюджетный смартфон с большим экраном и тройной камерой.',
      brandId: xiaomi!.id, categoryId: budget!.id,
      basePrice: 10900, releaseYear: 2023,
      screenSize: 6.74, screenType: 'IPS LCD', resolution: '1600x720', refreshRate: 90,
      processor: 'MediaTek Helio G85', batteryMah: 5000, camerasMp: '50+0.08+0.08', os: 'Android 13',
      weight: 192, waterproof: 'IP52',
      images: [img('photo-1598327105666-5b89351aff97')],
      variants: [
        { color: 'Чёрный', colorHex: '#111111', storageGb: 128, ramGb: 4, price: 10900, stock: 50, sku: 'R13C-BK-128' },
        { color: 'Голубой', colorHex: '#8ab4d4', storageGb: 128, ramGb: 8, price: 12900, stock: 35, sku: 'R13C-BL-128' },
      ],
    },
    {
      slug: 'galaxy-a54', title: 'Samsung Galaxy A54',
      description: 'Среднеценовой Samsung с AMOLED и защитой IP67.',
      brandId: samsung!.id, categoryId: mid!.id,
      basePrice: 32900, releaseYear: 2023,
      screenSize: 6.4, screenType: 'Super AMOLED', resolution: '2340x1080', refreshRate: 120,
      processor: 'Exynos 1380', batteryMah: 5000, camerasMp: '50+12+5', os: 'Android 13',
      weight: 202, waterproof: 'IP67',
      images: [img('photo-1706549592077-f76c7f29be37')],
      variants: [
        { color: 'Лайм', colorHex: '#c6d86f', storageGb: 128, ramGb: 8, price: 32900, stock: 20, sku: 'A54-LM-128' },
        { color: 'Графит', colorHex: '#3a3a3a', storageGb: 256, ramGb: 8, price: 36900, stock: 18, sku: 'A54-GR-256' },
      ],
    },
    {
      slug: 'iphone-14', title: 'iPhone 14',
      description: 'Надёжный iPhone прошлого поколения по приятной цене.',
      brandId: apple!.id, categoryId: mid!.id,
      basePrice: 59900, discount: 10, releaseYear: 2022,
      screenSize: 6.1, screenType: 'OLED', resolution: '2532x1170', refreshRate: 60,
      processor: 'Apple A15 Bionic', batteryMah: 3279, camerasMp: '12+12', os: 'iOS 17',
      weight: 172, waterproof: 'IP68',
      images: [img('photo-1678685888221-cda773a3dcdb')],
      variants: [
        { color: 'Сияющая звезда', colorHex: '#f5f0e6', storageGb: 128, ramGb: 6, price: 59900, stock: 25, sku: 'IP14-SS-128' },
        { color: 'Тёмная ночь', colorHex: '#1c1c1c', storageGb: 256, ramGb: 6, price: 67900, stock: 15, sku: 'IP14-MN-256' },
      ],
    },
  ];

  for (const p of products) {
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (existing) continue;

    await prisma.product.create({
      data: {
        slug: p.slug,
        title: p.title,
        description: p.description,
        brandId: p.brandId,
        categoryId: p.categoryId,
        basePrice: p.basePrice,
        discount: p.discount ?? 0,
        releaseYear: p.releaseYear,
        screenSize: p.screenSize,
        screenType: p.screenType,
        resolution: p.resolution,
        refreshRate: p.refreshRate,
        processor: p.processor,
        batteryMah: p.batteryMah,
        camerasMp: p.camerasMp,
        os: p.os,
        weight: p.weight,
        waterproof: p.waterproof,
        isFeatured: p.isFeatured ?? false,
        images: { create: p.images.map((u, i) => ({ url: u, order: i })) },
        variants: { create: p.variants },
      },
    });
  }

  console.log('Seeding done.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
