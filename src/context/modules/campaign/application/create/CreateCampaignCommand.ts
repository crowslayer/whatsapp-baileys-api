import { Command } from '@shared/domain/command/Command';

type CampaignProps = {
  instanceId: string;
  name: string;
  description: string;
  message: string;
  numbers: string[];
};

export class CreateCampaignCommand extends Command<void> {
  readonly instanceId: string;
  readonly name: string;
  readonly description: string;
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
