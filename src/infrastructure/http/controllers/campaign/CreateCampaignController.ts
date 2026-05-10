import { NextFunction, Request, Response } from 'express';

import { Description } from '@domain/campaign/Description';
import { InstanceId } from '@domain/value-objects/InstanceId';
import { Name } from '@domain/value-objects/Name';

import { CreateCampaignCommand } from '@application/campaign/create/CreateCampaignCommand';

import { ICommandBus } from '@shared/domain/commands/CommandBus';
import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';
import { normalizeBulk } from '@shared/infrastructure/utils/normalizeBulk';

export class CreateCampaignController {
  constructor(private readonly commandBus: ICommandBus) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instanceId, name, description, message, numbers } = req.body;

      const { valid, invalid } = normalizeBulk(numbers);

      const audit = new AuditDataBuilder('CREATE', 'CAMPAIGN')
        .withRequest(req.ip, req.get('user-agent'))
        .withDetails({ name })
        .build();

      const command = new CreateCampaignCommand({
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

      ResponseHandler.created(res, content, 'Campaign created successfully', audit);
    } catch (error) {
      next(error);
    }
  }
}
