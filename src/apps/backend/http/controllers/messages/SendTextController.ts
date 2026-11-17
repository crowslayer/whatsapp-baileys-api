import { IController, IHttpRequest } from '@apps/backend/http/controllers/IController';

import { ICommandBus } from '@shared/domain/command/CommandBus';
import { ISentMessage } from '@shared/domain/whatsapp/MessageTypes';
import { HttpResponse } from '@shared/infrastructure/http/response/HttpResponse';
import { ResponseBuilder } from '@shared/infrastructure/http/response/ResponseBuilder';
import { PhoneNormalizer } from '@shared/infrastructure/utils/PhoneNormalizer';

import { SendMessageCommand } from '@modules/messages/application/text/SendMessageCommand';

type TextRequestParams = {
  params: {
    instanceId: string;
  };
  body: {
    to: string;
    message: string;
  };
};

type TextRequest = IHttpRequest & TextRequestParams;

export class SendTextController implements IController {
  constructor(private readonly commandBus: ICommandBus) {}

  async handle(req: TextRequest): Promise<HttpResponse<ISentMessage>> {
    const { instanceId } = req.params;
    const { to, message } = req.body;

    const normalizer = new PhoneNormalizer();
    const jid = normalizer.toJid(to);
    if (!jid) {
      throw new Error('Phone invalid');
    }

    const command = new SendMessageCommand(instanceId, jid, message);
    const content = await this.commandBus.dispatch<ISentMessage>(command);

    return ResponseBuilder.ok(content);
  }
}
