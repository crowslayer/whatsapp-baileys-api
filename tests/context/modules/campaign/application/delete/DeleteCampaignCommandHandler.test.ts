import { describe, it, expect, vi, beforeEach } from 'vitest';

import { CampaignNotFoundError } from '@modules/campaign/domain/CampaignNotFoundError';

import { CampaignEraser } from '@modules/campaign/application/delete/CampaignEraser';
import { DeleteCampaignCommand } from '@modules/campaign/application/delete/DeleteCampaignCommand';
import { DeleteCampaignCommandHandler } from '@modules/campaign/application/delete/DeleteCampaignCommandHandler';

const CAMPAIGN_ID = '9c858901-8a57-4791-81fe-4c455b099bc9';

describe('DeleteCampaignCommandHandler', () => {
  let useCase: { execute: ReturnType<typeof vi.fn> };
  let handler: DeleteCampaignCommandHandler;

  beforeEach(() => {
    vi.clearAllMocks();

    useCase = { execute: vi.fn() };
    handler = new DeleteCampaignCommandHandler(useCase as unknown as CampaignEraser);
  });

  it('should be subscribed to the DeleteCampaignCommand', () => {
    const subscribed = handler.subscribedTo();

    expect(subscribed).toBe(DeleteCampaignCommand);
  });

  it('should execute the use case with the campaign identifier', async () => {
    vi.mocked(useCase.execute).mockResolvedValue(undefined);

    await handler.handle(new DeleteCampaignCommand(CAMPAIGN_ID));

    expect(useCase.execute).toHaveBeenCalledWith(CAMPAIGN_ID);
    expect(useCase.execute).toHaveBeenCalledTimes(1);
  });

  it('should resolve without content when the campaign is deleted', async () => {
    vi.mocked(useCase.execute).mockResolvedValue(undefined);

    const result = await handler.handle(new DeleteCampaignCommand(CAMPAIGN_ID));

    expect(result).toBeUndefined();
  });

  it('should propagate a domain error thrown by the use case', async () => {
    const domainError = new CampaignNotFoundError('Campaign not found');
    vi.mocked(useCase.execute).mockRejectedValue(domainError);

    await expect(handler.handle(new DeleteCampaignCommand(CAMPAIGN_ID))).rejects.toBe(domainError);
  });

  it('should propagate an unexpected error thrown by the use case', async () => {
    vi.mocked(useCase.execute).mockRejectedValue(new Error('database is down'));

    await expect(handler.handle(new DeleteCampaignCommand(CAMPAIGN_ID))).rejects.toThrow(
      'database is down'
    );
  });
});
