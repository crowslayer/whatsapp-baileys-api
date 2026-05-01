import { NextFunction, Request, Response } from 'express';

import { CampaignsResponse } from '@application/campaign/CampaignsResponse';
import { ListCampaignQuery } from '@application/campaign/find/list/ListCampaignQuery';

import { StatusCode } from '@infrastructure/http/StatusCode';

import { IQueryBus } from '@shared/domain/query/QueryBus';
import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';

export class ListCampaignsContrller {
  constructor(private readonly queryBus: IQueryBus) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { limit, skip } = req.params;

      const audit = new AuditDataBuilder('LIST', 'CAMPAIGN')
        .withRequest(req.ip, req.get('user-agent'))
        .withDetails({ campaign: 'LIST' })
        .build();

      const query = new ListCampaignQuery(parseInt(limit), parseInt(skip));

      const result = await this.queryBus.ask<CampaignsResponse>(query);

      const content = {
        campaigns: result.content,
      };

      ResponseHandler.success(
        res,
        content,
        'Campaigns list successfully',
        StatusCode.SuccessOK,
        audit
      );
    } catch (error) {
      next(error);
    }
  }
}
