import { IController, IHttpRequest } from '@apps/backend/http/controllers/IController';

import { ICommandBus } from '@shared/domain/command/CommandBus';
import { RequestFile } from '@shared/domain/RequestFile';
import { ISentMessage } from '@shared/domain/whatsapp/MessageTypes';
import { HttpResponse } from '@shared/infrastructure/http/response/HttpResponse';
import { ResponseBuilder } from '@shared/infrastructure/http/response/ResponseBuilder';
import { PhoneNormalizer } from '@shared/infrastructure/utils/PhoneNormalizer';

import { SendImageCommand } from '@modules/messages/application/image/SendImageCommand';
import { MessageError } from '@modules/messages/application/MessageError';

type MulterRequest = {
  params: {
    instanceId: string;
  };
  body: {
    to: string;
    caption?: string;
    image: RequestFile;
  };
};

type ImageRequest = IHttpRequest & MulterRequest;

export class SendImageController implements IController {
  constructor(private readonly commandBus: ICommandBus) {}

  async handle(req: ImageRequest): Promise<HttpResponse<ISentMessage>> {
    const { instanceId } = req.params;
    const { to, caption, image } = req.body;

    if (!image) {
      throw new MessageError('Image file is required');
    }

    const normalizer = new PhoneNormalizer();
    const jid = normalizer.toJid(to);
    if (!jid) {
      throw new MessageError('Phone invalid');
    }

    const command = new SendImageCommand(instanceId, jid, image, caption);
    const content = await this.commandBus.dispatch<ISentMessage>(command);

    return ResponseBuilder.ok(content);
  }
}
