import { describe, expect, vi } from 'vitest';
import { ConnectInstanceCommand } from '../../../../src/application/instances/connect/ConnectInstanceCommand';
import { InstancesConnect } from '../../../../src/application/instances/connect/InstancesConnect';

describe('InstancesConnect', () => {
  test('execute calls manager.start with instanceId', async () => {
    const mockManager = { start: vi.fn(), stop: vi.fn() };
    const connector = new InstancesConnect(mockManager);

    const command = new ConnectInstanceCommand('inst-1');
    await connector.execute(command);

    expect(mockManager.start).toHaveBeenCalledWith('inst-1');
  });

  test('execute with pairing code calls manager.start with instanceId and phoneNumber', async () => {
    const mockManager = { start: vi.fn(), stop: vi.fn() };
    const connector = new InstancesConnect(mockManager);

    const command = new ConnectInstanceCommand('inst-1', true, '5215512345678');
    await connector.execute(command);

    expect(mockManager.start).toHaveBeenCalledWith('inst-1', '5215512345678');
  });
});
