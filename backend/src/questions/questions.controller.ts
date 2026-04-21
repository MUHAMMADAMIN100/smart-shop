import { Body, Controller, Delete, Param, Post, UseGuards } from '@nestjs/common';
import { CreateAnswerDto, CreateQuestionDto, QuestionsService } from './questions.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller()
@UseGuards(JwtAuthGuard)
export class QuestionsController {
  constructor(private svc: QuestionsService) {}

  @Post('questions')
  ask(@CurrentUser() u: CurrentUserPayload, @Body() dto: CreateQuestionDto) {
    return this.svc.ask(u.id, dto);
  }

  @Post('questions/:id/answer')
  answer(
    @CurrentUser() u: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: CreateAnswerDto,
  ) {
    return this.svc.answer(u.id, u.role, id, dto);
  }

  @Delete('questions/:id')
  removeQuestion(@CurrentUser() u: CurrentUserPayload, @Param('id') id: string) {
    return this.svc.removeQuestion(u.id, id, u.role === Role.ADMIN);
  }

  @Delete('answers/:id')
  removeAnswer(@CurrentUser() u: CurrentUserPayload, @Param('id') id: string) {
    return this.svc.removeAnswer(u.id, id, u.role === Role.ADMIN);
  }
}
