import {
  Controller,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
  NotFoundException,
  InternalServerErrorException,
  Post,
  Body,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/roles.decorator';
import { RequestWithUser } from 'src/common/interfaces/request.interface';
import { Conversation } from './entities/conversation.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { NotFoundError } from 'src/common/errors/service.error';

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

  @Post()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createConversationDto: CreateConversationDto) {
    try {
      const conversation = this.conversationsService.create(createConversationDto)
      return conversation
    } catch (error) {
      if(error instanceof NotFoundError){
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException(error.message)
    }
  }
}