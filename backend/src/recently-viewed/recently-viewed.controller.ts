import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { RecentlyViewedService } from './recently-viewed.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@Controller('recently-viewed')
@UseGuards(JwtAuthGuard)
export class RecentlyViewedController {
  constructor(private svc: RecentlyViewedService) {}

  @Get()
  list(@CurrentUser() u: CurrentUserPayload) {
    return this.svc.list(u.id);
  }

  @Post(':productId')
  track(@CurrentUser() u: CurrentUserPayload, @Param('productId') productId: string) {
    return this.svc.track(u.id, productId);
  }
}
