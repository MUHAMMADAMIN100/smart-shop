import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { OrderStatus, Role } from '@prisma/client';
import { CreateOrderDto, OrdersService, UpdateStatusDto } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Roles, RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private svc: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() u: CurrentUserPayload, @Body() dto: CreateOrderDto) {
    return this.svc.create(u.id, dto);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  my(@CurrentUser() u: CurrentUserPayload) {
    return this.svc.listForUser(u.id);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  adminList(@Query('status') status?: OrderStatus, @Query('search') search?: string) {
    return this.svc.adminList({ status, search });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  get(@CurrentUser() u: CurrentUserPayload, @Param('id') id: string) {
    return this.svc.getById(u.id, id, u.role === Role.ADMIN);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  cancel(@CurrentUser() u: CurrentUserPayload, @Param('id') id: string) {
    return this.svc.cancel(u.id, id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.svc.updateStatus(id, dto.status);
  }
}
