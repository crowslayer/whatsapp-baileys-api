import { NextFunction, Request, Response } from 'express';

import { DisconnectInstanceCommand } from '@application/instances/disconnect/DisconnectInstanceCommand';

import { ICommandBus } from '@shared/domain/commands/CommandBus';
import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';

export class DisconnectInstanceController {
  constructor(private readonly commandBus: ICommandBus) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instanceId } = req.params;

      const audit = new AuditDataBuilder('DISCONNECT', 'INSTANCE')
        .withResourceId(instanceId)
        .withRequest(req.ip, req.get('user-agent'))
        .build();

      const command = new DisconnectInstanceCommand(instanceId);
      await this.commandBus.dispatch(command);

      ResponseHandler.success(res, null, 'Instance disconnected successfully', 200, audit);
    } catch (error) {
      next(error);
    }
  }
}
