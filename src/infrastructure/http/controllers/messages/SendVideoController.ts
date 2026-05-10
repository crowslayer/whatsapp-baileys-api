import { NextFunction, Request, Response } from 'express';

import { SendVideoCommand } from '@application/messages/video/SendVideoCommand';

import { ICommandBus } from '@shared/domain/commands/CommandBus';
import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { NotFoundError } from '@shared/infrastructure/errors/NotFoundError';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';
import { PhoneNormalizer } from '@shared/infrastructure/utils/PhoneNormalizer';

export class SendVideoController {
  constructor(private readonly commandBus: ICommandBus) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instanceId } = req.params;
      const { to, caption, gifPlayback, fileName } = req.body;

      if (!req.file) {
        throw new NotFoundError('Video file is required');
      }

      const audit = new AuditDataBuilder('SEND', 'VIDEO')
        .withResourceId(instanceId)
        .withRequest(req.ip, req.get('user-agent'))
        .withDetails({ to, gifPlayback: gifPlayback === 'true', fileSize: req.file.size })
        .build();

      const normalizer = new PhoneNormalizer();
      const jid = normalizer.toJid(to);
      if (!jid) {
        throw new Error('Phone invalid');
      }

      const command = new SendVideoCommand(
        instanceId,
        jid,
        req.file.buffer,
        caption,
        gifPlayback === 'true',
        fileName
      );
      await this.commandBus.dispatch(command);

      ResponseHandler.success(res, { sent: true }, 'Video sent successfully', 200, audit);
    } catch (error) {
      next(error);
    }
  }
}
