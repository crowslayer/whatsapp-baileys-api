import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CampaignModel } from '../../../../../src/infrastructure/persistence/mongo/models/CampaignModel';
import { MongoCampaignReadRepository } from '../../../../../src/infrastructure/persistence/mongo/repositories/MongoCampaignReadRepository';
import { InfrastructureError } from '../../../../../src/shared/infrastructure/errors/InfrastructureError';

vi.mock('../../../../../src/infrastructure/persistence/mongo/models/CampaignModel', () => ({
  CampaignModel: {
    findOne: vi.fn(),
    aggregate: vi.fn(),
  },
}));

describe('MongoCampaignReadRepository', () => {
  let repository: MongoCampaignReadRepository;

  beforeEach(() => {
    repository = new MongoCampaignReadRepository();
    vi.clearAllMocks();
  });

  const campaignItem = {
    campaignId: 'camp-1',
    name: 'Test Campaign',
    status: 'running',
    scheduledAt: new Date(),
    startedAt: new Date(),
    completedAt: null,
    createdAt: new Date(),
    recipients: [],
  };

  const listItem = {
    campaignId: 'camp-1',
    name: 'Test Campaign',
    status: 'running',
    scheduledAt: new Date(),
    startedAt: new Date(),
    completedAt: null,
    createdAt: new Date(),
    total: 10,
    sent: 5,
    failed: 3,
    pending: 2,
  };

  const stats = {
    total: 10,
    running: 2,
    scheduled: 3,
    completed: 4,
    paused: 1,
  };

  // =========================
  // getById
  // =========================
  describe('getById', () => {
    it('should return campaign', async () => {
      vi.mocked(CampaignModel.findOne).mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(campaignItem),
        }),
      } as any);

      const result = await repository.getById('camp-1');

      expect(result).toEqual(campaignItem);
      expect(CampaignModel.findOne).toHaveBeenCalledWith({
        campaignId: 'camp-1',
      });
    });

    it('should return null when not found', async () => {
      vi.mocked(CampaignModel.findOne).mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(null),
        }),
      } as any);

      const result = await repository.getById('camp-1');

      expect(result).toBeNull();
    });

    it('should wrap errors', async () => {
      vi.mocked(CampaignModel.findOne).mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockRejectedValue(new Error('db')),
        }),
      } as any);

      await expect(repository.getById('camp-1')).rejects.toBeInstanceOf(InfrastructureError);
    });
  });

  // =========================
  // list
  // =========================
  describe('list', () => {
    it('should return aggregated list', async () => {
      vi.mocked(CampaignModel.aggregate).mockResolvedValue([listItem]);

      const result = await repository.list(20, 0);

      expect(result).toEqual([listItem]);
    });

    it('should use default pagination', async () => {
      vi.mocked(CampaignModel.aggregate).mockResolvedValue([]);

      await repository.list();

      expect(CampaignModel.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            $sort: { createdAt: -1 },
          }),
        ])
      );
    });

    it('should apply skip and limit', async () => {
      vi.mocked(CampaignModel.aggregate).mockResolvedValue([]);

      await repository.list(10, 5);

      const pipeline = vi.mocked(CampaignModel.aggregate).mock.calls[0][0];

      expect(pipeline).toEqual(expect.arrayContaining([{ $skip: 5 }, { $limit: 10 }]));
    });

    it('should wrap errors', async () => {
      vi.mocked(CampaignModel.aggregate).mockRejectedValue(new Error('db'));

      await expect(repository.list()).rejects.toBeInstanceOf(InfrastructureError);
    });
  });

  // =========================
  // getSummary
  // =========================
  describe('getSummary', () => {
    it('should return summary', async () => {
      vi.mocked(CampaignModel.aggregate).mockResolvedValue([listItem]);

      const result = await repository.getSummary('camp-1');

      expect(result).toEqual(listItem);
    });

    it('should return null when empty', async () => {
      vi.mocked(CampaignModel.aggregate).mockResolvedValue([]);

      const result = await repository.getSummary('camp-1');

      expect(result).toBeNull();
    });
  });

  // =========================
  // getStats
  // =========================
  describe('getStats', () => {
    it('should return stats', async () => {
      vi.mocked(CampaignModel.aggregate).mockResolvedValue([stats]);

      const result = await repository.getStats();

      expect(result).toEqual(stats);
    });

    it('should return default stats when empty', async () => {
      vi.mocked(CampaignModel.aggregate).mockResolvedValue([]);

      const result = await repository.getStats();

      expect(result).toEqual({
        total: 0,
        running: 0,
        scheduled: 0,
        completed: 0,
        paused: 0,
      });
    });
  });

  // =========================
  // getProgress
  // =========================
  describe('getProgress', () => {
    it('should return percentage', async () => {
      vi.mocked(CampaignModel.aggregate).mockResolvedValue([{ total: 10, sent: 5 }]);

      const result = await repository.getProgress('camp-1');

      expect(result).toBe(50);
    });

    it('should return 0 when no doc', async () => {
      vi.mocked(CampaignModel.aggregate).mockResolvedValue([]);

      const result = await repository.getProgress('camp-1');

      expect(result).toBe(0);
    });

    it('should return 0 when total is 0', async () => {
      vi.mocked(CampaignModel.aggregate).mockResolvedValue([{ total: 0, sent: 0 }]);

      const result = await repository.getProgress('camp-1');

      expect(result).toBe(0);
    });

    it('should round percentage', async () => {
      vi.mocked(CampaignModel.aggregate).mockResolvedValue([{ total: 3, sent: 2 }]);

      const result = await repository.getProgress('camp-1');

      expect(result).toBe(67);
    });
  });
});
