import { NextFunction, Request, Response } from 'express';

import { FlowId } from '@domain/value-objects/FlowId';

import { DeleteNodesCommand } from '@application/flows/nodes/delete/DeleteNodesCommand';

import { StatusCode } from '@infrastructure/http/StatusCode';

import { ICommandBus } from '@shared/domain/commands/CommandBus';
import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';

export class DeleteNodesController {
  constructor(private readonly commandBus: ICommandBus) {}

  async handlet(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { flowId } = req.params;

      const audit = new AuditDataBuilder('DELETE', 'NODES')
        .withRequest(req.ip, req.get('user-agent'))
        .withDetails({ flowId })
        .build();

      const cmd = new DeleteNodesCommand(FlowId.fromString(flowId));

      await this.commandBus.dispatch(cmd);

      const content = {
        flowId,
        nodes: {},
      };

      ResponseHandler.success(
        res,
        content,
        'Nodes delete successfully',
        StatusCode.SuccessOK,
        audit
      );
    } catch (error) {
      next(error);
    }
  }
}
