import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AddCartDto, CartService, UpdateCartDto } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private svc: CartService) {}

  @Get()
  list(@CurrentUser() u: CurrentUserPayload) {
    return this.svc.list(u.id);
  }

  @Post()
  add(@CurrentUser() u: CurrentUserPayload, @Body() dto: AddCartDto) {
    return this.svc.add(u.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() u: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: UpdateCartDto,
  ) {
    return this.svc.update(u.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() u: CurrentUserPayload, @Param('id') id: string) {
    return this.svc.remove(u.id, id);
  }

  @Delete()
  clear(@CurrentUser() u: CurrentUserPayload) {
    return this.svc.clear(u.id);
  }
}
