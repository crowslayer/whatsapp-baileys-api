import { CampaignAggregate } from '@modules/campaign/domain/CampaignAggregate';
import { CampaignName } from '@modules/campaign/domain/CampaignName';
import { Description } from '@modules/campaign/domain/Description';
import { ICampaignRepository } from '@modules/campaign/domain/ICampaignRepository';
import { Message } from '@modules/campaign/domain/Message';
import { InstanceId } from '@modules/instances/domain/InstanceId';

type CampaignProps = {
  instanceId: string;
  name: string;
  description: string;
  message: string;
  numbers: string[];
};

export class CampaignCreator {
  constructor(private readonly repository: ICampaignRepository) {}

  async execute(props: CampaignProps): Promise<void> {
    const aggregate = CampaignAggregate.create({
      instanceId: InstanceId.fromString(props.instanceId),
      name: CampaignName.create(props.name),
      description: Description.create(props.description),
      message: Message.create(props.message),
      recipients: props.numbers.map((jid) => ({
        jid,
        status: 'pending',
        attempts: 0,
      })),
    });

    await this.repository.save(aggregate);
  }
}
