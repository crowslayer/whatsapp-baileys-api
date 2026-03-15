import { NextFunction, Request, Response } from 'express';

import { SendLocationCommand } from '@application/messages/location/SendLocationCommand';

import { StatusCode } from '@infrastructure/http/StatusCode';

import { ICommandBus } from '@shared/domain/commands/CommandBus';
import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';

export class SendLocationController {
  constructor(private readonly commandBus: ICommandBus) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instanceId } = req.params;
      const { to, latitude, longitude, name, address } = req.body;

      const audit = new AuditDataBuilder('SEND', 'LOCATION')
        .withResourceId(instanceId)
        .withRequest(req.ip, req.get('user-agent'))
        .withDetails({ to, latitude, longitude })
        .build();

      const command = new SendLocationCommand(
        instanceId,
        to,
        parseFloat(latitude),
        parseFloat(longitude),
        name,
        address
      );
      await this.commandBus.dispatch(command);

      ResponseHandler.success(
        res,
        { sent: true },
        'Location sent successfully',
        StatusCode.SuccessOK,
        audit
      );
    } catch (error) {
      next(error);
    }
  }
}
