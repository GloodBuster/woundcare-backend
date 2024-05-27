import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { OnModuleInit } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

interface Message {
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
export class ChatGateway implements OnModuleInit {
  constructor(private readonly chatService: ChatService){}

  @WebSocketServer()
  public server: Server


  onModuleInit() {
    this.server.on("connection", (socket : Socket) => {
      const {name, token} = socket.handshake.auth

      if(!token){
        socket.disconnect()
        return;
      }

      console.log(`token: ${token}`)

      socket.on("disconnect", () => {
        console.log("cliente desconectado")
      })
    })
  }

  @SubscribeMessage("send-message")
  handleMessage(
    @MessageBody() message: Message,
    @ConnectedSocket() client: Socket
  ) {
    const {token} = client.handshake.auth

    console.log(`conversation id: ${message.conversationId}, message: ${message.text}`)
    if (!message) {
      return
    }

    this.server.emit("on-message",
    {
      userId: client.id,
      message: message,
    })
  }
}
