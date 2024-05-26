import {
  Controller,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/roles.decorator';
import { RequestWithUser } from 'src/common/interfaces/request.interface';
import { Conversation } from './entities/conversation.entity';

@ApiTags('conversations')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get('patient')
  @Roles(Role.PATIENT)
  @HttpCode(HttpStatus.OK)
  async findPatientConversation(
    @Request() req: RequestWithUser,
  ): Promise<Conversation> {
    try {
      const conversation = await this.conversationsService.findOneByNationalId(
        req.user.nationalId,
      );
      if (!conversation) throw new NotFoundException('Conversation not found');
      return conversation;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }
}
