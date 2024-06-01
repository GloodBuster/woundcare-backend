import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Socket } from 'socket.io';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { NotFoundError, UnexpectedError } from 'src/common/errors/service.error';

@Injectable()
export class ChatService {

  constructor(
    private readonly prismaService: PrismaService
  ) {}

  async handleRoom(nationalId: string) {
    try {
      const conversation = await this.prismaService.conversation.findFirstOrThrow({
        where: {
          OR: [
            { medicalFile: 
              { patientId: nationalId, 
                dischargeDate: null 
              } 
            },
            { medicalFile:
              { doctorId: nationalId,
                dischargeDate: null
              }
            },
            {medicalFile: {
              nurseId: nationalId,
              dischargeDate: null
              }}
          ]},
      })
  
      return conversation.id
    } catch (error) {
      if(error instanceof PrismaClientKnownRequestError){
        if(error.code === 'P2025'){
          throw new NotFoundError("You don't belong to a room");
        }
        throw new UnexpectedError("An unexpected situation happened")
      }
    }
  }

  async sendMessage(socket: Socket, senderId: string, content: string) {
    const conversation = await this.handleRoom(senderId)

    if(!conversation){
      throw new ForbiddenException("You cannot send a message because you don't belong to a conversation")
    }

    const message = await this.prismaService.message.create({
      data: {
        conversationId: conversation,
        userId: senderId,
        text: content,
      }
    })

    socket.to(`room-${conversation}`).emit("new-message", message)

    return {message}
  }

  async handleMessage(socket: Socket) {
    socket.on("new-message", async (message) => {
      try {
        //TODO: llamen
      } catch (error) {
        
      }
    })
  }
}
