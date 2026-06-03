import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MongoFlowReadRepository } from '../../../../../src/infrastructure/persistence/mongo/repositories/MongoFlowReadRepository';

import { FlowModel } from '../../../../../src/infrastructure/persistence/mongo/models/FlowModel';

vi.mock('../../../../../src/infrastructure/persistence/mongo/models/FlowModel', () => ({
  FlowModel: {
    find: vi.fn(),
    findOne: vi.fn(),
  },
}));

describe('MongoFlowReadRepository', () => {
  let repository: MongoFlowReadRepository;

  beforeEach(() => {
    repository = new MongoFlowReadRepository();
    vi.clearAllMocks();
  });

  const flowMock = {
    flowId: 'flow-1',
    instanceId: 'instance-1',
    version: 1,
    name: 'Welcome Flow',
    start: 'start-node',
    nodes: {},
    triggers: ['hello'],
    isActive: true,
  };

  describe('findActiveByInstance', () => {
    it('should return active flows', async () => {
      const flows = [flowMock];

      vi.mocked(FlowModel.find).mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(flows),
        }),
      } as any);

      const result = await repository.findActiveByInstance('instance-1');

      expect(result).toEqual(flows);

      expect(FlowModel.find).toHaveBeenCalledWith({
        instanceId: 'instance-1',
        isActive: true,
      });
    });

    it('should return empty array when no active flows exist', async () => {
      vi.mocked(FlowModel.find).mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      const result = await repository.findActiveByInstance('instance-1');

      expect(result).toEqual([]);
    });

    it('should propagate mongo errors', async () => {
      vi.mocked(FlowModel.find).mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockRejectedValue(new Error('mongo error')),
        }),
      } as any);

      await expect(repository.findActiveByInstance('instance-1')).rejects.toThrow('mongo error');
    });
  });

  describe('findByInstance', () => {
    it('should return flows sorted by createdAt desc', async () => {
      const sortMock = vi.fn().mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue([flowMock]),
        }),
      });

      vi.mocked(FlowModel.find).mockReturnValue({
        sort: sortMock,
      } as any);

      const result = await repository.findByInstance('instance-1');

      expect(result).toEqual([flowMock]);

      expect(FlowModel.find).toHaveBeenCalledWith({
        instanceId: 'instance-1',
      });

      expect(sortMock).toHaveBeenCalledWith({
        createdAt: -1,
      });
    });

    it('should return empty array', async () => {
      vi.mocked(FlowModel.find).mockReturnValue({
        sort: vi.fn().mockReturnValue({
          lean: vi.fn().mockReturnValue({
            exec: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      const result = await repository.findByInstance('instance-1');

      expect(result).toEqual([]);
    });

    it('should propagate mongo errors', async () => {
      vi.mocked(FlowModel.find).mockReturnValue({
        sort: vi.fn().mockReturnValue({
          lean: vi.fn().mockReturnValue({
            exec: vi.fn().mockRejectedValue(new Error('mongo error')),
          }),
        }),
      } as any);

      await expect(repository.findByInstance('instance-1')).rejects.toThrow('mongo error');
    });
  });

  describe('findById', () => {
    it('should return flow when found', async () => {
      vi.mocked(FlowModel.findOne).mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(flowMock),
        }),
      } as any);

      const result = await repository.findById('flow-1');

      expect(result).toEqual(flowMock);

      expect(FlowModel.findOne).toHaveBeenCalledWith({
        flowId: 'flow-1',
      });
    });

    it('should return null when flow does not exist', async () => {
      vi.mocked(FlowModel.findOne).mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(null),
        }),
      } as any);

      const result = await repository.findById('missing');

      expect(result).toBeNull();
    });

    it('should propagate mongo errors', async () => {
      vi.mocked(FlowModel.findOne).mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockRejectedValue(new Error('mongo error')),
        }),
      } as any);

      await expect(repository.findById('flow-1')).rejects.toThrow('mongo error');
    });
  });
});
