import { Command } from '@shared/domain/commands/Command';

export class SendLocationCommand extends Command<void> {
  constructor(
    public readonly instanceId: string,
    public readonly to: string,
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly name?: string,
    public readonly address?: string
  ) {
    super();
  }
}
