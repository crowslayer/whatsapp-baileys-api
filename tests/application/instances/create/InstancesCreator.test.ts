import { CreateInstanceCommand } from '../../../../src/application/instances/create/CreateInstanceCommand';
import { InstancesCreator } from '../../../../src/application/instances/create/InstancesCreator';

describe('InstancesCreator', () => {
  test('should throw when name already exists', async () => {
    const mockRepo = {
      findByName: vi.fn().mockResolvedValue({}),
      save: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      findAll: vi.fn(),
    };
    const mockRuntime = { start: vi.fn() };
    const creator = new InstancesCreator(mockRepo, mockRuntime);

    const command = new CreateInstanceCommand('Existing', 'http://webhook.test');
    await expect(creator.execute(command)).rejects.toThrow('already exists');
  });

  test('should create instance successfully', async () => {
    const mockRepo = {
      findByName: vi.fn().mockResolvedValue(null),
      save: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      findAll: vi.fn(),
    };
    const mockRuntime = { start: vi.fn() };
    const creator = new InstancesCreator(mockRepo, mockRuntime);

    const command = new CreateInstanceCommand('New Instance', 'http://webhook.test');
    const result = await creator.execute(command);
    expect(result).toBeDefined();
    expect(result.instanceId).toBeDefined();
    expect(mockRepo.save).toHaveBeenCalled();
    expect(mockRuntime.start).toHaveBeenCalledWith(result.instanceId);
  });
});
