import { IController, IHttpRequest } from '@apps/backend/http/controllers/IController';

import { ICommandBus } from '@shared/domain/command/CommandBus';
import { HttpResponse } from '@shared/infrastructure/http/response/HttpResponse';
import { ResponseBuilder } from '@shared/infrastructure/http/response/ResponseBuilder';

import { CreateInstanceCommand } from '@modules/instances/application/create/CreateInstanceCommand';
import { InstanceResponse } from '@modules/instances/application/InstanceResponse';
import { InstanceReadModel } from '@modules/instances/domain/IInstanceReadRepository';

interface ICreateInstanceRequest extends IHttpRequest {
  body: {
    name: string;
    webhookUrl?: string;
    usePairingCode?: boolean;
    phoneNumber?: string;
  };
}

export class CreateInstanceController implements IController {
  constructor(private readonly commandBus: ICommandBus) {}

  async handle(req: ICreateInstanceRequest): Promise<HttpResponse<InstanceReadModel>> {
    const { name, webhookUrl, usePairingCode = false, phoneNumber } = req.body;

    const command = new CreateInstanceCommand(name, webhookUrl, usePairingCode, phoneNumber);

    const result = await this.commandBus.dispatch<InstanceResponse>(command);

    return ResponseBuilder.created(result.content);
  }
}
