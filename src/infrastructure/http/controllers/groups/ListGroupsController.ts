import { NextFunction, Request, Response } from 'express';

import { GroupsQuery } from '@application/groups/list/GroupsQuery';
import { GroupsResponse } from '@application/groups/list/GroupsResponse';

import { IQueryBus } from '@shared/domain/query/QueryBus';
import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';

export class ListGroupsController {
  constructor(private readonly queryBus: IQueryBus) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const audit = new AuditDataBuilder('LIST', 'GROUPS')
        .withRequest(req.ip, req.get('user-agent'))
        .build();
      const { instanceId } = req.params;

      const query = new GroupsQuery(instanceId);
      const result = await this.queryBus.ask<GroupsResponse>(query);
      const data = result.content;

      ResponseHandler.success(res, data, 'Instances retrieved successfully', 200, audit);
    } catch (error) {
      next(error);
    }
  }
}
