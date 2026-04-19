export type ConnectionEvents = {
  qr: {
    instanceId: string;
    qrCode: string;
    qrText: string;
  };
  connected: {
    instanceId: string;
    phone: string;
  };
  disconnected: {
    instanceId: string;
    reason?: string;
  };
};

export interface IConnectionEventBus {
  emit<T extends keyof ConnectionEvents>(event: T, payload: ConnectionEvents[T]): void;

  on<T extends keyof ConnectionEvents>(
    event: T,
    handler: (payload: ConnectionEvents[T]) => void
  ): void;
}
