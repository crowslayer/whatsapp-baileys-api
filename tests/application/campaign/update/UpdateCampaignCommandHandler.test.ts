import { describe, expect, vi } from 'vitest';
import { UpdateCampaignCommand } from '../../../../src/application/campaign/update/UpdateCampaignCommand';
import { UpdateCampaignCommandHandler } from '../../../../src/application/campaign/update/UpdateCampaignCommandHandler';
import { CampaignId } from '../../../../src/domain/campaign/CampaignId';
import { Description } from '../../../../src/domain/campaign/Description';
import { InstanceId } from '../../../../src/domain/value-objects/InstanceId';
import { Name } from '../../../../src/domain/value-objects/Name';

describe('UpdateCampaignCommandHandler', () => {
  test('subscribedTo returns UpdateCampaignCommand', () => {
    const handler = new UpdateCampaignCommandHandler({ execute: vi.fn() });
    expect(handler.subscribedTo()).toBe(UpdateCampaignCommand);
  });

  test('handle calls updater.execute with command', async () => {
    const mockUpdater = { execute: vi.fn() };
    const handler = new UpdateCampaignCommandHandler(mockUpdater);
    const command = new UpdateCampaignCommand({
      campaignId: CampaignId.fromString('camp-1'),
      instanceId: InstanceId.fromString('inst-1'),
      name: Name.create('Campaign'),
      description: Description.create('Desc'),
      message: 'Hello',
      numbers: ['jid1'],
    });

    await handler.handle(command);

    expect(mockUpdater.execute).toHaveBeenCalledWith(command);
  });
});
