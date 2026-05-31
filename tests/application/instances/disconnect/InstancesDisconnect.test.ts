import { DisconnectInstanceCommand } from '../../../../src/application/instances/disconnect/DisconnectInstanceCommand';
import { InstancesDisconnect } from '../../../../src/application/instances/disconnect/InstancesDisconnect';

describe('InstancesDisconnect', () => {
  test('execute calls manager.stop with instanceId', async () => {
    const mockManager = { stop: vi.fn(), start: vi.fn() };
    const disconnect = new InstancesDisconnect(mockManager);

    const command = new DisconnectInstanceCommand('inst-1');
    await disconnect.execute(command);

    expect(mockManager.stop).toHaveBeenCalledWith('inst-1');
  });
});
