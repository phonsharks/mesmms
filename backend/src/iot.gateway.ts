import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: true,
  namespace: '/api',
})
export class IoTGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
    const logMessage = {
      type: 'connection',
      message: `Client connected: ${client.id}`,
      timestamp: new Date().toISOString(),
      clientId: client.id,
    };
    client.emit('handshake', { message: 'Bağlantı başarılı', clientId: client.id });
    this.server.emit('system-log', logMessage);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
    const logMessage = {
      type: 'disconnection',
      message: `Client disconnected: ${client.id}`,
      timestamp: new Date().toISOString(),
      clientId: client.id,
    };
    this.server.emit('system-log', logMessage);
  }

  @SubscribeMessage('ping')
  handlePing(@MessageBody() data: unknown, @ConnectedSocket() client: Socket) {
    const logMessage = {
      type: 'ping',
      message: 'Ping received from client',
      timestamp: new Date().toISOString(),
      clientId: client.id,
      data,
    };
    client.emit('pong', { message: 'pong', data });
    this.server.emit('system-log', logMessage);
  }
}
