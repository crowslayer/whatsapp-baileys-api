import { describe, expect, vi } from 'vitest';
import { CampaignUpdater } from '../../../../src/application/campaign/update/CampaignUpdater';
import { CampaignId } from '../../../../src/domain/campaign/CampaignId';
import { Description } from '../../../../src/domain/campaign/Description';
import { InstanceId } from '../../../../src/domain/value-objects/InstanceId';
import { Name } from '../../../../src/domain/value-objects/Name';

describe('CampaignUpdater', () => {
  test('execute finds entity by ID and calls entity.updated with transformed props', async () => {
    const mockUpdated = vi.fn();
    const mockRepo = {
      findById: vi.fn().mockResolvedValue({ updated: mockUpdated }),
    };
    const updater = new CampaignUpdater(mockRepo);
    const campaignId = CampaignId.fromString('camp-1');
    const instanceId = InstanceId.fromString('inst-1');
    const name = Name.create('Updated Campaign');
    const description = Description.create('Updated desc');
    const numbers = ['jid1@s.whatsapp.net', 'jid2@s.whatsapp.net'];

    await updater.execute({
      campaignId,
      instanceId,
      name,
      description,
      message: 'Hello!',
      numbers,
    });

    expect(mockRepo.findById).toHaveBeenCalledWith(campaignId);
    expect(mockUpdated).toHaveBeenCalledWith({
      instanceId,
      description,
      message: 'Hello!',
      recipients: [
        { jid: 'jid1@s.whatsapp.net', status: 'pending', attempts: 0 },
        { jid: 'jid2@s.whatsapp.net', status: 'pending', attempts: 0 },
      ],
    });
  });

  test('handles repository errors', async () => {
    const mockRepo = {
      findById: vi.fn().mockRejectedValue(new Error('Not found')),
    };
    const updater = new CampaignUpdater(mockRepo);
    const campaignId = CampaignId.fromString('camp-1');

    await expect(
      updater.execute({
        campaignId,
        instanceId: InstanceId.fromString('inst-1'),
        name: Name.create('Campaign'),
        description: Description.create('Desc'),
        message: 'Hello',
        numbers: [],
      })
    ).rejects.toThrow('Not found');
  });
});
