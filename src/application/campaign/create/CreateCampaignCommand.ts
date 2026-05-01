import { Description } from '@domain/campaign/Description';
import { InstanceId } from '@domain/value-objects/InstanceId';
import { Name } from '@domain/value-objects/Name';

import { Command } from '@shared/domain/commands/Command';

type CampaignProps = {
  instanceId: InstanceId;
  name: Name;
  description: Description;
  message: string;
  numbers: string[];
};

export class CreateCampaignCommand extends Command<void> {
  readonly instanceId: InstanceId;
  readonly name: Name;
  readonly description: Description;
  readonly message: string;
  readonly numbers: string[];

  constructor(props: CampaignProps) {
    super();
    this.instanceId = props.instanceId;
    this.name = props.name;
    this.description = props.description;
    this.message = props.message;
    this.numbers = props.numbers;
  }
}
