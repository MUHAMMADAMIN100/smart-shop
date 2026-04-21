import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { UpdateProfileDto, UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private users: UsersService) {}

  @Get('me')
  me(@CurrentUser() user: CurrentUserPayload) {
    return this.users.me(user.id);
  }

  @Patch('me')
  update(@CurrentUser() user: CurrentUserPayload, @Body() dto: UpdateProfileDto) {
    return this.users.updateProfile(user.id, dto);
  }
}
