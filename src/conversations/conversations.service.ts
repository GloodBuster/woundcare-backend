import { Injectable, NotAcceptableException } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  NotFoundError,
  UnexpectedError,
} from 'src/common/errors/service.error';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Conversation } from './entities/conversation.entity';
import { Role } from '@prisma/client';
import { PaginatedResponse } from 'src/common/responses/paginatedResponse';
import { ConversationDto, ConversationQuery } from './dto/conversation.dto';

@Injectable()
export class ConversationsService {
  constructor(private readonly prismaService: PrismaService) {}

  async findOneByNationalId(nationalId: string): Promise<Conversation | null> {
    try {
      return await this.prismaService.conversation.findFirst({
        where: {
          medicalFile: {
            patientId: nationalId,
            dischargeDate: null,
          },
        },
        include: {
          user: {
            select: {
              fullname: true,
              role: true,
              patient: {
                select: {
                  genre: true,
                },
              },
              doctor: {
                select: {
                  genre: true,
                },
              },
            },
          },
          nurse: {
            select: {
              genre: true,
              user: {
                select: {
                  fullname: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      throw new UnexpectedError('An unexpected situation ocurred', {
        cause: error,
      });
    }
  }

  async findNurseConversations(
    conversationId: number,
    nurseId: string,
  ): Promise<Conversation | null> {
    try {
      return await this.prismaService.conversation.findFirst({
        where: {
          id: conversationId,
          nurseId,
        },
        include: {
          user: {
            select: {
              fullname: true,
              role: true,
              patient: {
                select: {
                  genre: true,
                },
              },
              doctor: {
                select: {
                  genre: true,
                },
              },
            },
          },
          nurse: {
            select: {
              genre: true,
              user: {
                select: {
                  fullname: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      throw new UnexpectedError('An unexpected situation ocurred', {
        cause: error,
      });
    }
  }

  async findNurseConversationsWithPatients(
    nurseId: string,
    page: number,
    itemsPerPage: number,
  ): Promise<PaginatedResponse<ConversationDto>> {
    try {
      const conversations = await this.prismaService.$queryRaw<
        ConversationQuery[]
      >`
        SELECT c.*, u."fullname" as userFullname, sub.lastMessageDate, sub.lastMessageContent
        FROM "Conversation" c
        INNER JOIN "User" u ON c."userId" = u."nationalId"
        LEFT JOIN (
          SELECT m."conversationId", MAX(m."createdAt") as lastMessageDate, m2."text" as lastMessageContent
          FROM "Message" m
          LEFT JOIN "Message" m2 ON m."conversationId" = m2."conversationId" AND m2."createdAt" = (
            SELECT MAX(m."createdAt")
            FROM "Message" m
            WHERE m."conversationId" = m2."conversationId"
          )
          GROUP BY m."conversationId", m2."text"
        ) sub ON c."id" = sub."conversationId"
        WHERE c."nurseId" = ${nurseId} AND u."role" = 'PATIENT'
        GROUP BY c."id", sub.lastMessageContent, u."fullname", sub.lastMessageDate
        ORDER BY CASE WHEN sub.lastMessageDate IS NULL THEN 0 ELSE 1 END, sub.lastMessageDate DESC
        LIMIT ${itemsPerPage} OFFSET ${itemsPerPage * (page - 1)}
      `;
      const totalItems = await this.prismaService.conversation.count({
        where: {
          user: {
            role: Role.PATIENT,
          },
        },
      });

      const conversationItems: ConversationDto[] = conversations.map(
        (conversation) => {
          return {
            id: conversation.id,
            lastMessageDate: conversation.lastmessagedate,
            lastMessageText: conversation.lastmessagecontent,
            medicalFileId: conversation.medicalFileId,
            nurseId: conversation.nurseId,
            user: {
              fullname: conversation.userfullname,
            },
            userId: conversation.userId,
          };
        },
      );

      return {
        items: conversationItems,
        meta: {
          itemsPerPage,
          page,
          totalItems,
          totalPages: Math.ceil(totalItems / itemsPerPage),
        },
      };
    } catch (error) {
      throw new UnexpectedError('An unexpected situation ocurred', {
        cause: error,
      });
    }
  }

  async findNurseConversationsWithDoctors(
    nurseId: string,
    page: number,
    itemsPerPage: number,
  ): Promise<PaginatedResponse<ConversationDto>> {
    try {
      const conversations = await this.prismaService.$queryRaw<
        ConversationQuery[]
      >`
        SELECT c.*, u."fullname" as userFullname, sub.lastMessageDate, sub.lastMessageContent
        FROM "Conversation" c
        INNER JOIN "User" u ON c."userId" = u."nationalId"
        LEFT JOIN (
          SELECT m."conversationId", MAX(m."createdAt") as lastMessageDate, m2."text" as lastMessageContent
          FROM "Message" m
          LEFT JOIN "Message" m2 ON m."conversationId" = m2."conversationId" AND m2."createdAt" = (
            SELECT MAX(m."createdAt")
            FROM "Message" m
            WHERE m."conversationId" = m2."conversationId"
          )
          GROUP BY m."conversationId", m2."text"
        ) sub ON c."id" = sub."conversationId"
        WHERE c."nurseId" = ${nurseId} AND u."role" = 'DOCTOR'
        GROUP BY c."id", sub.lastMessageContent, u."fullname", sub.lastMessageDate
        ORDER BY CASE WHEN sub.lastMessageDate IS NULL THEN 0 ELSE 1 END, sub.lastMessageDate DESC
        LIMIT ${itemsPerPage} OFFSET ${itemsPerPage * (page - 1)}
      `;
      const totalItems = await this.prismaService.conversation.count({
        where: {
          user: {
            role: Role.DOCTOR,
          },
        },
      });

      const conversationItems: ConversationDto[] = conversations.map(
        (conversation) => {
          return {
            id: conversation.id,
            lastMessageDate: conversation.lastmessagedate,
            lastMessageText: conversation.lastmessagecontent,
            medicalFileId: conversation.medicalFileId,
            nurseId: conversation.nurseId,
            user: {
              fullname: conversation.userfullname,
            },
            userId: conversation.userId,
          };
        },
      );

      return {
        items: conversationItems,
        meta: {
          itemsPerPage,
          page,
          totalItems,
          totalPages: Math.ceil(totalItems / itemsPerPage),
        },
      };
    } catch (error) {
      console.log(error);
      throw new UnexpectedError('An unexpected situation ocurred', {
        cause: error,
      });
    }
  }

  async create(createConversationDto: CreateConversationDto) {
    try {
      const user = await this.prismaService.user.findUniqueOrThrow({
        where: {
          nationalId: createConversationDto.userId,
        },
      });

      if (!(user.role === Role.DOCTOR) && !(user.role === Role.PATIENT)) {
        throw new NotAcceptableException(
          'The conversation cannot be between nurses',
        );
      }

      const nurse = await this.prismaService.nurse.findUniqueOrThrow({
        where: {
          nationalId: createConversationDto.nurseId,
        },
      });

      const medicalFile =
        await this.prismaService.medicalFile.findUniqueOrThrow({
          where: {
            id: createConversationDto.medicalFileId,
          },
        });

      const conversation = await this.prismaService.conversation.create({
        data: {
          userId: createConversationDto.userId,
          nurseId: createConversationDto.nurseId,
          medicalFileId: createConversationDto.medicalFileId,
        },
      });

      return conversation;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundError("There is a resource that doesn't exists", {
            cause: error,
          });
        }
      }
      throw new UnexpectedError('An unexpected situation has ocurred', {
        cause: error,
      });
    }
  }
}
