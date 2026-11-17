import { describe, it, expect, vi, beforeEach } from 'vitest';

import { CampaignNotFoundError } from '@modules/campaign/domain/CampaignNotFoundError';
import { CampaignReadModel } from '@modules/campaign/domain/ICampaignReadRepository';

import { CampaignByIdQuery } from '@modules/campaign/application/find/by-id/CampaignByIdQuery';
import { CampaignByIdQueryHandler } from '@modules/campaign/application/find/by-id/CampaignByIdQueryHandler';
import { CampaignFinderById } from '@modules/campaign/application/find/by-id/CampaignFinderById';

const READ_MODEL: CampaignReadModel = {
  campaignId: '9c858901-8a57-4791-81fe-4c455b099bc9',
  instanceId: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
  name: 'Winter Campaign',
  description: 'Promotional campaign for the winter season',
  message: 'Hello, this is a promotional campaign',
  status: 'running',
};

describe('CampaignByIdQueryHandler', () => {
  let useCase: { execute: ReturnType<typeof vi.fn> };
  let handler: CampaignByIdQueryHandler;

  beforeEach(() => {
    vi.clearAllMocks();

    useCase = { execute: vi.fn() };
    handler = new CampaignByIdQueryHandler(useCase as unknown as CampaignFinderById);
  });

  it('should be subscribed to the CampaignByIdQuery', () => {
    const subscribed = handler.subscribedTo();

    expect(subscribed).toBe(CampaignByIdQuery);
  });

  it('should return the campaign read model', async () => {
    vi.mocked(useCase.execute).mockResolvedValue(READ_MODEL);

    const response = await handler.handle(new CampaignByIdQuery(READ_MODEL.campaignId));

    expect(response.content).toEqual(READ_MODEL);
  });

  it('should execute the use case with the campaign identifier', async () => {
    vi.mocked(useCase.execute).mockResolvedValue(READ_MODEL);

    await handler.handle(new CampaignByIdQuery(READ_MODEL.campaignId));

    expect(useCase.execute).toHaveBeenCalledWith(READ_MODEL.campaignId);
    expect(useCase.execute).toHaveBeenCalledTimes(1);
  });

  it('should throw a CampaignNotFoundError when the campaign does not exist', async () => {
    vi.mocked(useCase.execute).mockResolvedValue(null);

    await expect(handler.handle(new CampaignByIdQuery('missing'))).rejects.toThrow(
      CampaignNotFoundError
    );
  });

  it('should throw a CampaignNotFoundError with the expected message', async () => {
    vi.mocked(useCase.execute).mockResolvedValue(null);

    await expect(handler.handle(new CampaignByIdQuery('missing'))).rejects.toThrow(
      'Campaign not found'
    );
  });

  it('should propagate a domain error thrown by the use case', async () => {
    const domainError = new CampaignNotFoundError('Campaign not found');
    vi.mocked(useCase.execute).mockRejectedValue(domainError);

    await expect(handler.handle(new CampaignByIdQuery('missing'))).rejects.toBe(domainError);
  });

  it('should propagate an unexpected error thrown by the use case', async () => {
    vi.mocked(useCase.execute).mockRejectedValue(new Error('database is down'));

    await expect(handler.handle(new CampaignByIdQuery('missing'))).rejects.toThrow(
      'database is down'
    );
  });
});
