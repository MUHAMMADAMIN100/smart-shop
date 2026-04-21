import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { IsString } from 'class-validator';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export class CreateQuestionDto {
  @IsString() productId!: string;
  @IsString() body!: string;
}

export class CreateAnswerDto {
  @IsString() body!: string;
}

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  ask(userId: string, dto: CreateQuestionDto) {
    return this.prisma.question.create({
      data: { userId, productId: dto.productId, body: dto.body },
    });
  }

  answer(userId: string, userRole: Role, questionId: string, dto: CreateAnswerDto) {
    return this.prisma.answer.create({
      data: {
        userId,
        questionId,
        body: dto.body,
        isOfficial: userRole === Role.ADMIN,
      },
    });
  }

  async removeQuestion(userId: string, id: string, isAdmin: boolean) {
    const q = await this.prisma.question.findUnique({ where: { id } });
    if (!q) throw new NotFoundException();
    if (!isAdmin && q.userId !== userId) throw new ForbiddenException();
    await this.prisma.question.delete({ where: { id } });
    return { ok: true };
  }

  async removeAnswer(userId: string, id: string, isAdmin: boolean) {
    const a = await this.prisma.answer.findUnique({ where: { id } });
    if (!a) throw new NotFoundException();
    if (!isAdmin && a.userId !== userId) throw new ForbiddenException();
    await this.prisma.answer.delete({ where: { id } });
    return { ok: true };
  }
}
