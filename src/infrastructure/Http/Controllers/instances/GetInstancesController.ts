import { NextFunction, Request, Response } from 'express';

import { ListInstancesQuery } from '@application/instances/list/ListInstancesQuery';

import { IQueryBus } from '@shared/domain/query/QueryBus';
import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';

export class GetInstancesController {
  constructor(private readonly queryBus: IQueryBus) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const audit = new AuditDataBuilder('LIST', 'INSTANCE')
        .withRequest(req.ip, req.get('user-agent'))
        .build();

      const query = new ListInstancesQuery();
      const instances = await this.queryBus.ask(query);
      const data = instances.content;

      ResponseHandler.success(res, data, 'Instances retrieved successfully', 200, audit);
    } catch (error) {
      next(error);
    }
  }
}
