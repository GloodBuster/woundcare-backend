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
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  Param,
  UnauthorizedException,
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
import { PaginatedResponse } from 'src/common/responses/paginatedResponse';
import { ConversationDto } from './dto/conversation.dto';

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

  @Get('user/nurse')
  @Roles(Role.DOCTOR, Role.PATIENT)
  @HttpCode(HttpStatus.OK)
  async findUserConversationsWithNurses(
    @Request() req: RequestWithUser,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('per-page', new DefaultValuePipe(10), ParseIntPipe)
    itemsPerPage: number,
  ): Promise<PaginatedResponse<ConversationDto>> {
    try {
      return await this.conversationsService.findUserConversationsWithNurses(
        req.user.nationalId,
        page,
        itemsPerPage,
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message, { cause: error });
    }
  }

  @Get('nurse/patient')
  @Roles(Role.NURSE)
  @HttpCode(HttpStatus.OK)
  async findNurseConversationsWithPatients(
    @Request() req: RequestWithUser,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('per-page', new DefaultValuePipe(10), ParseIntPipe)
    itemsPerPage: number,
  ): Promise<PaginatedResponse<ConversationDto>> {
    try {
      return await this.conversationsService.findNurseConversationsWithPatients(
        req.user.nationalId,
        page,
        itemsPerPage,
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message, { cause: error });
    }
  }

  @Get('nurse/doctor')
  @Roles(Role.NURSE)
  @HttpCode(HttpStatus.OK)
  async findNurseConversationsWithDoctors(
    @Request() req: RequestWithUser,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('per-page', new DefaultValuePipe(10), ParseIntPipe)
    itemsPerPage: number,
  ): Promise<PaginatedResponse<ConversationDto>> {
    try {
      return await this.conversationsService.findNurseConversationsWithDoctors(
        req.user.nationalId,
        page,
        itemsPerPage,
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message, { cause: error });
    }
  }

  @Get(':id/nurse')
  @Roles(Role.NURSE)
  @HttpCode(HttpStatus.OK)
  async findNurseConversation(
    @Request() req: RequestWithUser,
    @Param('id', ParseIntPipe) conversationId: number,
  ): Promise<Conversation> {
    try {
      const conversation =
        await this.conversationsService.findNurseConversation(
          conversationId,
          req.user.nationalId,
        );

      if (!conversation)
        throw new UnauthorizedException(
          'The conversation does not belong to the nurse',
        );

      return conversation;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message, { cause: error });
    }
  }

  @Get(':id/user')
  @Roles(Role.DOCTOR, Role.PATIENT)
  @HttpCode(HttpStatus.OK)
  async findUserConversation(
    @Request() req: RequestWithUser,
    @Param('id', ParseIntPipe) conversationId: number,
  ): Promise<Conversation> {
    try {
      const conversation = await this.conversationsService.findUserConversation(
        conversationId,
        req.user.nationalId,
      );

      if (!conversation)
        throw new UnauthorizedException(
          'The conversation does not belong to the user',
        );

      return conversation;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message, { cause: error });
    }
  }

  @Post()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createConversationDto: CreateConversationDto) {
    try {
      const conversation = this.conversationsService.create(
        createConversationDto,
      );
      return conversation;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
