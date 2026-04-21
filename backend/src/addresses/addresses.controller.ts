import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AddressDto, AddressesService } from './addresses.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(private svc: AddressesService) {}

  @Get()
  list(@CurrentUser() u: CurrentUserPayload) {
    return this.svc.list(u.id);
  }

  @Post()
  create(@CurrentUser() u: CurrentUserPayload, @Body() dto: AddressDto) {
    return this.svc.create(u.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() u: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: AddressDto,
  ) {
    return this.svc.update(u.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() u: CurrentUserPayload, @Param('id') id: string) {
    return this.svc.remove(u.id, id);
  }
}
