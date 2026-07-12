import { describe, expect, vi } from 'vitest';
import { ConnectionEvents } from '../../../../src/application/events/IConnectionEventBus';
import { NodeEventBus } from '../../../../src/shared/infrastructure/event-bus/in-memory/NodeEventBus';

describe('NodeEventBus', () => {
  test('emit triggers registered on handler', () => {
    const bus = new NodeEventBus();
    const handler = vi.fn();
    bus.on('connected', handler);
    bus.emit('connected', { instanceId: 'inst-1', phone: '5215551234567' });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  test('emit passes payload to handler', () => {
    const bus = new NodeEventBus();
    const handler = vi.fn();
    const payload: ConnectionEvents['connected'] = { instanceId: 'inst-1', phone: '5215551234567' };
    bus.on('connected', handler);
    bus.emit('connected', payload);
    expect(handler).toHaveBeenCalledWith(payload);
  });

  test('multiple handlers can be registered for same event', () => {
    const bus = new NodeEventBus();
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    bus.on('connected', handler1);
    bus.on('connected', handler2);
    bus.emit('connected', { instanceId: 'inst-1', phone: '5215551234567' });
    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  test('on with different events do not interfere', () => {
    const bus = new NodeEventBus();
    const handler = vi.fn();
    bus.on('connected', handler);
    bus.emit('qr', { instanceId: 'inst-1', qrCode: 'code', qrText: 'text' });
    expect(handler).not.toHaveBeenCalled();
  });
});
