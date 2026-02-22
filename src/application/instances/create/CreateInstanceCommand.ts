import { Command } from '@shared/domain/commands/Command';

import { AggregateResponse } from './AggregateResponse';

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
