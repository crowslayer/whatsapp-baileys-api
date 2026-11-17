import { IController, IHttpRequest } from '@apps/backend/http/controllers/IController';

import { ICommandBus } from '@shared/domain/command/CommandBus';
import { RequestFile } from '@shared/domain/RequestFile';
import { ISentMessage } from '@shared/domain/whatsapp/MessageTypes';
import { HttpResponse } from '@shared/infrastructure/http/response/HttpResponse';
import { ResponseBuilder } from '@shared/infrastructure/http/response/ResponseBuilder';
import { PhoneNormalizer } from '@shared/infrastructure/utils/PhoneNormalizer';

import { SendAudioCommand } from '@modules/messages/application/audio/SendAudioCommand';
import { MessageError } from '@modules/messages/application/MessageError';

type MulterRequest = {
  params: {
    instanceId: string;
  };
  body: {
    to: string;
    ptt: boolean;
    audio: RequestFile;
  };
};

type AudioRequest = IHttpRequest & MulterRequest;

export class SendAudioController implements IController {
  constructor(private readonly commandBus: ICommandBus) {}

  async handle(req: AudioRequest): Promise<HttpResponse<ISentMessage>> {
    const { instanceId } = req.params;
    const { to, ptt, audio } = req.body;

    if (!audio) {
      throw new MessageError('Audio file is required');
    }

    const normalizer = new PhoneNormalizer();
    const jid = normalizer.toJid(to);

    if (!jid) {
      throw new MessageError('Phone is invalid or not found');
    }

    const isPtt = ptt === true;

    const command = new SendAudioCommand(instanceId, jid, audio, isPtt);
    const content = await this.commandBus.dispatch<ISentMessage>(command);

    return ResponseBuilder.ok<ISentMessage>(content);
  }
}
