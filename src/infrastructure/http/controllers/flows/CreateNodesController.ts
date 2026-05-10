import { NextFunction, Request, Response } from 'express';

import { FlowId } from '@domain/value-objects/FlowId';

import { CreateNodesCommand } from '@application/flows/nodes/create/CreateNodesCommand';

import { ICommandBus } from '@shared/domain/commands/CommandBus';
import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';

export class CreateNodesController {
  constructor(private readonly commandBus: ICommandBus) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      //   const { flowId } = req.params;
      const { flowId, nodes, start, triggers = [] } = req.body;

      const audit = new AuditDataBuilder('CREATE', 'NODES')
        .withRequest(req.ip, req.get('user-agent'))
        .withDetails({ flowId })
        .build();

      const cmd = new CreateNodesCommand(FlowId.fromString(flowId), nodes, start, triggers);

      await this.commandBus.dispatch(cmd);

      const content = {
        flowId,
        start,
      };

      ResponseHandler.created(res, content, 'Campaign created successfully', audit);
    } catch (error) {
      next(error);
    }
  }
}
