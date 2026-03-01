import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

import { DocumentSender } from './DocumentSender';
import { SendDocumentCommand } from './SendDocumentCommand';

export class SendDocumentCommandHandler implements ICommandHandler<SendDocumentCommand> {
  constructor(private readonly sender: DocumentSender) {}

  subscribedTo(): typeof SendDocumentCommand {
    return SendDocumentCommand;
  }

  async handle(command: SendDocumentCommand): Promise<void> {
    await this.sender.execute(command);
  }
}
