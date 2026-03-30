import { NextFunction, Request, Response } from 'express';

import { ChatsResponse } from '@application/chats/list/ChatsResponse';
import { GetChatsQuery } from '@application/chats/list/GetChatsQuery';

import { IQueryBus } from '@shared/domain/query/QueryBus';
import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';

export class ListChatsController {
  constructor(private readonly queryBus: IQueryBus) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const audit = new AuditDataBuilder('LIST', 'CHATS')
        .withRequest(req.ip, req.get('user-agent'))
        .build();
      const { instanceId } = req.params;

      const query = new GetChatsQuery(instanceId);
      const result = await this.queryBus.ask<ChatsResponse>(query);
      const data = result.content;

      ResponseHandler.success(res, data, 'Chats retrieved successfully', 200, audit);
    } catch (error) {
      next(error);
    }
  }
}
