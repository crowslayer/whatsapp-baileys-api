import { IController, IHttpRequest } from '@apps/backend/http/controllers/IController';

import { ICommandBus } from '@shared/domain/command/CommandBus';
import { ISentMessage } from '@shared/domain/whatsapp/MessageTypes';
import { HttpResponse } from '@shared/infrastructure/http/response/HttpResponse';
import { ResponseBuilder } from '@shared/infrastructure/http/response/ResponseBuilder';
import { PhoneNormalizer } from '@shared/infrastructure/utils/PhoneNormalizer';

import { SendContactCommand } from '@modules/messages/application/contact/SendContactCommand';
import { MessageError } from '@modules/messages/application/MessageError';

type ContactRequest = IHttpRequest & {
  params: { instanceId: string };
  body: {
    to: string;
    contacts: { displayName: string; vcard: string }[];
  };
};

export class SendContactController implements IController {
  constructor(private readonly commandBus: ICommandBus) {}

  async handle(req: ContactRequest): Promise<HttpResponse<ISentMessage>> {
    const { instanceId } = req.params;
    const { to, contacts } = req.body;

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      throw new MessageError('At least one contact with displayName and vcard is required');
    }

    const validContacts = contacts.map((c: { displayName?: string; vcard?: string }) => ({
      displayName: c.displayName || 'Contact',
      vcard: c.vcard || '',
    }));

    const normalizer = new PhoneNormalizer();
    const jid = normalizer.toJid(to);
    if (!jid) {
      throw new MessageError('Phone invalid');
    }

    const command = new SendContactCommand(instanceId, jid, validContacts);
    const content = await this.commandBus.dispatch<ISentMessage>(command);

    return ResponseBuilder.ok(content);
  }
}
