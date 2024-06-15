import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Socket } from 'socket.io';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { NotFoundError, UnexpectedError } from 'src/common/errors/service.error';
import { WsException } from '@nestjs/websockets';
import { Message } from './chat.gateway';

@Injectable()
export class ChatService {

  constructor(
    private readonly prismaService: PrismaService
  ) {}

  async handleRoom(nationalId: string) {
    try {
      const conversation = await this.prismaService.conversation.findMany({
        where: {
          OR: [
            { 
              nurseId: nationalId,
              medicalFile: {
                dischargeDate: null
              }
             },
            { 
              userId: nationalId, 
              medicalFile: {
                dischargeDate: null
              }
            }
          ]
        },
      })

      if(!conversation) {
        throw new NotFoundError('Conversation not found');
      }
  
      return conversation.map(e => e.id)
    } catch (error) {
      if(error instanceof PrismaClientKnownRequestError){
        if(error.code === 'P2025'){
          throw new WsException("You don't belong to a room");
        }
        throw new UnexpectedError("An unexpected situation happened")
      }
    }
  }

  async sendMessage(socket: Socket, senderId: string, payload: Message) {
    const conversation = await this.handleRoom(senderId)

    if(!(conversation?.includes(payload.conversationId))) {
      throw new ForbiddenException("You cannot send a message because you don't belong to this conversation")
    }

    const message = await this.prismaService.message.create({
      data: {
        conversationId: payload.conversationId,
        userId: senderId,
        text: payload.text,
      }
    })

    socket.to(`room-${payload.conversationId}`).emit("new-message", message)

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
