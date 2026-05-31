import { describe, expect, it } from 'vitest';
import { DeleteCampaignCommand } from '../../../../src/application/campaign/delete/DeleteCampaignCommand';
import { CampaignId } from '../../../../src/domain/campaign/CampaignId';

describe('DeleteCampaignCommand', () => {
  it('should create a command with the provided properties', () => {
    const campaignId = CampaignId.fromString('camp-1');

    const command = new DeleteCampaignCommand(campaignId);
    expect(command).toBeInstanceOf(DeleteCampaignCommand);

    expect(command.campaignId).toBe(campaignId);
  });
});
