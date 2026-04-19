import EventEmitter from 'events';

import { ConnectionEvents, IConnectionEventBus } from '@application/events/IConnectionEventBus';

export class NodeEventBus implements IConnectionEventBus {
  private _emitter = new EventEmitter();

  emit<T extends keyof ConnectionEvents>(event: T, payload: ConnectionEvents[T]): void {
    this._emitter.emit(event, payload);
  }

  on<T extends keyof ConnectionEvents>(
    event: T,
    handler: (payload: ConnectionEvents[T]) => void
  ): void {
    this._emitter.on(event, handler);
  }
}
