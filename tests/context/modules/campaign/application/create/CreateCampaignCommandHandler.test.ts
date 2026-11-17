import { describe, it, expect, vi, beforeEach } from 'vitest';

import { CampaignNotFoundError } from '@modules/campaign/domain/CampaignNotFoundError';

import { CampaignCreator } from '@modules/campaign/application/create/CampaignCreator';
import { CreateCampaignCommand } from '@modules/campaign/application/create/CreateCampaignCommand';
import { CreateCampaignCommandHandler } from '@modules/campaign/application/create/CreateCampaignCommandHandler';

const buildCommand = (): CreateCampaignCommand =>
  new CreateCampaignCommand({
    instanceId: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
    name: 'Winter Campaign',
    description: 'Promotional campaign for the winter season',
    message: 'Hello, this is a promotional campaign',
    numbers: ['5215512345678@s.whatsapp.net'],
  });

describe('CreateCampaignCommandHandler', () => {
  let useCase: { execute: ReturnType<typeof vi.fn> };
  let handler: CreateCampaignCommandHandler;

  beforeEach(() => {
    vi.clearAllMocks();

    useCase = { execute: vi.fn() };
    handler = new CreateCampaignCommandHandler(useCase as unknown as CampaignCreator);
  });

  it('should be subscribed to the CreateCampaignCommand', () => {
    const subscribed = handler.subscribedTo();

    expect(subscribed).toBe(CreateCampaignCommand);
  });

  it('should execute the use case with the received command', async () => {
    const command = buildCommand();
    vi.mocked(useCase.execute).mockResolvedValue(undefined);

    await handler.handle(command);

    expect(useCase.execute).toHaveBeenCalledWith(command);
    expect(useCase.execute).toHaveBeenCalledTimes(1);
  });

  it('should resolve without content when the campaign is created', async () => {
    vi.mocked(useCase.execute).mockResolvedValue(undefined);

    const result = await handler.handle(buildCommand());

    expect(result).toBeUndefined();
  });

  it('should propagate a domain error thrown by the use case', async () => {
    const domainError = new CampaignNotFoundError('Instance not found');
    vi.mocked(useCase.execute).mockRejectedValue(domainError);

    await expect(handler.handle(buildCommand())).rejects.toBe(domainError);
  });

  it('should propagate an unexpected error thrown by the use case', async () => {
    vi.mocked(useCase.execute).mockRejectedValue(new Error('database is down'));

    await expect(handler.handle(buildCommand())).rejects.toThrow('database is down');
  });
});
