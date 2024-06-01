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

  async create(createConversationDto: CreateConversationDto) {
    try {
      const user = await this.prismaService.user.findUniqueOrThrow({
        where: {
          nationalId: createConversationDto.userId
        }
      })

      if(!(user.role === Role.DOCTOR) && !(user.role === Role.PATIENT)){
        throw new NotAcceptableException("The conversation cannot be between nurses")
      }

      const nurse = await this.prismaService.nurse.findUniqueOrThrow({
        where: {
          nationalId: createConversationDto.nurseId
        }
      })

      const medicalFile = await this.prismaService.medicalFile.findUniqueOrThrow({
        where: {
          id: createConversationDto.medicalFileId
        }
      })

      const conversation = await this.prismaService.conversation.create({
        data: {
          userId: createConversationDto.userId,
          nurseId: createConversationDto.nurseId,
          medicalFileId: createConversationDto.medicalFileId,
        }
      })

      return conversation

    } catch (error) {
      if(error instanceof PrismaClientKnownRequestError){
        if(error.code === "P2025"){
          throw new NotFoundError("There is a resource that doesn't exists", {cause: error})
        }
      }
      throw new UnexpectedError("An unexpected situation has ocurred", {cause: error})
    }
  }
}
