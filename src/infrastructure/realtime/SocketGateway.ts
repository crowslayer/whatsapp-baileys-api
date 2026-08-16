import { Server as HttpServer } from 'http';

import { Server, Socket } from 'socket.io';

import { IConnectionEventBus } from '@application/events/IConnectionEventBus';

import { ILogger } from '@infrastructure/loggers/Logger';
import { ISocketAuthenticator } from '@infrastructure/realtime/SocketAuthenticator';

import { UnauthorizedError } from '@shared/infrastructure/errors/UnauthorizedError';

export interface ISocketUser {
  userId: string;
  tenantId?: string;
}

interface ISubscribeInstancePayload {
  type: 'instance';
  instanceId: string;
}

interface ISubscribeCampaignPayload {
  type: 'campaign';
  campaignId: string;
}

type SubscribePayload = ISubscribeInstancePayload | ISubscribeCampaignPayload;

interface ISubscribeSuccess {
  success: true;
  room: string;
}

interface ISubscribeFailure {
  success: false;
  error: 'UNAUTHORIZED' | 'FORBIDDEN' | 'INVALID_PAYLOAD' | 'RATE_LIMITED' | 'ROOM_LIMIT_REACHED';
}

type SubscribeAck = (response: ISubscribeSuccess | ISubscribeFailure) => void;

interface IInstanceEvent {
  instanceId: string;
  [key: string]: unknown;
}

interface ICampaignProgressEvent {
  campaignId: string;
  [key: string]: unknown;
}
// eslint-disable-next-line
interface IAuthenticatedSocket extends Socket<
  IClientToServerEvents,
  IServerToClientEvents,
  InterServerEvents,
  ISocketData
> {}

interface IClientToServerEvents {
  subscribe: (payload: SubscribePayload, ack?: SubscribeAck) => void;
}

interface IServerToClientEvents {
  qr: (data: IInstanceEvent) => void;
  connected: (data: IInstanceEvent) => void;
  disconnected: (data: IInstanceEvent) => void;
  pairingCode: (data: IInstanceEvent) => void;
  // eslint-disable-next-line
  'campaign:progress': (data: ICampaignProgressEvent) => void;
}
// eslint-disable-next-line
interface InterServerEvents {}

interface ISocketData {
  user: ISocketUser;
  connectedAt: number;
  subscriptions: Set<string>;
}

export class SocketGateway {
  private _io: Server<IClientToServerEvents, IServerToClientEvents, InterServerEvents, ISocketData>;

  private _initialized = false;

  private readonly _allowedOrigins: ReadonlySet<string>;

  private readonly _subscribeWindowMs = 60_000;

  private readonly _maxSubscriptionsPerWindow = 30;

  private readonly _maxRoomsPerSocket = 20;

  private readonly _subscribeCounters = new Map<
    string,
    {
      count: number;
      resetAt: number;
    }
  >();

  constructor(
    server: HttpServer,
    private readonly eventBus: IConnectionEventBus,
    private readonly authenticator: ISocketAuthenticator,
    // private readonly authorization: IRealtimeAuthorization,
    private readonly logger: ILogger,
    allowedOrigins: readonly string[]
  ) {
    this._allowedOrigins = new Set(allowedOrigins.map((origin) => origin.trim()).filter(Boolean));

    this._io = new Server<
      IClientToServerEvents,
      IServerToClientEvents,
      InterServerEvents,
      ISocketData
    >(server, {
      cors: {
        origin: [...this._allowedOrigins],
        methods: ['GET'],
        credentials: true,
      },
      allowRequest: (req, callback) => {
        const origin = req.headers.origin;

        if (!origin) {
          callback(null, true);
          return;
        }
        const allowed = this._allowedOrigins.has(origin);

        if (!allowed) {
          this.logger.warn('Reject Socket connection');
        }

        callback(null, allowed);
      },
      maxHttpBufferSize: 64 * 1024,
      perMessageDeflate: false,
      serveClient: false,
      transports: ['websocket', 'polling'],
    });
  }

