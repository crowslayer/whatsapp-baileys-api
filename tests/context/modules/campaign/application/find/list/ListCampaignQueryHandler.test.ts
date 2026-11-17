import { describe, it, expect, vi, beforeEach } from 'vitest';

import { CampaignReadModel } from '@modules/campaign/domain/ICampaignReadRepository';

import { ListCampaignQuery } from '@modules/campaign/application/find/list/ListCampaignQuery';
import { ListCampaignQueryHandler } from '@modules/campaign/application/find/list/ListCampaignQueryHandler';
import { CampaignFinder } from '@modules/campaign/application/find/list/CampaignFinder';

const READ_MODEL: CampaignReadModel = {
  campaignId: '9c858901-8a57-4791-81fe-4c455b099bc9',
  instanceId: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
  name: 'Winter Campaign',
  description: 'Promotional campaign for the winter season',
  message: 'Hello, this is a promotional campaign',
  status: 'running',
};

describe('ListCampaignQueryHandler', () => {
  let useCase: { execute: ReturnType<typeof vi.fn> };
  let handler: ListCampaignQueryHandler;

  beforeEach(() => {
    vi.clearAllMocks();

    useCase = { execute: vi.fn() };
    handler = new ListCampaignQueryHandler(useCase as unknown as CampaignFinder);
  });

  it('should be subscribed to the ListCampaignQuery', () => {
    const subscribed = handler.subscribedTo();

    expect(subscribed).toBe(ListCampaignQuery);
  });

  it('should return the list of campaigns', async () => {
    vi.mocked(useCase.execute).mockResolvedValue([READ_MODEL]);

    const response = await handler.handle(new ListCampaignQuery());

    expect(response.content).toEqual([READ_MODEL]);
  });

  it('should return an empty content when there are no campaigns', async () => {
    vi.mocked(useCase.execute).mockResolvedValue([]);

    const response = await handler.handle(new ListCampaignQuery());

    expect(response.content).toEqual([]);
  });

  it('should execute the use case with the limit and the skip', async () => {
    vi.mocked(useCase.execute).mockResolvedValue([]);

    await handler.handle(new ListCampaignQuery(10, 20));

    expect(useCase.execute).toHaveBeenCalledWith(10, 20);
  });

  it('should execute the use case with undefined values when they are not provided', async () => {
    vi.mocked(useCase.execute).mockResolvedValue([]);

    await handler.handle(new ListCampaignQuery());

    expect(useCase.execute).toHaveBeenCalledWith(undefined, undefined);
  });

  it('should propagate the error thrown by the use case', async () => {
    vi.mocked(useCase.execute).mockRejectedValue(new Error('database is down'));

    await expect(handler.handle(new ListCampaignQuery())).rejects.toThrow('database is down');
  });
});
