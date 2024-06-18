import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket, OnGatewayInit, WsException } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { ForbiddenException, NotFoundException, UnauthorizedException, UseFilters, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { NotFoundError } from 'src/common/errors/service.error';
import { WebSocketExceptionFilter } from 'src/common/errors/ws-exception.filter';

export interface Message {
  conversationId: number,
  text: string
}
@WebSocketGateway({
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },
})
@UseFilters(new WebSocketExceptionFilter())
export class ChatGateway implements OnGatewayInit {
  constructor(
    private readonly chatService: ChatService,
    private readonly authService: AuthService
  ){}

  @WebSocketServer()
  public server: Server


  afterInit() {
      this.server.on("connection", async (socket : Socket) => {
        try {
  
          const token = socket?.handshake?.headers?.authorization || socket?.handshake?.auth?.token
          const user = await this.authService.verifyToken(token)
    //
          if(!user){
            this.disconnect(socket, 'unauthorized')
            return;
          }
          const room = await this.chatService.handleRoom(user.nationalId)

          if(room?.length === 0) {
            this.disconnect(socket, 'you dont belong to a room')
            return;
          }
  
          room?.forEach(room => socket.join(`room-${room}`))
    
          socket.on("disconnect", () => {
          })
        } catch (error) {
          this.disconnect(socket, error.message)
        }
      })
  }

  @SubscribeMessage("send-message")
  async handleSending(
    @MessageBody() message: Message,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const token = client?.handshake?.headers?.authorization || client?.handshake?.auth?.token
  
      const user = await this.authService.verifyToken(token)
  
      if(!user){
        this.disconnect(client, 'Unauthorized')
        return
      }
      
      if (!message) {
        this.disconnect(client, "there is no message")
        return
      }

      const payload = await this.chatService.sendMessage(client, user.nationalId, message)

      this.server.to(`room-${payload.message.conversationId}`).emit("on-message", payload )


    } catch (error) {
      this.disconnect(client, error.message)
    }
  }

  private disconnect(socket: Socket, message: string) {
    socket.emit('error', new UnauthorizedException(message))
    socket.disconnect()
  }

  @SubscribeMessage("message")
  async handleMessage() {}
}
