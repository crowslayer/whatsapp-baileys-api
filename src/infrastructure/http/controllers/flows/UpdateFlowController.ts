import { NextFunction, Request, Response } from 'express';

import { FlowId } from '@domain/value-objects/FlowId';
import { InstanceId } from '@domain/value-objects/InstanceId';
import { Name } from '@domain/value-objects/Name';

import { UpdateFlowCommand } from '@application/flows/update/UpdateFlowCommand';

import { StatusCode } from '@infrastructure/http/StatusCode';

import { ICommandBus } from '@shared/domain/commands/CommandBus';
import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';

export class UpdateFlowController {
  constructor(private readonly commandBus: ICommandBus) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const flowId = req.params.flowId;
      const { instanceId, name } = req.body;

      const audit = new AuditDataBuilder('UPDATE', 'FLOW')
        .withRequest(req.ip, req.get('user-agent'))
        .withDetails({ name })
        .build();

      const cmd = new UpdateFlowCommand(
        FlowId.fromString(flowId),
        InstanceId.fromString(instanceId),
        Name.create(name)
      );

      await this.commandBus.dispatch(cmd);

      const content = {
        flow: {
          flowId,
          instanceId,
          name,
        },
      };

      ResponseHandler.success(
        res,
        content,
        'Flow updated successfully',
        StatusCode.SuccessOK,
        audit
      );
    } catch (error) {
      next(error);
    }
  }
}
