import { Injectable } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  NotFoundError,
  UnexpectedError,
} from 'src/common/errors/service.error';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Conversation } from './entities/conversation.entity';

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
                }
              },
              doctor: {
                select: {
                  genre: true,
                }
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
}
