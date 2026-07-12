import { describe, expect, vi } from 'vitest';
import { DisconnectInstanceCommand } from '../../../../src/application/instances/disconnect/DisconnectInstanceCommand';
import { DisconnectInstanceCommandHandler } from '../../../../src/application/instances/disconnect/DisconnectInstanceCommandHandler';

describe('DisconnectInstanceCommandHandler', () => {
  test('subscribedTo() returns DisconnectInstanceCommand', () => {
    const handler = new DisconnectInstanceCommandHandler({ execute: vi.fn() });
    expect(handler.subscribedTo()).toBe(DisconnectInstanceCommand);
  });

  test('handle calls disconnect.execute', async () => {
    const mockDisconnect = { execute: vi.fn() };
    const handler = new DisconnectInstanceCommandHandler(mockDisconnect);

    const command = new DisconnectInstanceCommand('inst-1');
    await handler.handle(command);

    expect(mockDisconnect.execute).toHaveBeenCalledWith(command);
  });
});
