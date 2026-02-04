import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { MessagingService } from './messaging.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MessagingGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('MessagingGateway');

  constructor(private readonly messagingService: MessagingService) {}

  @SubscribeMessage('sendMessage')
  async handleSendMessage(client: Socket, payload: { receiverId: number; content: string }): Promise<void> {
    const senderId = client.handshake.query.userId as string;
    const message = await this.messagingService.sendMessage(parseInt(senderId, 10), payload.receiverId, payload.content);
    this.server.emit(`recMessage_${payload.receiverId}`, message);
    this.server.emit(`recMessage_${senderId}`, message);
  }

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }
}
