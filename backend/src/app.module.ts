import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AddressesModule } from './addresses/addresses.module';
import { BrandsModule } from './brands/brands.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { FavoritesModule } from './favorites/favorites.module';
import { OrdersModule } from './orders/orders.module';
import { ReviewsModule } from './reviews/reviews.module';
import { QuestionsModule } from './questions/questions.module';
import { RecentlyViewedModule } from './recently-viewed/recently-viewed.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    AddressesModule,
    BrandsModule,
    CategoriesModule,
    ProductsModule,
    CartModule,
    FavoritesModule,
    OrdersModule,
    ReviewsModule,
    QuestionsModule,
    RecentlyViewedModule,
    AdminModule,
  ],
})
export class AppModule {}
