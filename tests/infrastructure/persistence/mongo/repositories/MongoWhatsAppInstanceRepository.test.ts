import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MongoWhatsAppInstanceRepository } from '../../../../../src/infrastructure/persistence/mongo/repositories/MongoWhatsAppInstanceRepository';
import { InfrastructureError } from '../../../../../src/shared/infrastructure/errors/InfrastructureError';

import { WhatsAppInstanceModel } from '../../../../../src/infrastructure/persistence/mongo/models/WhatsAppInstanceModel';

import { WhatsAppInstanceAggregate } from '../../../../../src/domain/aggregates/WhatsAppInstanceAggregate';
import { ConnectionStatus } from '../../../../../src/domain/value-objects/ConnectionStatus';
import { InstanceId } from '../../../../../src/domain/value-objects/InstanceId';
import { Name } from '../../../../../src/domain/value-objects/Name';
import { PhoneNumber } from '../../../../../src/domain/value-objects/PhoneNumber';

type MockWhatsAppModel = ReturnType<typeof vi.fn> & {
  findOne: ReturnType<typeof vi.fn>;
  find: ReturnType<typeof vi.fn>;
  updateOne: ReturnType<typeof vi.fn>;
  deleteOne: ReturnType<typeof vi.fn>;
  countDocuments: ReturnType<typeof vi.fn>;
};

function mockSave(saveImpl: ReturnType<typeof vi.fn>) {
  vi.mocked(WhatsAppInstanceModel).mockImplementation(function () {
    return {
      save: saveImpl,
    };
  } as any);
}

vi.mock('@infrastructure/persistence/mongo/models/WhatsAppInstanceModel', () => {
  const mockModel = vi.fn() as MockWhatsAppModel;

  mockModel.findOne = vi.fn();
  mockModel.find = vi.fn();
  mockModel.updateOne = vi.fn();
  mockModel.deleteOne = vi.fn();
  mockModel.countDocuments = vi.fn();

  return {
    WhatsAppInstanceModel: mockModel,
  };
});

vi.mock('@domain/aggregates/WhatsAppInstanceAggregate', () => ({
  WhatsAppInstanceAggregate: {
    restore: vi.fn(),
  },
}));

vi.mock('@domain/value-objects/InstanceId', () => ({
  InstanceId: {
    fromString: vi.fn((v) => ({ value: v })),
  },
}));

vi.mock('@domain/value-objects/Name', () => ({
  Name: {
    create: vi.fn((v) => ({ value: v })),
  },
}));

vi.mock('@domain/value-objects/ConnectionStatus', () => ({
  ConnectionStatus: {
    create: vi.fn((v) => ({ value: v })),
  },
  ConnectionStatusEnum: {
    CONNECTED: 'CONNECTED',
    DISCONNECTED: 'DISCONNECTED',
  },
}));

vi.mock('@domain/value-objects/PhoneNumber', () => ({
  PhoneNumber: {
    create: vi.fn((v) => ({ value: v })),
  },
}));

