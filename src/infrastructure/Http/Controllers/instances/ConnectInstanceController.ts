import { NextFunction, Request, Response } from 'express';

import { ConnectInstanceCommand } from '@application/instances/connect/ConnectInstanceCommand';

import { ICommandBus } from '@shared/domain/commands/CommandBus';
import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';

export class ConnectInstanceController {
  constructor(private readonly commandBus: ICommandBus) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instanceId, usePairingCode, phoneNumber } = req.body;

      const audit = new AuditDataBuilder('CONNECT', 'INSTANCE')
        .withRequest(req.ip, req.get('user-agent'))
        .withDetails({ instanceId })
        .build();

      const command = new ConnectInstanceCommand(instanceId, usePairingCode, phoneNumber);

      const instance = await this.commandBus.dispatch(command);

      const content = instance;
      ResponseHandler.created(res, content, 'Instance created successfully', audit);
    } catch (error) {
      next(error);
    }
  }
}
