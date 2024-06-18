import {
  BadRequestException,
  Body,
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
  Res,
  StreamableFile,
  UnprocessableEntityException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from '@prisma/client';
import { RequestWithUser } from 'src/common/interfaces/request.interface';
import { PaginatedResponse } from 'src/common/responses/paginatedResponse';
import { MessageDto } from './dto/message.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateMessageDto } from './dto/create-message.dto';
import { diskStorage } from 'multer';
import { NotFoundError } from 'src/common/errors/service.error';
import { join } from 'path';
import * as fs from 'fs';
import type { Response } from 'express';
import { validate } from 'class-validator';

@ApiTags('messages')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('text')
  @Roles(Role.PATIENT, Role.DOCTOR, Role.NURSE)
  @HttpCode(HttpStatus.OK)
  async createMessage(
    @Request() req: RequestWithUser,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    try {
      return await this.messagesService.createTextMessage(
        {
          conversationId: createMessageDto.conversationId,
          text: createMessageDto.text,
        },
        req.user.nationalId,
      );
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @Roles(Role.PATIENT, Role.DOCTOR, Role.NURSE, Role.ADMIN)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './public/photos',
        filename: (_request, file, callback) => {
          callback(null, `${Date.now()}-${file.originalname}`);
        },
      }),
    }),
  )
  @ApiBody({
    required: true,
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        createMessageDto: {
          type: 'object',
          properties: {
            conversationId: {
              type: 'number',
            },
            userId: {
              type: 'string',
            },
          },
        },
      },
    },
  })
  async sendPhoto(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 1024 * 1024 * 10,
        })
        .addFileTypeValidator({
          fileType: 'image',
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    photo: Express.Multer.File,
    @Request() req: RequestWithUser,
    @Body(new ValidationPipe()) createMessageDto: CreateMessageDto,
  ) {
    try {
      const errors = await validate(createMessageDto);
      if (errors.length > 0) {
        throw new UnprocessableEntityException(errors);
      }
      if (!photo) {
        throw new UnprocessableEntityException('che aca no hay nada');
      }
      const conversationId = Number(createMessageDto.conversationId);
      if (isNaN(conversationId))
        throw new BadRequestException('The conversation id must be a number');
      return await this.messagesService.createImageMessage(
        {
          image: process.env.DOMAIN_URL + '/photos/' + photo.filename,
          conversationId: createMessageDto.conversationId,
        },
        req.user.nationalId,
      );
    } catch (error) {
      if (photo) {
        fs.unlinkSync(photo.path);
      }
      if (error instanceof BadRequestException) throw error;

      if (error instanceof NotFoundError) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

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
  @Get(':name')
  @Roles(Role.ADMIN, Role.PATIENT, Role.NURSE)
  @ApiResponse({ type: Buffer })
  async serveImage(@Param('name') name: string, @Res() response: Response) {
    const stat = await new Promise<fs.Stats>((resolve, reject) => {
      fs.stat(name, (err, stat) => {
        if (err) {
          reject(err);
        } else {
          resolve(stat);
        }
      });
    });

    response.set({
      'Content-Disposition': `attachment; filename="${name}"`,
      'Content-Type': 'application/octet-stream',
      'Content-Length': stat.size,
    });

    const readStream = fs.createReadStream(join(process.cwd(), name));

    return readStream.pipe(response);
  }
}
