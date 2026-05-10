import { NextFunction, Request, Response } from 'express';

import { SendStickerCommand } from '@application/messages/sticker/SendStickerCommand';

import { StatusCode } from '@infrastructure/http/StatusCode';

import { ICommandBus } from '@shared/domain/commands/CommandBus';
import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { NotFoundError } from '@shared/infrastructure/errors/NotFoundError';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';
import { PhoneNormalizer } from '@shared/infrastructure/utils/PhoneNormalizer';

export class SendStickerController {
  constructor(private readonly commandBus: ICommandBus) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instanceId } = req.params;
      const { to } = req.body;

      if (!req.file) {
        throw new NotFoundError('Sticker file is required');
      }

      const audit = new AuditDataBuilder('SEND', 'STICKER')
        .withResourceId(instanceId)
        .withRequest(req.ip, req.get('user-agent'))
        .withDetails({ to, fileSize: req.file.size })
        .build();

      const normalizer = new PhoneNormalizer();
      const jid = normalizer.toJid(to);
      if (!jid) {
        throw new Error('Phone invalid');
      }

      const command = new SendStickerCommand(instanceId, jid, req.file.buffer);
      await this.commandBus.dispatch(command);

      ResponseHandler.success(
        res,
        { sent: true },
        'Sticker sent successfully',
        StatusCode.SuccessOK,
        audit
      );
    } catch (error) {
      next(error);
    }
  }
}
