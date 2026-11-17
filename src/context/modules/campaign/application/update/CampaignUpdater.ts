import { CampaignId } from '@modules/campaign/domain/CampaignId';
import { Description } from '@modules/campaign/domain/Description';
import { ICampaignRepository } from '@modules/campaign/domain/ICampaignRepository';
import { Message } from '@modules/campaign/domain/Message';
import { InstanceId } from '@modules/instances/domain/InstanceId';

type CampaignProps = {
  campaignId: string;
  instanceId: string;
  name: string;
  description: string;
  message: string;
  numbers: string[];
};

export class CampaignUpdater {
  constructor(private readonly repository: ICampaignRepository) {}

  async execute(props: CampaignProps): Promise<void> {
    const entity = await this.repository.findById(CampaignId.fromString(props.campaignId));

    entity.updated({
      instanceId: InstanceId.fromString(props.instanceId),
      description: Description.create(props.description),
      message: Message.create(props.message),
      recipients: props.numbers.map((jid) => ({
        jid,
        status: 'pending',
        attempts: 0,
      })),
    });
  }
}