  init(): void {
    // this._io.on('connection', (socket) => {

    //   // socket.on('subscribe', (instanceId: string) => {
    //   //   socket.join(instanceId);
    //   // prepare namespace
    //   socket.on('subscribe', (room: string) => {
    //     if (!room.startsWith('instance:') && !room.startsWith('campaign:')) return;
    //     socket.join(room);
    //     // });
    //   });
    //   socket.on('disconnect', () => {
    //     console.warn('Disconnected', socket.id);
    //   });
    // });
    // // Bridge EventBus → WebSocket
    // this.eventBus.on('qr', (data) => {
    //   // this._io.to(data.instanceId).emit('qr', data);
    //   this._io.to(`instance:${data.instanceId}`).emit('qr', data);
    // });
    // this.eventBus.on('connected', (data) => {
    //   // this._io.to(data.instanceId).emit('connected', data);
    //   this._io.to(`instance:${data.instanceId}`).emit('connected', data);
    // });
    // this.eventBus.on('disconnected', (data) => {
    //   // this._io.to(data.instanceId).emit('disconnected', data);
    //   this._io.to(`instance:${data.instanceId}`).emit('disconnected', data);
    // });
    // this.eventBus.on('pairingCode', (data) => {
    //   // this._io.to(data.instanceId).emit('pairingCode', data);
    //   this._io.to(`instance:${data.instanceId}`).emit('pairingCode', data);
    // });
    // this.eventBus.on('campaignProgress', (data) => {
    //   this._io.to(`campaign:${data.campaignId}`).emit('campaign:progress', data);
    // });
    if (this._initialized) return;

    this._initialized = true;

    this.registerAuthenticationMiddleware();
    this.registerConnectionHandler();
    this.registerEventBusHandlers();

    this.logger.info('Socket.IO gateway initialized');
  }

  private registerAuthenticationMiddleware(): void {
    this._io.use(async (socket, next) => {
      try {
        const token = this.extractToken(socket);

        if (!token) {
          this.logger.warn(`Socket authentication failed: missing token`);

          next(new UnauthorizedError('Unauthorized'));
          return;
        }

        const user = await this.authenticator.authenticate(token);

        socket.data.user = user;
        socket.data.connectedAt = Date.now();
        socket.data.subscriptions = new Set<string>();

        next();
      } catch (error) {
        this.logger.warn(`Socket authentication failed`, error);

        next(new UnauthorizedError('Unauthorized'));
      }
    });
  }

  private extractToken(socket: Socket): string | null {
    const authToken = socket.handshake.auth?.token;

    if (typeof authToken === 'string' && authToken.length > 0 && authToken.length <= 4096) {
      return authToken;
    }

    const authorizationHeader = socket.handshake.headers.authorization;

    if (typeof authorizationHeader === 'string' && authorizationHeader.startsWith('Bearer ')) {
      const token = authorizationHeader.slice(7).trim();

      if (token.length > 0 && token.length <= 4096) {
        return token;
      }
    }

    return null;
  }

  private registerConnectionHandler(): void {
    this._io.on('connection', (socket: IAuthenticatedSocket) => {
      const user = socket.data.user;

      this.logger.info(`Socket connected: socketId=${socket.id} userId=${user.userId}`);

      socket.on('subscribe', (payload, ack) => {
        void this.handleSubscribe(socket, payload, ack);
      });

      socket.on('disconnect', (reason) => {
        this.handleDisconnect(socket, reason);
      });
    });
  }

  // eslint-disable-next-line
  private async handleSubscribe(
    socket: IAuthenticatedSocket,
    payload: unknown,
    ack?: SubscribeAck
  ): Promise<void> {
    try {
      if (!this.consumeSubscribeRateLimit(socket)) {
        ack?.({
          success: false,
          error: 'RATE_LIMITED',
        });

        return;
      }

      if (!this.isValidSubscribePayload(payload)) {
        ack?.({
          success: false,
          error: 'INVALID_PAYLOAD',
        });

        return;
      }

      if (socket.data.subscriptions.size >= this._maxRoomsPerSocket) {
        ack?.({
          success: false,
          error: 'ROOM_LIMIT_REACHED',
        });

        return;
      }

      const user = socket.data.user;

      if (payload.type === 'instance') {
        const authorized = false; // await this.authorization.canSubscribeToInstance(
        //   user,
        //   payload.instanceId
        // );

        if (!authorized) {
          this.logger.warn(`Unauthorized instance subscription: userId=${user.userId}`);

          ack?.({
            success: false,
            error: 'FORBIDDEN',
          });

          return;
        }

        const room = this.instanceRoom(payload.instanceId);

        await socket.join(room);

        socket.data.subscriptions.add(room);

        ack?.({
          success: true,
          room,
        });

        return;
      }

      const authorized = false; // await this.authorization.canSubscribeToCampaign(user, payload.campaignId);

      if (!authorized) {
        this.logger.warn(`Unauthorized campaign subscription: userId=${user.userId}`);

        ack?.({
          success: false,
          error: 'FORBIDDEN',
        });

        return;
      }

      const room = this.campaignRoom(payload.campaignId);

      await socket.join(room);

      socket.data.subscriptions.add(room);

      ack?.({
        success: true,
        room,
      });
    } catch (error) {
      this.logger.error?.(error instanceof Error ? error : new Error('Socket subscription failed'));

      ack?.({
        success: false,
        error: 'FORBIDDEN',
      });
    }
  }

