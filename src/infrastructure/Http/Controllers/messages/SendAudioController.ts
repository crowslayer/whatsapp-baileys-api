import { NextFunction, Request, Response } from 'express';

import { SendAudioCommand } from '@application/messages/audio/SendAudioCommand';

import { StatusCode } from '@infrastructure/http/StatusCode';

import { ICommandBus } from '@shared/domain/commands/CommandBus';
import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { NotFoundError } from '@shared/infrastructure/errors/NotFoundError';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';
import { PhoneNormalizer } from '@shared/infrastructure/utils/PhoneNormalizer';

export class SendAudioController {
  constructor(private readonly commandBus: ICommandBus) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instanceId } = req.params;
      const { to, ptt } = req.body;

      if (!req.file) {
        throw new NotFoundError('Audio file is required');
      }

      const audit = new AuditDataBuilder('SEND', 'AUDIO')
        .withResourceId(instanceId)
        .withRequest(req.ip, req.get('user-agent'))
        .withDetails({ to, ptt: ptt === 'true', fileSize: req.file.size })
        .build();

      const normalizer = new PhoneNormalizer();
      const jid = normalizer.toJid(to);
      if (!jid) {
        throw new Error('Phone invalid');
      }

      const command = new SendAudioCommand(
        instanceId,
        jid,
        req.file.buffer,
        ptt === 'true',
        req.file.mimetype
      );
      await this.commandBus.dispatch(command);

      ResponseHandler.success(
        res,
        { sent: true },
        'Audio sent successfully',
        StatusCode.SuccessOK,
        audit
      );
    } catch (error) {
      next(error);
    }
  }
}
