import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket, OnGatewayInit, WsException } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { ForbiddenException, NotFoundException, UseFilters, UseGuards } from '@nestjs/common';
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
  public inc = 4


  afterInit() {
    try {
      this.server.on("connection", async (socket : Socket) => {

        console.log(socket.handshake.auth.token, socket.handshake.headers.authorization)
        const token = socket?.handshake?.headers?.authorization || socket?.handshake?.auth?.token
        const user = await this.authService.verifyToken(token)
  //
        if(!user){
          socket.disconnect()
          return
        }
        const room = await this.chatService.handleRoom(user.nationalId)

        room?.forEach(room => socket.join(`room-${room}`))
  
        console.log(`user connected: ${user.fullname}`)
  
        socket.on("disconnect", () => {
          console.log("cliente desconectado")
        })
      })
    } catch (error) {
      if(error instanceof NotFoundError){
        throw new WsException(error.message)
      }
      throw new WsException("a pedazos"+ error.message)
    }
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
        return
      }
      
      if (!message) {
        return
      }

      console.log(message)
  
      const payload = await this.chatService.sendMessage(client, user.nationalId, message)

      console.log(payload)
  
      this.server.to(`room-${payload.message.conversationId}`).emit("on-message", payload )


    } catch (error) {
      throw new WsException(error.message)
    }
  }

  @SubscribeMessage("message")
  async handleMessage() {}
}
