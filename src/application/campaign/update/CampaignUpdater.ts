import { CampaignId } from '@domain/campaign/CampaignId';
import { Description } from '@domain/campaign/Description';
import { ICampaignRepository } from '@domain/campaign/ICampaignRepository';
import { InstanceId } from '@domain/value-objects/InstanceId';
import { Name } from '@domain/value-objects/Name';

type CampaignProps = {
  campaignId: CampaignId;
  instanceId: InstanceId;
  name: Name;
  description: Description;
  message: string;
  numbers: string[];
};

export class CampaignUpdater {
  constructor(private readonly repository: ICampaignRepository) {}

  async execute(props: CampaignProps): Promise<void> {
    const entity = await this.repository.findById(props.campaignId);

    entity.updated({
      instanceId: props.instanceId,
      description: props.description,
      message: props.message,
      recipients: props.numbers.map((jid) => ({
        jid,
        status: 'pending',
        attempts: 0,
      })),
    });
  }
}
