import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { ProductsService } from './products.service';
import { ProductListQuery, ProductUpsertDto } from './dto/product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Roles, RolesGuard } from '../auth/guards/roles.guard';

@Controller('products')
export class ProductsController {
  constructor(private svc: ProductsService) {}

  @Get()
  list(@Query() q: ProductListQuery) {
    return this.svc.list(q);
  }

  @Get('facets')
  facets() {
    return this.svc.facets();
  }

  @Get('suggest')
  suggest(@Query('q') q: string) {
    return this.svc.suggest(q);
  }

  @Get('compare')
  compare(@Query('ids') ids: string) {
    return this.svc.compare((ids ?? '').split(',').filter(Boolean));
  }

  @Get(':slug')
  get(@Param('slug') slug: string) {
    return this.svc.getBySlug(slug);
  }

  @Get(':slug/related')
  related(@Param('slug') slug: string) {
    return this.svc.related(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() dto: ProductUpsertDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: ProductUpsertDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
