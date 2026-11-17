import { IController, IHttpRequest } from '@apps/backend/http/controllers/IController';

import { ICommandBus } from '@shared/domain/command/CommandBus';
import { RequestFile } from '@shared/domain/RequestFile';
import { ISentMessage } from '@shared/domain/whatsapp/MessageTypes';
import { HttpResponse } from '@shared/infrastructure/http/response/HttpResponse';
import { ResponseBuilder } from '@shared/infrastructure/http/response/ResponseBuilder';
import { PhoneNormalizer } from '@shared/infrastructure/utils/PhoneNormalizer';

import { MessageError } from '@modules/messages/application/MessageError';
import { SendStickerCommand } from '@modules/messages/application/sticker/SendStickerCommand';

type StickerParams = {
  params: {
    instanceId: string;
  };
  body: {
    to: string;
    sticker: RequestFile;
    isAnimated?: boolean;
  };
};

type StickerRequest = IHttpRequest & StickerParams;

export class SendStickerController implements IController {
  constructor(private readonly commandBus: ICommandBus) {}

  async handle(req: StickerRequest): Promise<HttpResponse<ISentMessage>> {
    const { instanceId } = req.params;
    const { to, sticker, isAnimated = false } = req.body;

    if (!sticker) {
      throw new MessageError('Sticker file is required');
    }

    const normalizer = new PhoneNormalizer();
    const jid = normalizer.toJid(to);

    if (!jid) {
      throw new MessageError('Phone invalid');
    }

    const command = new SendStickerCommand(instanceId, jid, sticker, isAnimated);
    const content = await this.commandBus.dispatch<ISentMessage>(command);

    return ResponseBuilder.ok(content);
  }
}