  private isValidSubscribePayload(payload: unknown): payload is SubscribePayload {
    if (typeof payload !== 'object' || payload === null) {
      return false;
    }

    const value = payload as Record<string, unknown>;

    if (value.type === 'instance') {
      return this.isValidIdentifier(value.instanceId);
    }

    if (value.type === 'campaign') {
      return this.isValidIdentifier(value.campaignId);
    }

    return false;
  }

  private isValidIdentifier(value: unknown): value is string {
    if (typeof value !== 'string') {
      return false;
    }

    if (value.length < 1 || value.length > 128) {
      return false;
    }

    return /^[0-9a-f]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
      value
    );
  }

  private consumeSubscribeRateLimit(socket: IAuthenticatedSocket): boolean {
    const key = socket.data.user?.userId ?? socket.id;

    const now = Date.now();

    let counter = this._subscribeCounters.get(key);

    if (!counter || counter.resetAt <= now) {
      counter = {
        count: 0,
        resetAt: now + this._subscribeWindowMs,
      };

      this._subscribeCounters.set(key, counter);
    }

    if (counter.count >= this._maxSubscriptionsPerWindow) {
      return false;
    }

    counter.count += 1;

    return true;
  }

  private registerEventBusHandlers(): void {
    this.eventBus.on('qr', (data: IInstanceEvent) => {
      if (!this.isValidInstanceEvent(data)) {
        return;
      }

      this._io.to(this.instanceRoom(data.instanceId)).emit('qr', data);
    });

    this.eventBus.on('connected', (data: IInstanceEvent) => {
      if (!this.isValidInstanceEvent(data)) {
        return;
      }

      this._io.to(this.instanceRoom(data.instanceId)).emit('connected', data);
    });

    this.eventBus.on('disconnected', (data: IInstanceEvent) => {
      if (!this.isValidInstanceEvent(data)) {
        return;
      }

      this._io.to(this.instanceRoom(data.instanceId)).emit('disconnected', data);
    });

    this.eventBus.on('pairingCode', (data: IInstanceEvent) => {
      if (!this.isValidInstanceEvent(data)) {
        return;
      }

      this._io.to(this.instanceRoom(data.instanceId)).emit('pairingCode', data);
    });
    // eslint-disable-next-line
    this.eventBus.on('campaignProgress', (data: ICampaignProgressEvent) => {
      if (!this.isValidCampaignEvent(data)) {
        return;
      }

      this._io.to(this.campaignRoom(data.campaignId)).emit('campaign:progress', data);
    });
  }

  private isValidInstanceEvent(data: unknown): data is IInstanceEvent {
    if (typeof data !== 'object' || data === null) {
      return false;
    }

    const instanceId = (data as Record<string, unknown>).instanceId;

    return this.isValidIdentifier(instanceId);
  }

  private isValidCampaignEvent(data: unknown): data is ICampaignProgressEvent {
    if (typeof data !== 'object' || data === null) {
      return false;
    }

    const campaignId = (data as Record<string, unknown>).campaignId;

    return this.isValidIdentifier(campaignId);
  }

  /**
   * Centralized room naming.
   *
   * Client never controls this.
   */
  private instanceRoom(instanceId: string): string {
    return `instance:${instanceId}`;
  }

  private campaignRoom(campaignId: string): string {
    return `campaign:${campaignId}`;
  }

  private handleDisconnect(socket: IAuthenticatedSocket, reason: string): void {
    const user = socket.data.user;

    this.logger.info(
      `Socket disconnected: socketId=${socket.id} userId=${user.userId} reason=${reason}`
    );

    socket.data.subscriptions.clear();

    this._subscribeCounters.delete(user.userId);
  }

  close(): void {
    if (!this._initialized) return;
    this._initialized = false;

    this._subscribeCounters.clear();

    this._io.close();

    this.logger.info('Socket.IO gateway cloased');
  }
}
