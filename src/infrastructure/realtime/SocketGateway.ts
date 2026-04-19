import { Server as HttpServer } from 'http';

import { Server } from 'socket.io';

import { IConnectionEventBus } from '@application/events/IConnectionEventBus';

export class SocketGateway {
  private _io: Server;

  constructor(
    server: HttpServer,
    private readonly eventBus: IConnectionEventBus
  ) {
    this._io = new Server(server, {
      cors: {
        origin: '*',
      },
    });
  }

  init(): void {
    this._io.on('connection', (socket) => {
      socket.on('subscribe', (instanceId: string) => {
        socket.join(instanceId);
      });

      socket.on('disconnect', () => {
        console.warn('Disconnected');
      });
    });

    // Bridge EventBus → WebSocket
    this.eventBus.on('qr', (data) => {
      this._io.to(data.instanceId).emit('qr', data);
    });

    this.eventBus.on('connected', (data) => {
      this._io.to(data.instanceId).emit('connected', data);
    });

    this.eventBus.on('disconnected', (data) => {
      this._io.to(data.instanceId).emit('disconnected', data);
    });
  }
}
