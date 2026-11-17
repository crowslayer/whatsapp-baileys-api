import { IController, IHttpRequest } from '@apps/backend/http/controllers/IController';

import { ICommandBus } from '@shared/domain/command/CommandBus';
import { HttpResponse } from '@shared/infrastructure/http/response/HttpResponse';
import { ResponseBuilder } from '@shared/infrastructure/http/response/ResponseBuilder';

import { ConnectInstanceCommand } from '@modules/instances/application/connect/ConnectInstanceCommand';

type ConnectInstanceRequest = IHttpRequest & {
  params: { instanceId: string };
  body: {
    instance: {
      phoneNumber?: string;
      usePairingCode?: boolean;
    };
  };
};

export class ConnectInstanceController implements IController {
  constructor(private readonly commandBus: ICommandBus) {}

  async handle(req: ConnectInstanceRequest): Promise<HttpResponse<null>> {
    const { usePairingCode, phoneNumber } = req.body.instance;
    const { instanceId } = req.params;

    const command = new ConnectInstanceCommand(instanceId, usePairingCode, phoneNumber);

    await this.commandBus.dispatch(command);

    return ResponseBuilder.ok(null);
  }
}
