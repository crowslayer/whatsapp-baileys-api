import { IController, IHttpRequest } from '@apps/backend/http/controllers/IController';

import { ICommandBus } from '@shared/domain/command/CommandBus';
import { ISentMessage } from '@shared/domain/whatsapp/MessageTypes';
import { HttpResponse } from '@shared/infrastructure/http/response/HttpResponse';
import { ResponseBuilder } from '@shared/infrastructure/http/response/ResponseBuilder';
import { PhoneNormalizer } from '@shared/infrastructure/utils/PhoneNormalizer';

import { SendLocationCommand } from '@modules/messages/application/location/SendLocationCommand';
import { MessageError } from '@modules/messages/application/MessageError';

type LocationParams = {
  params: {
    instanceId: string;
  };
  body: {
    location: {
      to: string;
      latitude: string;
      longitude: string;
      name?: string;
      address?: string;
    };
  };
};

type LocationRequest = IHttpRequest & LocationParams;

export class SendLocationController implements IController {
  constructor(private readonly commandBus: ICommandBus) {}

  async handle(req: LocationRequest): Promise<HttpResponse<ISentMessage>> {
    const { instanceId } = req.params;
    const { to, latitude, longitude, name, address } = req.body.location;

    const normalizer = new PhoneNormalizer();
    const jid = normalizer.toJid(to);
    if (!jid) {
      throw new MessageError('Phone invalid');
    }

    const command = new SendLocationCommand(
      instanceId,
      jid,
      parseFloat(latitude),
      parseFloat(longitude),
      name,
      address
    );

    const content = await this.commandBus.dispatch<ISentMessage>(command);

    return ResponseBuilder.ok(content);
  }
}
