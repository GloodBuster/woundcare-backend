import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { ConversationsModule } from 'src/conversations/conversations.module';
import { MessagesModule } from 'src/messages/messages.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { WebSocketExceptionFilter } from 'src/common/errors/ws-exception.filter';

@Module({
  imports:[AuthModule, ConversationsModule, MessagesModule, PrismaModule],
  providers: [ChatGateway, ChatService, WebSocketExceptionFilter],
  exports:[ChatService],
})
export class ChatModule {}
