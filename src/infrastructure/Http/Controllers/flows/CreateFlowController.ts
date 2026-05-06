import { NextFunction, Request, Response } from 'express';

import { InstanceId } from '@domain/value-objects/InstanceId';
import { Name } from '@domain/value-objects/Name';

import { CreateFlowCommand } from '@application/flows/create/CreateFlowCommand';

import { ICommandBus } from '@shared/domain/commands/CommandBus';
import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';

export class CreateFlowController {
  constructor(private readonly commandBus: ICommandBus) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instanceId, name } = req.body;

      const audit = new AuditDataBuilder('CREATE', 'FLOW')
        .withRequest(req.ip, req.get('user-agent'))
        .withDetails({ name })
        .build();

      const cmd = new CreateFlowCommand(InstanceId.fromString(instanceId), Name.create(name));

      await this.commandBus.dispatch(cmd);

      const content = {
        instanceId,
        name,
      };

      ResponseHandler.created(res, content, 'Nodes created successfully', audit);
    } catch (error) {
      next(error);
    }
  }
}
