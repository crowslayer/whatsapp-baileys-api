import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CampaignModel } from '../../../../../src/infrastructure/persistence/mongo/models/CampaignModel';
import { MongoCampaignRepository } from '../../../../../src/infrastructure/persistence/mongo/repositories/MongoCampaignRepository';
import { InfrastructureError } from '../../../../../src/shared/infrastructure/errors/InfrastructureError';

vi.mock('../../../../../src/infrastructure/persistence/mongo/models/CampaignModel', () => ({
  CampaignModel: {
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    updateOne: vi.fn(),
    deleteOne: vi.fn(),
  },
}));

describe('MongoCampaignRepository', () => {
  let repository: MongoCampaignRepository;

  beforeEach(() => {
    repository = new MongoCampaignRepository();
    vi.clearAllMocks();
  });

  // =========================
  // FACTORY (clave para estabilidad)
  // =========================
  const createCampaignDoc = (overrides: any = {}) => ({
    campaignId: 'camp-1',
    instanceId: 'inst-1',
    name: 'Test',
    description: 'desc',
    status: 'running',
    message: 'hello',

    recipients: [
      {
        jid: '123',
        status: 'pending',
        retryAt: null,
        attempts: 0,
      },
    ],

    lockedAt: null,
    lockedBy: null,
    lockExpiresAt: null,

    createdAt: new Date(),
    updatedAt: new Date(),

    ...overrides,
  });

  // =========================
  // findById
  // =========================
  describe('findById', () => {
    it('should return campaign', async () => {
      vi.mocked(CampaignModel.findOne).mockResolvedValue(createCampaignDoc() as any);
      const result = await repository.findById({ value: 'camp-1' });

      expect(result.campaignId.value).toBe('camp-1');
      expect(result.instanceId.value).toBe('inst-1');
    });

    it('should throw when not found', async () => {
      vi.mocked(CampaignModel.findOne).mockResolvedValue(null);

      await expect(repository.findById({ value: 'camp-1' } as any)).rejects.toThrow(
        'Campaign not exist'
      );
    });
  });

  // =========================
  // save
  // =========================
  describe('save', () => {
    it('should upsert campaign', async () => {
      vi.mocked(CampaignModel.updateOne).mockResolvedValue({} as any);

      await repository.save({
        campaignId: { value: 'camp-1' },
        instanceId: { value: 'inst-1' },
        name: { value: 'name' },
        description: { value: 'desc' },
        status: 'running',
        message: 'msg',
        recipients: [],
      } as any);

      expect(CampaignModel.updateOne).toHaveBeenCalled();
    });

    it('should wrap errors', async () => {
      vi.mocked(CampaignModel.updateOne).mockRejectedValue(new Error('db'));

      await expect(repository.save({} as any)).rejects.toBeInstanceOf(InfrastructureError);
    });
  });

  // =========================
  // lockNext
  // =========================
  describe('lockNext', () => {
    it('should return locked campaign', async () => {
      vi.mocked(CampaignModel.findOneAndUpdate).mockResolvedValue(
        createCampaignDoc({
          lockedBy: 'worker-1',
        }) as any
      );

      const result = await repository.lockNext('worker-1');

      expect(result?.lockedBy).toBe('worker-1');
    });

    it('should return null when nothing found', async () => {
      vi.mocked(CampaignModel.findOneAndUpdate).mockResolvedValue(null);

      const result = await repository.lockNext('worker-1');

      expect(result).toBeNull();
    });
  });

  // =========================
  // retry candidate
  // =========================
  describe('findRetryCandidate', () => {
    it('should return retry campaign', async () => {
      vi.mocked(CampaignModel.findOneAndUpdate).mockResolvedValue(
        createCampaignDoc({
          recipients: [
            {
              jid: '123',
              status: 'pending',
              retryAt: new Date(Date.now() - 1000),
              attempts: 1,
            },
          ],
          lockedBy: 'worker-1',
        }) as any
      );

      const result = await repository.findRetryCandidate('worker-1');

      expect(result?.lockedBy).toBe('worker-1');
    });
  });

  // =========================
  // activate scheduled
  // =========================
  describe('activateNextScheduled', () => {
    it('should activate scheduled campaign', async () => {
      vi.mocked(CampaignModel.findOneAndUpdate).mockResolvedValue(
        createCampaignDoc({
          status: 'running',
        }) as any
      );

      const result = await repository.activateNextScheduled();

      expect(result?.status).toBe('running');
    });
  });

  // =========================
  // update progress
  // =========================
  describe('updateProgress', () => {
    it('should update recipient progress', async () => {
      vi.mocked(CampaignModel.updateOne).mockResolvedValue({} as any);

      await repository.updateProgress({ value: 'camp-1' } as any, 0, {
        jid: '123',
        status: 'sent',
        attempts: 1,
      } as any);

      expect(CampaignModel.updateOne).toHaveBeenCalled();
    });
  });

  // =========================
  // complete
  // =========================
  describe('complete', () => {
    it('should mark campaign completed', async () => {
      vi.mocked(CampaignModel.updateOne).mockResolvedValue({} as any);

      await repository.complete({ value: 'camp-1' } as any);

      expect(CampaignModel.updateOne).toHaveBeenCalled();
    });
  });

  // =========================
  // delete
  // =========================
  describe('delete', () => {
    it('should delete campaign', async () => {
      vi.mocked(CampaignModel.deleteOne).mockResolvedValue({} as any);

      await repository.delete({ value: 'camp-1' } as any);

      expect(CampaignModel.deleteOne).toHaveBeenCalledWith({
        campaignId: 'camp-1',
      });
    });

    it('should wrap delete errors', async () => {
      vi.mocked(CampaignModel.deleteOne).mockRejectedValue(new Error('db'));

      await expect(repository.delete({ value: 'camp-1' } as any)).rejects.toBeInstanceOf(
        InfrastructureError
      );
    });
  });

  // =========================
  // mapper
  // =========================
  describe('toDomain (via findById)', () => {
    it('should map document correctly', async () => {
      vi.mocked(CampaignModel.findOne).mockResolvedValue(createCampaignDoc()) as any;

      const result = await repository.findById({
        value: 'camp-1',
      } as any);

      expect(result.instanceId.value).toBe('inst-1');
      expect(result.campaignId.value).toBe('camp-1');
      expect(result.name.value).toBe('Test');
    });
  });
});
