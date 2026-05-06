import { NextFunction, Request, Response } from 'express';

import { FlowId } from '@domain/value-objects/FlowId';

import { DeleteFlowCommand } from '@application/flows/delete/DeleteFlowCommand';

import { StatusCode } from '@infrastructure/http/StatusCode';

import { ICommandBus } from '@shared/domain/commands/CommandBus';
import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';

export class DeleteFlowController {
  constructor(private readonly commandbus: ICommandBus) {}
  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const flowId = req.params.flowId;

      const cmd = new DeleteFlowCommand(FlowId.fromString(flowId));

      await this.commandbus.dispatch(cmd);

      const audit = new AuditDataBuilder('DELETE', 'FLOW')
        .withRequest(req.ip, req.get('user-agent'))
        .withDetails({ flowId })
        .build();

      ResponseHandler.success(
        res,
        null,
        'Flow deleted successfully',
        StatusCode.SuccessAccepted,
        audit
      );
    } catch (error) {
      next(error);
    }
  }
}
