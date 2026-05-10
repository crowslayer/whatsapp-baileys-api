import { NextFunction, Request, Response } from 'express';

import { AggregateResponse } from '@application/instances/create/AggregateResponse';
import { CreateInstanceCommand } from '@application/instances/create/CreateInstanceCommand';

import { ICommandBus } from '@shared/domain/commands/CommandBus';
import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';

export class CreateInstanceController {
  constructor(private readonly commandBus: ICommandBus) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, webhookUrl, usePairingCode, phoneNumber } = req.body;

      const audit = new AuditDataBuilder('CREATE', 'INSTANCE')
        .withRequest(req.ip, req.get('user-agent'))
        .withDetails({ name })
        .build();

      const command = new CreateInstanceCommand(name, webhookUrl, usePairingCode, phoneNumber);

      const instance = await this.commandBus.dispatch<AggregateResponse>(command);

      const content = instance.content;
      ResponseHandler.created(res, content, 'Instance created successfully', audit);
    } catch (error) {
      next(error);
    }
  }
}
