import { Body, Controller, Delete, Param, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CreateReviewDto, ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private svc: ReviewsService) {}

  @Post()
  create(@CurrentUser() u: CurrentUserPayload, @Body() dto: CreateReviewDto) {
    return this.svc.create(u.id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() u: CurrentUserPayload, @Param('id') id: string) {
    return this.svc.remove(u.id, id, u.role === Role.ADMIN);
  }
}
