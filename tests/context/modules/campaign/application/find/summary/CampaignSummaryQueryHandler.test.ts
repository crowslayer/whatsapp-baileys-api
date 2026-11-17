import { describe, it, expect, vi, beforeEach } from 'vitest';

import { CampaignNotFoundError } from '@modules/campaign/domain/CampaignNotFoundError';
import { CampaignReadModel } from '@modules/campaign/domain/ICampaignReadRepository';

import { CampaignSummaryQuery } from '@modules/campaign/application/find/summary/CampaignSummaryQuery';
import { CampaignSummaryQueryHandler } from '@modules/campaign/application/find/summary/CampaignSummaryQueryHandler';
import { SummaryFinder } from '@modules/campaign/application/find/summary/SummaryFinder';

const READ_MODEL: CampaignReadModel = {
  campaignId: '9c858901-8a57-4791-81fe-4c455b099bc9',
  instanceId: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
  name: 'Winter Campaign',
  description: 'Promotional campaign for the winter season',
  message: 'Hello, this is a promotional campaign',
  status: 'completed',
};

describe('CampaignSummaryQueryHandler', () => {
  let useCase: { execute: ReturnType<typeof vi.fn> };
  let handler: CampaignSummaryQueryHandler;

  beforeEach(() => {
    vi.clearAllMocks();

    useCase = { execute: vi.fn() };
    handler = new CampaignSummaryQueryHandler(useCase as unknown as SummaryFinder);
  });

  it('should be subscribed to the CampaignSummaryQuery', () => {
    const subscribed = handler.subscribedTo();

    expect(subscribed).toBe(CampaignSummaryQuery);
  });

  it('should return the campaign summary', async () => {
    vi.mocked(useCase.execute).mockResolvedValue(READ_MODEL);

    const response = await handler.handle(new CampaignSummaryQuery(READ_MODEL.campaignId));

    expect(response.content).toEqual(READ_MODEL);
  });

  it('should execute the use case with the campaign identifier', async () => {
    vi.mocked(useCase.execute).mockResolvedValue(READ_MODEL);

    await handler.handle(new CampaignSummaryQuery(READ_MODEL.campaignId));

    expect(useCase.execute).toHaveBeenCalledWith(READ_MODEL.campaignId);
  });

  it('should throw a CampaignNotFoundError when the summary does not exist', async () => {
    vi.mocked(useCase.execute).mockResolvedValue(null);

    await expect(handler.handle(new CampaignSummaryQuery('missing'))).rejects.toThrow(
      CampaignNotFoundError
    );
  });

  it('should throw a CampaignNotFoundError with the expected message', async () => {
    vi.mocked(useCase.execute).mockResolvedValue(null);

    await expect(handler.handle(new CampaignSummaryQuery('missing'))).rejects.toThrow(
      'Campaign Summary not found'
    );
  });

  it('should propagate an unexpected error thrown by the use case', async () => {
    vi.mocked(useCase.execute).mockRejectedValue(new Error('database is down'));

    await expect(handler.handle(new CampaignSummaryQuery('missing'))).rejects.toThrow(
      'database is down'
    );
  });
});
