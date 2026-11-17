import { Command } from '@shared/domain/command/Command';

export class DeleteFlowCommand extends Command<void> {
  constructor(readonly flowId: string) {
    super();
  }
}
