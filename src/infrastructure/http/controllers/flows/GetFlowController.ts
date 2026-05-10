import { NextFunction, Request, Response } from 'express';

import { GetFlowQuery } from '@application/flows/get/GetFlowQuery';

import { StatusCode } from '@infrastructure/http/StatusCode';

import { IQueryBus } from '@shared/domain/query/QueryBus';
import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';

export class GetFlowController {
  constructor(private readonly queryBus: IQueryBus) {}

  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { flowId } = req.params;

      const audit = new AuditDataBuilder('READ', 'FLOW')
        .withResourceId(flowId)
        .withRequest(req.ip, req.get('user-agent'))
        .build();

      const query = new GetFlowQuery(flowId);
      const instance = await this.queryBus.ask(query);

      ResponseHandler.success(
        res,
        instance.content,
        'Flow retrieved successfully',
        StatusCode.SuccessOK,
        audit
      );
    } catch (error) {
      next(error);
    }
  }
}
