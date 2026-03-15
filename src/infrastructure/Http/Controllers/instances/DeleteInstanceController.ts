import { NextFunction, Request, Response } from 'express';

import { DeleteInstanceCommand } from '@application/instances/delete/DeleteInstanceCommand';

import { ICommandBus } from '@shared/domain/commands/CommandBus';
import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';

export class DeleteInstanceController {
  constructor(private readonly commandBus: ICommandBus) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instanceId } = req.params;

      const audit = new AuditDataBuilder('DELETE', 'INSTANCE')
        .withResourceId(instanceId)
        .withRequest(req.ip, req.get('user-agent'))
        .build();
      const command = new DeleteInstanceCommand(instanceId);
      await this.commandBus.dispatch(command);

      ResponseHandler.success(res, null, 'Instance deleted successfully', 200, audit);
    } catch (error) {
      next(error);
    }
  }
}
