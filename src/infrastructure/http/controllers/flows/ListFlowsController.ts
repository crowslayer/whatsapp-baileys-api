import { NextFunction, Request, Response } from 'express';

import { ListFlowsQuery } from '@application/flows/list/ListFlowsQuery';

import { StatusCode } from '@infrastructure/http/StatusCode';

import { IQueryBus } from '@shared/domain/query/QueryBus';
import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';

export class ListFlowsController {
  constructor(private readonly queryBus: IQueryBus) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const instanceId = req.query.instanceId as string;

      const audit = new AuditDataBuilder('READ', 'FLOW')
        .withResourceId(instanceId)
        .withRequest(req.ip, req.get('user-agent'))
        .build();

      const query = new ListFlowsQuery(instanceId);
      const response = await this.queryBus.ask(query);

      ResponseHandler.success(
        res,
        response.content,
        'Flows retrieved successfully',
        StatusCode.SuccessOK,
        audit
      );
    } catch (error) {
      next(error);
    }
  }
}
