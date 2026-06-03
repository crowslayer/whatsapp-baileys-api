import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MongoWhatsAppInstanceReadRepository } from '../../../../../src/infrastructure/persistence/mongo/repositories/MongoWhatsAppInstanceReadRepository';
import { InfrastructureError } from '../../../../../src/shared/infrastructure/errors/InfrastructureError';

import { WhatsAppInstanceModel } from '../../../../../src/infrastructure/persistence/mongo/models/WhatsAppInstanceModel';

vi.mock('../../../../../src/infrastructure/persistence/mongo/models/WhatsAppInstanceModel', () => ({
  WhatsAppInstanceModel: {
    findOne: vi.fn(),
    find: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

describe('MongoWhatsAppInstanceReadRepository', () => {
  let repository: MongoWhatsAppInstanceReadRepository;

  beforeEach(() => {
    repository = new MongoWhatsAppInstanceReadRepository();
    vi.clearAllMocks();
  });

  const projection = {
    instanceId: 'instance-1',
    name: 'Test Instance',
    status: 'CONNECTED',
    phoneNumber: '5219999999999',
    webhookUrl: 'https://webhook.test',
  };

  describe('findById', () => {
    it('should return projection when found', async () => {
      vi.mocked(WhatsAppInstanceModel.findOne).mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(projection),
        }),
      } as any);

      const result = await repository.findById('instance-1');

      expect(result).toEqual(projection);
      expect(WhatsAppInstanceModel.findOne).toHaveBeenCalledWith({
        instanceId: 'instance-1',
      });
    });

    it('should return null when document does not exist', async () => {
      vi.mocked(WhatsAppInstanceModel.findOne).mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(null),
        }),
      } as any);

      const result = await repository.findById('not-found');

      expect(result).toBeNull();
    });

    it('should throw InfrastructureError when query fails', async () => {
      vi.mocked(WhatsAppInstanceModel.findOne).mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockRejectedValue(new Error('mongo error')),
        }),
      } as any);

      await expect(repository.findById('instance-1')).rejects.toBeInstanceOf(InfrastructureError);
    });
  });

  describe('findByName', () => {
    it('should return projection when found', async () => {
      vi.mocked(WhatsAppInstanceModel.findOne).mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(projection),
        }),
      } as any);

      const result = await repository.findByName('Test Instance');

      expect(result).toEqual(projection);

      expect(WhatsAppInstanceModel.findOne).toHaveBeenCalledWith({
        name: 'Test Instance',
      });
    });

    it('should return null when document does not exist', async () => {
      vi.mocked(WhatsAppInstanceModel.findOne).mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(null),
        }),
      } as any);

      const result = await repository.findByName('unknown');

      expect(result).toBeNull();
    });

    it('should throw InfrastructureError when query fails', async () => {
      vi.mocked(WhatsAppInstanceModel.findOne).mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockRejectedValue(new Error('mongo error')),
        }),
      } as any);

      await expect(repository.findByName('test')).rejects.toBeInstanceOf(InfrastructureError);
    });
  });

  describe('findAll', () => {
    it('should return all projections', async () => {
      const projections = [projection, projection];

      vi.mocked(WhatsAppInstanceModel.find).mockReturnValue({
        sort: vi.fn().mockReturnValue({
          lean: vi.fn().mockReturnValue({
            exec: vi.fn().mockResolvedValue(projections),
          }),
        }),
      } as any);

      const result = await repository.findAll();

      expect(result).toEqual(projections);
    });

    it('should return empty array', async () => {
      vi.mocked(WhatsAppInstanceModel.find).mockReturnValue({
        sort: vi.fn().mockReturnValue({
          lean: vi.fn().mockReturnValue({
            exec: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });

    it('should sort by createdAt descending', async () => {
      const sortMock = vi.fn().mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue([]),
        }),
      });

      vi.mocked(WhatsAppInstanceModel.find).mockReturnValue({
        sort: sortMock,
      } as any);

      await repository.findAll();

      expect(sortMock).toHaveBeenCalledWith({
        createdAt: -1,
      });
    });

    it('should throw InfrastructureError when query fails', async () => {
      vi.mocked(WhatsAppInstanceModel.find).mockReturnValue({
        sort: vi.fn().mockReturnValue({
          lean: vi.fn().mockReturnValue({
            exec: vi.fn().mockRejectedValue(new Error('mongo error')),
          }),
        }),
      } as any);

      await expect(repository.findAll()).rejects.toBeInstanceOf(InfrastructureError);
    });
  });

  describe('exists', () => {
    it('should return true when instance exists', async () => {
      vi.mocked(WhatsAppInstanceModel.countDocuments).mockReturnValue({
        exec: vi.fn().mockResolvedValue(1),
      } as any);

      const result = await repository.exists('instance-1');

      expect(result).toBe(true);
    });

    it('should return false when instance does not exist', async () => {
      vi.mocked(WhatsAppInstanceModel.countDocuments).mockReturnValue({
        exec: vi.fn().mockResolvedValue(0),
      } as any);

      const result = await repository.exists('instance-1');

      expect(result).toBe(false);
    });

    it('should throw InfrastructureError when query fails', async () => {
      vi.mocked(WhatsAppInstanceModel.countDocuments).mockReturnValue({
        exec: vi.fn().mockRejectedValue(new Error('mongo error')),
      } as any);

      await expect(repository.exists('instance-1')).rejects.toBeInstanceOf(InfrastructureError);
    });
  });
});
