import { NextFunction, Request, Response } from 'express';

import { GetInstanceQuery } from '@application/instances/get/GetInstanceQuery';

import { IQueryBus } from '@shared/domain/query/QueryBus';
import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';

export class GetInstanceController {
  constructor(private readonly queryBus: IQueryBus) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instanceId } = req.params;

      const audit = new AuditDataBuilder('READ', 'INSTANCE')
        .withResourceId(instanceId)
        .withRequest(req.ip, req.get('user-agent'))
        .build();

      const query = new GetInstanceQuery(instanceId);
      const instance = await this.queryBus.ask(query);

      ResponseHandler.success(res, instance.content, 'Instance retrieved successfully', 200, audit);
    } catch (error) {
      next(error);
    }
  }
}
