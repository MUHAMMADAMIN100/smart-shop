import { Module } from '@nestjs/common';
import { RecentlyViewedService } from './recently-viewed.service';
import { RecentlyViewedController } from './recently-viewed.controller';

@Module({
  providers: [RecentlyViewedService],
  controllers: [RecentlyViewedController],
})
export class RecentlyViewedModule {}
