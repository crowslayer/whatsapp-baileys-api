import { CampaignCreator } from '../../../../src/application/campaign/create/CampaignCreator';
import { Description } from '../../../../src/domain/campaign/Description';
import { InstanceId } from '../../../../src/domain/value-objects/InstanceId';
import { Name } from '../../../../src/domain/value-objects/Name';

describe('CampaignCreator', () => {
  test('should create campaign and save to repository', async () => {
    const mockRepo = { save: vi.fn() };
    const creator = new CampaignCreator(mockRepo);
    const instanceId = InstanceId.fromString('inst-1');
    const name = Name.create('Campaign');
    const description = Description.create('My campaign');

    await creator.execute({
      instanceId,
      name,
      description,
      message: 'Hello!',
      numbers: ['jid1@s.whatsapp.net'],
    });

    expect(mockRepo.save).toHaveBeenCalledTimes(1);
    const saved = mockRepo.save.mock.calls[0][0];
    expect(saved.status).toBe('draft');
    expect(saved.recipients).toHaveLength(1);
    expect(saved.recipients[0].jid).toBe('jid1@s.whatsapp.net');
  });
});
