import {
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseFilePipeBuilder,
  ParseIntPipe,
  Post,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from '@prisma/client';
import { RequestWithUser } from 'src/common/interfaces/request.interface';
import { PaginatedResponse } from 'src/common/responses/paginatedResponse';
import { MessageDto } from './dto/message.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('messages')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('upload')
  @Roles(Role.PATIENT)
  @UseInterceptors(FileInterceptor('file'))
  async sendPhoto(@UploadedFile(
    new ParseFilePipeBuilder()
    .addMaxSizeValidator({
      maxSize: 5000
    })
    .addFileTypeValidator({
      fileType: 'jpeg'
    })
    .build({
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
    })
  ) photo: Express.Multer.File) {}

  @Get('patient')
  @Roles(Role.PATIENT)
  @HttpCode(HttpStatus.OK)
  async findPatientMessages(
    @Request() req: RequestWithUser,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('per-page', new DefaultValuePipe(10), ParseIntPipe)
    itemsPerPage: number,
  ): Promise<PaginatedResponse<MessageDto>> {
    try {
      const paginatedMessages = await this.messagesService.findUserMessages(
        req.user.nationalId,
        page,
        itemsPerPage,
      );
      return {
        items: paginatedMessages.items.map((message) => {
          return {
            ...message,
            owner: message.userId === req.user.nationalId ? true : false,
          };
        }),
        meta: paginatedMessages.meta,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get('conversation/:id/nurse')
  @Roles(Role.NURSE)
  @HttpCode(HttpStatus.OK)
  async findNurseMessages(
    @Request() req: RequestWithUser,
    @Param('id', ParseIntPipe) conversationId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('per-page', new DefaultValuePipe(10), ParseIntPipe)
    itemsPerPage: number,
  ): Promise<PaginatedResponse<MessageDto>> {
    try {
      const paginatedMessages =
        await this.messagesService.findNurseMessagesByConversationId(
          conversationId,
          req.user.nationalId,
          page,
          itemsPerPage,
        );
      return {
        items: paginatedMessages.items.map((message) => {
          return {
            ...message,
            owner: message.userId === req.user.nationalId ? true : false,
          };
        }),
        meta: paginatedMessages.meta,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get('conversation/:id/user')
  @Roles(Role.DOCTOR, Role.PATIENT)
  @HttpCode(HttpStatus.OK)
  async findUserMessages(
    @Request() req: RequestWithUser,
    @Param('id', ParseIntPipe) conversationId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('per-page', new DefaultValuePipe(10), ParseIntPipe)
    itemsPerPage: number,
  ): Promise<PaginatedResponse<MessageDto>> {
    try {
      const paginatedMessages =
        await this.messagesService.findUserMessagesByConversationId(
          conversationId,
          req.user.nationalId,
          page,
          itemsPerPage,
        );
      return {
        items: paginatedMessages.items.map((message) => {
          return {
            ...message,
            owner: message.userId === req.user.nationalId ? true : false,
          };
        }),
        meta: paginatedMessages.meta,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
