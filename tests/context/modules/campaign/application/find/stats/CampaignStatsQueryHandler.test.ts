import { describe, it, expect, vi, beforeEach } from 'vitest';

import { CampaignStats } from '@modules/campaign/domain/ICampaignReadRepository';

import { CampaignStatsQuery } from '@modules/campaign/application/find/stats/CampaignStatsQuery';
import { CampaignStatsQueryHandler } from '@modules/campaign/application/find/stats/CampaignStatsQueryHandler';
import { StatsFinder } from '@modules/campaign/application/find/stats/StatsFinder';

const STATS: CampaignStats = {
  total: 10,
  running: 3,
  scheduled: 2,
  completed: 4,
  paused: 1,
};

describe('CampaignStatsQueryHandler', () => {
  let useCase: { execute: ReturnType<typeof vi.fn> };
  let handler: CampaignStatsQueryHandler;

  beforeEach(() => {
    vi.clearAllMocks();

    useCase = { execute: vi.fn() };
    handler = new CampaignStatsQueryHandler(useCase as unknown as StatsFinder);
  });

  it('should be subscribed to the CampaignStatsQuery', () => {
    const subscribed = handler.subscribedTo();

    expect(subscribed).toBe(CampaignStatsQuery);
  });

  it('should return the campaign statistics', async () => {
    vi.mocked(useCase.execute).mockResolvedValue(STATS);

    const response = await handler.handle(new CampaignStatsQuery());

    expect(response.content).toEqual(STATS);
  });

  it('should return zeroed statistics', async () => {
    vi.mocked(useCase.execute).mockResolvedValue({
      total: 0,
      running: 0,
      scheduled: 0,
      completed: 0,
      paused: 0,
    });

    const response = await handler.handle(new CampaignStatsQuery());

    expect(response.content.total).toBe(0);
  });

  it('should execute the use case without arguments', async () => {
    vi.mocked(useCase.execute).mockResolvedValue(STATS);

    await handler.handle(new CampaignStatsQuery());

    expect(useCase.execute).toHaveBeenCalledWith();
    expect(useCase.execute).toHaveBeenCalledTimes(1);
  });

  it('should propagate the error thrown by the use case', async () => {
    vi.mocked(useCase.execute).mockRejectedValue(new Error('database is down'));

    await expect(handler.handle(new CampaignStatsQuery())).rejects.toThrow('database is down');
  });
});
