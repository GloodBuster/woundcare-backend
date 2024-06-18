import { Injectable } from '@nestjs/common';
import { PaginatedResponse } from 'src/common/responses/paginatedResponse';
import { Message } from './entities/message.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotFoundError, UnexpectedError } from 'src/common/errors/service.error';
import { CreateMessageDto } from './dto/create-message.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class MessagesService {
  constructor(private readonly prismaService: PrismaService) {}
  async findUserMessages(
    nationalId: string,
    page: number,
    itemsPerPage: number,
  ): Promise<PaginatedResponse<Message>> {
    try {
      const messages = await this.prismaService.message.findMany({
        where: {
          Conversation: {
            medicalFile: { patientId: nationalId, dischargeDate: null },
          },
        },
        take: itemsPerPage,
        skip: (page - 1) * itemsPerPage,
        orderBy: { createdAt: 'desc' },
      });
      const totalItems = await this.prismaService.message.count({
        where: { Conversation: { medicalFile: { patientId: nationalId } } },
      });
      return {
        items: messages,
        meta: {
          totalItems,
          totalPages: Math.ceil(totalItems / itemsPerPage),
          page,
          itemsPerPage,
        },
      };
    } catch (error) {
      throw new UnexpectedError('An unexpected situation ocurred', {
        cause: error,
      });
    }
  }

  async findNurseMessagesByConversationId(
    conversationId: number,
    nurseId: string,
    page: number,
    itemsPerPage: number,
  ): Promise<PaginatedResponse<Message>> {
    try {
      const messages = await this.prismaService.message.findMany({
        where: { conversationId, Conversation: { nurseId } },
        take: itemsPerPage,
        skip: (page - 1) * itemsPerPage,
        orderBy: { createdAt: 'desc' },
      });
      const totalItems = await this.prismaService.message.count({
        where: { conversationId, Conversation: { nurseId } },
      });
      return {
        items: messages,
        meta: {
          totalItems,
          totalPages: Math.ceil(totalItems / itemsPerPage),
          page,
          itemsPerPage,
        },
      };
    } catch (error) {
      throw new UnexpectedError('An unexpected situation ocurred', {
        cause: error,
      });
    }
  }

  async findUserMessagesByConversationId(
    conversationId: number,
    userId: string,
    page: number,
    itemsPerPage: number,
  ): Promise<PaginatedResponse<Message>> {
    try {
      const messages = await this.prismaService.message.findMany({
        where: { conversationId, Conversation: { userId } },
        take: itemsPerPage,
        skip: (page - 1) * itemsPerPage,
        orderBy: { createdAt: 'desc' },
      });
      const totalItems = await this.prismaService.message.count({
        where: { conversationId, Conversation: { userId } },
      });
      return {
        items: messages,
        meta: {
          totalItems,
          totalPages: Math.ceil(totalItems / itemsPerPage),
          page,
          itemsPerPage,
        },
      };
    } catch (error) {
      throw new UnexpectedError('An unexpected situation ocurred', {
        cause: error,
      });
    }
  }

  async create(createMessageDto: CreateMessageDto) {
    try {
      return this.prismaService.message.create({
        data: {
          conversationId: Number(createMessageDto.conversationId),
          userId: createMessageDto.userId,
          image: createMessageDto.image
        }
      })
    } catch (error) {
      if(error instanceof PrismaClientKnownRequestError){
        if(error.code === "P2025"){
          throw new NotFoundError(error.message)
        }
      }
      throw new UnexpectedError('An unexpected situation ocurred', {
        cause: error,
      })
    }
  }
}