describe('MongoWhatsAppInstanceRepository', () => {
  let repository: MongoWhatsAppInstanceRepository;

  beforeEach(() => {
    repository = new MongoWhatsAppInstanceRepository();

    vi.clearAllMocks();
  });

  const aggregateMock = {
    instanceId: 'instance-1',
    name: {
      value: 'Test Instance',
    },
    status: {
      value: 'CONNECTED',
    },
    phoneNumber: {
      value: '5219999999999',
    },
    webhookUrl: 'https://webhook.test',
    lastConnectedAt: new Date(),
  } as any;

  const documentMock = {
    instanceId: 'instance-1',
    name: 'Test Instance',
    status: 'CONNECTED',
    phoneNumber: '5219999999999',
    webhookUrl: 'https://webhook.test',
    lastConnectedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('save', () => {
    it('should save a new instance', async () => {
      const saveMock = vi.fn().mockResolvedValue(undefined);

      mockSave(saveMock);

      await repository.save(aggregateMock);

      expect(saveMock).toHaveBeenCalledOnce();
    });

    it('should throw InfrastructureError when save fails', async () => {
      const saveMock = vi.fn().mockRejectedValue(new Error('mongo error'));

      mockSave(saveMock);

      await expect(repository.save(aggregateMock)).rejects.toBeInstanceOf(InfrastructureError);
    });

    it('should rethrow unknown errors', async () => {
      const saveMock = vi.fn().mockRejectedValue('unknown');

      mockSave(saveMock);

      await expect(repository.save(aggregateMock)).rejects.toEqual('unknown');
    });
  });

  describe('findById', () => {
    it('should return null when instance does not exist', async () => {
      vi.mocked(WhatsAppInstanceModel.findOne).mockResolvedValue(null);

      const result = await repository.findById('not-found');

      expect(result).toBeNull();
    });

    it('should return aggregate when found', async () => {
      const aggregate = { id: 'aggregate' };

      vi.mocked(WhatsAppInstanceModel.findOne).mockResolvedValue(documentMock as any);

      vi.mocked(WhatsAppInstanceAggregate.restore).mockReturnValue(aggregate as any);

      const result = await repository.findById('instance-1');

      expect(result).toEqual(aggregate);
    });

    it('should wrap errors in InfrastructureError', async () => {
      vi.mocked(WhatsAppInstanceModel.findOne).mockRejectedValue(new Error('db error'));

      await expect(repository.findById('instance-1')).rejects.toBeInstanceOf(InfrastructureError);
    });
  });

  describe('findByName', () => {
    it('should return null when instance does not exist', async () => {
      vi.mocked(WhatsAppInstanceModel.findOne).mockResolvedValue(null);

      const result = await repository.findByName('test');

      expect(result).toBeNull();
    });

    it('should return aggregate when found', async () => {
      const aggregate = { id: 'aggregate' };

      vi.mocked(WhatsAppInstanceModel.findOne).mockResolvedValue(documentMock as any);

      vi.mocked(WhatsAppInstanceAggregate.restore).mockReturnValue(aggregate as any);

      const result = await repository.findByName('test');

      expect(result).toEqual(aggregate);
    });
  });

  describe('findAll', () => {
    it('should return empty array when no documents exist', async () => {
      vi.mocked(WhatsAppInstanceModel.find).mockReturnValue({
        sort: vi.fn().mockResolvedValue([]),
      } as any);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });

    it('should map all documents to aggregates', async () => {
      vi.mocked(WhatsAppInstanceModel.find).mockReturnValue({
        sort: vi.fn().mockResolvedValue([documentMock, documentMock]),
      } as any);

      vi.mocked(WhatsAppInstanceAggregate.restore).mockReturnValue({} as any);

      const result = await repository.findAll();

      expect(result).toHaveLength(2);
      expect(WhatsAppInstanceAggregate.restore).toHaveBeenCalledTimes(2);
    });

    it('should throw InfrastructureError on mongo error', async () => {
      vi.mocked(WhatsAppInstanceModel.find).mockReturnValue({
        sort: vi.fn().mockRejectedValue(new Error('db error')),
      } as any);

      await expect(repository.findAll()).rejects.toBeInstanceOf(InfrastructureError);
    });
  });

  describe('update', () => {
    it('should update instance', async () => {
      vi.mocked(WhatsAppInstanceModel.updateOne).mockResolvedValue({} as any);

      await repository.update(aggregateMock);

      expect(WhatsAppInstanceModel.updateOne).toHaveBeenCalledWith(
        {
          instanceId: aggregateMock.instanceId,
        },
        expect.objectContaining({
          $set: expect.objectContaining({
            name: aggregateMock.name.value,
            status: aggregateMock.status.value,
          }),
        })
      );
    });

    it('should throw InfrastructureError when update fails', async () => {
      vi.mocked(WhatsAppInstanceModel.updateOne).mockRejectedValue(new Error('db error'));

      await expect(repository.update(aggregateMock)).rejects.toBeInstanceOf(InfrastructureError);
    });
  });

  describe('delete', () => {
    it('should do nothing when instance does not exist', async () => {
      vi.mocked(WhatsAppInstanceModel.findOne).mockResolvedValue(null);

      await repository.delete('instance-1');

      expect(WhatsAppInstanceModel.deleteOne).not.toHaveBeenCalled();
    });

    it('should delete existing instance', async () => {
      vi.mocked(WhatsAppInstanceModel.findOne).mockResolvedValue(documentMock as any);

      vi.mocked(WhatsAppInstanceModel.deleteOne).mockResolvedValue({} as any);

      await repository.delete('instance-1');

      expect(WhatsAppInstanceModel.deleteOne).toHaveBeenCalledWith({
        instanceId: 'instance-1',
      });
    });

    it('should throw InfrastructureError when delete fails', async () => {
      vi.mocked(WhatsAppInstanceModel.findOne).mockRejectedValue(new Error('db error'));

      await expect(repository.delete('instance-1')).rejects.toBeInstanceOf(InfrastructureError);
    });
  });

  describe('exists', () => {
    it('should return true when document exists', async () => {
      vi.mocked(WhatsAppInstanceModel.countDocuments).mockResolvedValue(1);

      const result = await repository.exists('instance-1');

      expect(result).toBe(true);
    });

    it('should return false when document does not exist', async () => {
      vi.mocked(WhatsAppInstanceModel.countDocuments).mockResolvedValue(0);

      const result = await repository.exists('instance-1');

      expect(result).toBe(false);
    });

    it('should throw InfrastructureError when count fails', async () => {
      vi.mocked(WhatsAppInstanceModel.countDocuments).mockRejectedValue(new Error('db error'));

      await expect(repository.exists('instance-1')).rejects.toBeInstanceOf(InfrastructureError);
    });
  });

  describe('toDomain', () => {
    it('should map document to aggregate correctly', async () => {
      vi.mocked(WhatsAppInstanceModel.findOne).mockResolvedValue(documentMock as any);

      await repository.findById('instance-1');

      expect(InstanceId.fromString).toHaveBeenCalledWith('instance-1');
      expect(Name.create).toHaveBeenCalledWith('Test Instance');
      expect(ConnectionStatus.create).toHaveBeenCalledWith('CONNECTED');
      expect(PhoneNumber.create).toHaveBeenCalledWith('5219999999999');
    });

    it('should not create PhoneNumber when phoneNumber is undefined', async () => {
      vi.mocked(WhatsAppInstanceModel.findOne).mockResolvedValue({
        ...documentMock,
        phoneNumber: undefined,
      } as any);

      await repository.findById('instance-1');

      expect(PhoneNumber.create).not.toHaveBeenCalled();
    });
  });
});
