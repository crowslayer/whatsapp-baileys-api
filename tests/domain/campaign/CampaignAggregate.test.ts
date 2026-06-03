import { CampaignAggregate } from '../../../src/domain/campaign/CampaignAggregate';
import { CampaignId } from '../../../src/domain/campaign/CampaignId';
import { Description } from '../../../src/domain/campaign/Description';
import { InstanceId } from '../../../src/domain/value-objects/InstanceId';
import { Name } from '../../../src/domain/value-objects/Name';

describe('CampaignAggregate', () => {
  const makeProps = () => ({
    instanceId: InstanceId.fromString('inst-1'),
    name: Name.create('Campaign 1'),
    description: Description.create('Test campaign'),
    message: 'Hello!',
    recipients: [
      { jid: 'jid1@s.whatsapp.net', status: 'pending' as const, attempts: 0 },
      { jid: 'jid2@s.whatsapp.net', status: 'pending' as const, attempts: 0 },
    ],
  });

  test('should create campaign with draft status', () => {
    const props = makeProps();
    const campaign = CampaignAggregate.create(props);
    expect(campaign.status).toBe('draft');
    expect(campaign.recipients).toHaveLength(2);
    expect(campaign.recipients[0].status).toBe('pending');
    expect(campaign.recipients[0].jid).toBe('jid1@s.whatsapp.net');
  });

  test('should restore from persisted props', () => {
    const campaignId = CampaignId.fromString('camp-restore');
    const instanceId = InstanceId.fromString('inst-1');
    const name = Name.create('Restored');
    const description = Description.create('Restored desc');
    const campaign = CampaignAggregate.restore({
      campaignId,
      instanceId,
      name,
      description,
      message: 'Hi',
      recipients: [{ jid: 'jid1', status: 'pending', attempts: 0 }],
      status: 'running',
    });
    expect(campaign.status).toBe('running');
    expect(campaign.campaignId.value).toBe('camp-restore');
  });

  test('should start campaign from draft', () => {
    const campaign = CampaignAggregate.create(makeProps());
    campaign.start();
    expect(campaign.status).toBe('running');
  });

  test('should not start from running state', () => {
    const campaign = CampaignAggregate.create(makeProps());
    campaign.start();
    expect(() => campaign.start()).toThrow('Invalid state transition');
  });

  test('should pause running campaign', () => {
    const campaign = CampaignAggregate.create(makeProps());
    campaign.start();
    campaign.pause();
    expect(campaign.status).toBe('paused');
  });

  test('should complete running campaign', () => {
    const campaign = CampaignAggregate.create(makeProps());
    campaign.start();
    campaign.complete();
    expect(campaign.status).toBe('completed');
  });

  test('should schedule draft campaign', () => {
    const campaign = CampaignAggregate.create(makeProps());
    const future = new Date('2026-06-01');
    campaign.schedule(future);
    expect(campaign.status).toBe('scheduled');
  });

  test('should throw if scheduling non-draft campaign', () => {
    const campaign = CampaignAggregate.create(makeProps());
    campaign.start();
    expect(() => campaign.schedule(new Date())).toThrow('Only draft campaigns can be scheduled');
  });

  test('should throw if message exceeds 1000 chars', () => {
    expect(() =>
      CampaignAggregate.create({
        ...makeProps(),
        message: 'A'.repeat(1001),
      })
    ).toThrow();
  });

  test('should throw if recipients >= 5000', () => {
    expect(() =>
      CampaignAggregate.create({
        ...makeProps(),
        recipients: Array.from({ length: 5000 }, (_, i) => ({
          jid: `jid${i}@s.whatsapp.net`,
          status: 'pending' as const,
          attempts: 0,
        })),
      })
    ).toThrow();
  });

  test('should update campaign properties', () => {
    const campaign = CampaignAggregate.create(makeProps());
    const newName = Name.create('Updated Name');
    campaign.updated({ name: newName });
    expect(campaign.name.value).toBe('Updated Name');
  });
});
