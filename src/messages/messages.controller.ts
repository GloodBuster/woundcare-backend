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
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';
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
import * as fs from "fs"
import type {Response} from "express"

@ApiTags('messages')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get(":name")
  @Roles(Role.ADMIN, Role.PATIENT, Role.NURSE)
  @ApiResponse({type: Buffer})
  async serveImage(@Param("name") name: string, @Res() response: Response){
    const stat = await new Promise<fs.Stats>((resolve, reject) => {
      fs.stat(name, (err, stat) => {
        if (err) {
          reject(err);
        } else {
          resolve(stat);
        }
      });
    });

    console.log(process.cwd())

    response.set({
      'Content-Disposition': `attachment; filename="${name}"`,
      'Content-Type': 'application/octet-stream',
      'Content-Length': stat.size
    })
    
    const readStream = fs.createReadStream(join(process.cwd(), name));

    return readStream.pipe(response)
  }

  @Post('upload')
  @ApiConsumes("multipart/form-data")
  @Roles(Role.PATIENT, Role.ADMIN)
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: "./photos",
      filename: (_request, file, callback) => {
        callback(null, `${Date.now()}-${file.originalname}`)
      }
    }),
  }))
  @ApiBody({
    required: true,
    type: "multipart/form-data",
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
        createMessageDto: {
          type: "object",
          properties: {
            conversationId: {
              type: "number",
            },
            userId: {
              type: "string",
            }
          }
        }
      },
    },
  })
  async sendPhoto(@UploadedFile(
    new ParseFilePipeBuilder()
    .addMaxSizeValidator({
      maxSize: 500000
    })
    .addFileTypeValidator({
      fileType: 'image/png'
    })
    .build({
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
    })
  ) photo: Express.Multer.File, @Body() createMessageDto: CreateMessageDto) {
    try {
      
      if(!photo){
        throw new UnprocessableEntityException("che aca no hay nada")
      }
      console.log(photo)
  
      await this.messagesService.create({
        image: photo.path,
        conversationId: createMessageDto.conversationId,
        userId: createMessageDto.userId,
      })
    } catch (error) {
      if(error instanceof NotFoundError){
        throw new BadRequestException(error.message)
      }
      throw new InternalServerErrorException(error.message)
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
}
