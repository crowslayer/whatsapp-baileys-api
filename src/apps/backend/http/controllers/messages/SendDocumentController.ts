import { IController, IHttpRequest } from '@apps/backend/http/controllers/IController';

import { ICommandBus } from '@shared/domain/command/CommandBus';
import { RequestFile } from '@shared/domain/RequestFile';
import { ISentMessage } from '@shared/domain/whatsapp/MessageTypes';
import { HttpResponse } from '@shared/infrastructure/http/response/HttpResponse';
import { ResponseBuilder } from '@shared/infrastructure/http/response/ResponseBuilder';
import { PhoneNormalizer } from '@shared/infrastructure/utils/PhoneNormalizer';

import { SendDocumentCommand } from '@modules/messages/application/document/SendDocumentCommand';
import { MessageError } from '@modules/messages/application/MessageError';

type MulterRequest = {
  params: {
    instanceId: string;
  };
  body: {
    to: string;
    caption: string;
    mimetype: string;
    document: RequestFile;
  };
};

type DocumentRequest = IHttpRequest & MulterRequest;

export class SendDocumentController implements IController {
  constructor(private readonly commandBus: ICommandBus) {}

  async handle(req: DocumentRequest): Promise<HttpResponse<ISentMessage>> {
    const { instanceId } = req.params;
    const { to, caption, document, mimetype } = req.body;

    if (!document) {
      throw new MessageError('Document file is required');
    }

    const normalizer = new PhoneNormalizer();
    const jid = normalizer.toJid(to);

    if (!jid) {
      throw new MessageError('Phone invalid');
    }

    const command = new SendDocumentCommand(instanceId, jid, document, mimetype, caption);
    const content = await this.commandBus.dispatch<ISentMessage>(command);

    return ResponseBuilder.ok(content);
  }
}
