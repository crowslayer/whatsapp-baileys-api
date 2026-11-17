import { describe, it, expect, vi, beforeEach } from 'vitest';

import { CampaignNotFoundError } from '@modules/campaign/domain/CampaignNotFoundError';

import { CampaignUpdater } from '@modules/campaign/application/update/CampaignUpdater';
import { UpdateCampaignCommand } from '@modules/campaign/application/update/UpdateCampaignCommand';
import { UpdateCampaignCommandHandler } from '@modules/campaign/application/update/UpdateCampaignCommandHandler';

const buildCommand = (): UpdateCampaignCommand =>
  new UpdateCampaignCommand({
    campaignId: '9c858901-8a57-4791-81fe-4c455b099bc9',
    instanceId: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
    name: 'Winter Campaign',
    description: 'Promotional campaign for the winter season',
    message: 'Hello, this is a promotional campaign',
    numbers: ['5215512345678@s.whatsapp.net'],
  });

describe('UpdateCampaignCommandHandler', () => {
  let useCase: { execute: ReturnType<typeof vi.fn> };
  let handler: UpdateCampaignCommandHandler;

  beforeEach(() => {
    vi.clearAllMocks();

    useCase = { execute: vi.fn() };
    handler = new UpdateCampaignCommandHandler(useCase as unknown as CampaignUpdater);
  });

  it('should be subscribed to the UpdateCampaignCommand', () => {
    const subscribed = handler.subscribedTo();

    expect(subscribed).toBe(UpdateCampaignCommand);
  });

  it('should execute the use case with the received command', async () => {
    const command = buildCommand();
    vi.mocked(useCase.execute).mockResolvedValue(undefined);

    await handler.handle(command);

    expect(useCase.execute).toHaveBeenCalledWith(command);
    expect(useCase.execute).toHaveBeenCalledTimes(1);
  });

  it('should resolve without content when the campaign is updated', async () => {
    vi.mocked(useCase.execute).mockResolvedValue(undefined);

    const result = await handler.handle(buildCommand());

    expect(result).toBeUndefined();
  });

  it('should propagate a domain error thrown by the use case', async () => {
    const domainError = new CampaignNotFoundError('Campaign not found');
    vi.mocked(useCase.execute).mockRejectedValue(domainError);

    await expect(handler.handle(buildCommand())).rejects.toBe(domainError);
  });

  it('should propagate an unexpected error thrown by the use case', async () => {
    vi.mocked(useCase.execute).mockRejectedValue(new Error('database is down'));

    await expect(handler.handle(buildCommand())).rejects.toThrow('database is down');
  });
});
