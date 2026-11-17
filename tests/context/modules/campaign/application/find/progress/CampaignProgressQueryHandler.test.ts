import { describe, it, expect, vi, beforeEach } from 'vitest';

import { CampaignProgressQuery } from '@modules/campaign/application/find/progress/CampaignProgressQuery';
import { CampaignProgressQueryHandler } from '@modules/campaign/application/find/progress/CampaignProgressQueryHandler';
import { ProgressFinder } from '@modules/campaign/application/find/progress/ProgressFinder';

describe('CampaignProgressQueryHandler', () => {
  let useCase: { execute: ReturnType<typeof vi.fn> };
  let handler: CampaignProgressQueryHandler;

  beforeEach(() => {
    vi.clearAllMocks();

    useCase = { execute: vi.fn() };
    handler = new CampaignProgressQueryHandler(useCase as unknown as ProgressFinder);
  });

  it('should be subscribed to the CampaignProgressQuery', () => {
    const subscribed = handler.subscribedTo();

    expect(subscribed).toBe(CampaignProgressQuery);
  });

  it('should return the progress percentage', async () => {
    vi.mocked(useCase.execute).mockResolvedValue(75);

    const response = await handler.handle(new CampaignProgressQuery('campaign-1'));

    expect(response.content).toBe(75);
  });

  it('should return zero when there is no progress', async () => {
    vi.mocked(useCase.execute).mockResolvedValue(0);

    const response = await handler.handle(new CampaignProgressQuery('campaign-1'));

    expect(response.content).toBe(0);
  });

  it('should execute the use case with the campaign identifier', async () => {
    vi.mocked(useCase.execute).mockResolvedValue(10);

    await handler.handle(new CampaignProgressQuery('campaign-1'));

    expect(useCase.execute).toHaveBeenCalledWith('campaign-1');
    expect(useCase.execute).toHaveBeenCalledTimes(1);
  });

  it('should propagate the error thrown by the use case', async () => {
    vi.mocked(useCase.execute).mockRejectedValue(new Error('database is down'));

    await expect(handler.handle(new CampaignProgressQuery('campaign-1'))).rejects.toThrow(
      'database is down'
    );
  });
});
