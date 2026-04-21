import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { IsEnum } from 'class-validator';
import { Role } from '@prisma/client';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Roles, RolesGuard } from '../auth/guards/roles.guard';

class SetRoleDto {
  @IsEnum(Role)
  role!: Role;
}

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private svc: AdminService) {}

  @Get('stats')
  stats() {
    return this.svc.stats();
  }

  @Get('users')
  users(@Query('search') search?: string) {
    return this.svc.listUsers(search);
  }

  @Patch('users/:id/role')
  setRole(@Param('id') id: string, @Body() dto: SetRoleDto) {
    return this.svc.setRole(id, dto.role);
  }
}
