import { CampaignAggregate } from '@domain/campaign/CampaignAggregate';
import { Description } from '@domain/campaign/Description';
import { ICampaignRepository } from '@domain/campaign/ICampaignRepository';
import { InstanceId } from '@domain/value-objects/InstanceId';
import { Name } from '@domain/value-objects/Name';

type CampaignProps = {
  instanceId: InstanceId;
  name: Name;
  description: Description;
  message: string;
  numbers: string[];
};

export class CampaignCreator {
  constructor(private readonly repository: ICampaignRepository) {}

  async execute(props: CampaignProps): Promise<void> {
    const aggregate = CampaignAggregate.create({
      ...props,
      recipients: props.numbers.map((jid) => ({
        jid,
        status: 'pending',
        attempts: 0,
      })),
    });

    await this.repository.save(aggregate);
  }
}
