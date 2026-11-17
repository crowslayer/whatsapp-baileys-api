import { Command } from '@shared/domain/command/Command';

export class DeleteNodesCommand extends Command<void> {
  constructor(readonly flowId: string) {
    super();
  }
}
