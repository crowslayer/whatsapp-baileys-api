import { AggregateResponse } from '@application/instances/create/AggregateResponse';

import { Command } from '@shared/domain/commands/Command';

export class CreateInstanceCommand extends Command<AggregateResponse> {
  constructor(
    public readonly name: string,
    public readonly webhookUrl?: string,
    public readonly usePairingCode?: boolean,
    public readonly phoneNumber?: string
  ) {
    super();
  }
}
