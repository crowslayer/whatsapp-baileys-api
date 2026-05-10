import { NextFunction, Request, Response } from 'express';

import { CampaignId } from '@domain/campaign/CampaignId';
import { Description } from '@domain/campaign/Description';
import { InstanceId } from '@domain/value-objects/InstanceId';
import { Name } from '@domain/value-objects/Name';

import { UpdateCampaignCommand } from '@application/campaign/update/UpdateCampaignCommand';

import { StatusCode } from '@infrastructure/http/StatusCode';

import { ICommandBus } from '@shared/domain/commands/CommandBus';
import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';
import { normalizeBulk } from '@shared/infrastructure/utils/normalizeBulk';

export class UpdateCampaignController {
  constructor(private readonly commandBus: ICommandBus) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instanceId, name, description, message, numbers } = req.body;
      const { id } = req.params;

      const { valid, invalid } = normalizeBulk(numbers);

      const audit = new AuditDataBuilder('UPDATE', 'CAMPAIGN')
        .withRequest(req.ip, req.get('user-agent'))
        .withDetails({ name })
        .build();

      const command = new UpdateCampaignCommand({
        campaignId: CampaignId.fromString(id),
        instanceId: InstanceId.fromString(instanceId),
        name: Name.create(name),
        description: Description.create(description),
        message,
        numbers: valid,
      });

      await this.commandBus.dispatch<void>(command);

      const content = {
        campaign: {
          name,
          numbers: {
            valid: valid.length,
            invalid: invalid.length,
          },
        },
      };

      ResponseHandler.success(
        res,
        content,
        'Campaign created successfully',
        StatusCode.SuccessOK,
        audit
      );
    } catch (error) {
      next(error);
    }
  }
}
