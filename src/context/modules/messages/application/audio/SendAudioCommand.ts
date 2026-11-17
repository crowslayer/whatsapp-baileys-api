import { Command } from '@shared/domain/command/Command';
import { RequestFile } from '@shared/domain/RequestFile';
import { ISentMessage } from '@shared/domain/whatsapp/MessageTypes';

export class SendAudioCommand extends Command<ISentMessage> {
  constructor(
    public readonly instanceId: string,
    public readonly to: string,
    public readonly audio: RequestFile,
    public readonly ptt?: boolean
  ) {
    super();
  }
}
