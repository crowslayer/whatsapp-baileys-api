import { NextFunction, Request, Response } from 'express';
import pino from 'pino';

import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';

import { SendAudioCommand } from '@application/commands/SendAudioCommand';
import { SendContactCommand } from '@application/commands/SendContactCommand';
import { SendDocumentCommand } from '@application/commands/SendDocumentCommand';
import { SendImageCommand } from '@application/commands/SendImageCommand';
import { SendLocationCommand } from '@application/commands/SendLocationCommand';
import { SendReactionCommand } from '@application/commands/SendReactionCommand';
import { SendStickerCommand } from '@application/commands/SendStickerCommand';
import { SendVideoCommand } from '@application/commands/SendVideoCommand';
import { SendAudioHandler } from '@application/handlers/SendAudioHandler';
import { SendContactHandler } from '@application/handlers/SendContactHandler';
import { SendDocumentHandler } from '@application/handlers/SendDocumentHandler';
import { SendImageHandler } from '@application/handlers/SendImageHandler';
import { SendLocationHandler } from '@application/handlers/SendLocationHandler';
import { SendReactionHandler } from '@application/handlers/SendReactionHandler';
import { SendStickerHandler } from '@application/handlers/SendStickerHandler';
import { SendVideoHandler } from '@application/handlers/SendVideoHandler';

import { BaileysConnectionManager } from '@infrastructure/baileys/BaileysConnectionManager';

import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { NotFoundError } from '@shared/infrastructure/errors/NotFoundError';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';
export class MultimediaController {
  private _logger = pino();

  constructor(
    private repository: IWhatsAppInstanceRepository,
    private connectionManager: BaileysConnectionManager
  ) {}

  async sendImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instanceId } = req.params;
      const { to, caption, fileName } = req.body;

      if (!req.file) {
        throw new NotFoundError('Image file is required');
      }

      const audit = new AuditDataBuilder('SEND', 'IMAGE')
        .withResourceId(instanceId)
        .withRequest(req.ip, req.get('user-agent'))
        .withDetails({ to, fileSize: req.file.size })
        .build();

      const handler = new SendImageHandler(this.repository, this.connectionManager);
      const command = new SendImageCommand(instanceId, to, req.file.buffer, caption, fileName);
      await handler.execute(command);

      this._logger.info(`Image sent from instance ${instanceId} to ${to}`);

      return ResponseHandler.success(res, { sent: true }, 'Image sent successfully', 200, audit);
    } catch (error: any) {
      next(error);
    }
  }

  async sendDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instanceId } = req.params;
      const { to, caption } = req.body;

      if (!req.file) {
        throw new NotFoundError('Document file is required');
      }

      const audit = new AuditDataBuilder('SEND', 'DOCUMENT')
        .withResourceId(instanceId)
        .withRequest(req.ip, req.get('user-agent'))
        .withDetails({ to, fileName: req.file.originalname, fileSize: req.file.size })
        .build();

      const handler = new SendDocumentHandler(this.repository, this.connectionManager);
      const command = new SendDocumentCommand(
        instanceId,
        to,
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        caption
      );
      await handler.execute(command);

      this._logger.info(`Document sent from instance ${instanceId} to ${to}`);

      return ResponseHandler.success(res, { sent: true }, 'Document sent successfully', 200, audit);
    } catch (error: any) {
      next(error);
    }
  }

  async sendAudio(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      const handler = new SendAudioHandler(this.repository, this.connectionManager);
      const command = new SendAudioCommand(
        instanceId,
        to,
        req.file.buffer,
        ptt === 'true',
        req.file.mimetype
      );
      await handler.execute(command);

      this._logger.info(`Audio sent from instance ${instanceId} to ${to}`);

      return ResponseHandler.success(res, { sent: true }, 'Audio sent successfully', 200, audit);
    } catch (error: any) {
      next(error);
    }
  }

  async sendVideo(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      const handler = new SendVideoHandler(this.repository, this.connectionManager);
      const command = new SendVideoCommand(
        instanceId,
        to,
        req.file.buffer,
        caption,
        gifPlayback === 'true',
        fileName
      );
      await handler.execute(command);

      this._logger.info(`Video sent from instance ${instanceId} to ${to}`);

      return ResponseHandler.success(res, { sent: true }, 'Video sent successfully', 200, audit);
    } catch (error: any) {
      next(error);
    }
  }

  async sendLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instanceId } = req.params;
      const { to, latitude, longitude, name, address } = req.body;

      const audit = new AuditDataBuilder('SEND', 'LOCATION')
        .withResourceId(instanceId)
        .withRequest(req.ip, req.get('user-agent'))
        .withDetails({ to, latitude, longitude })
        .build();

      const handler = new SendLocationHandler(this.repository, this.connectionManager);
      const command = new SendLocationCommand(
        instanceId,
        to,
        parseFloat(latitude),
        parseFloat(longitude),
        name,
        address
      );
      await handler.execute(command);

      this._logger.info(`Location sent from instance ${instanceId} to ${to}`);

      return ResponseHandler.success(res, { sent: true }, 'Location sent successfully', 200, audit);
    } catch (error: any) {
      next(error);
    }
  }

  async sendReaction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instanceId } = req.params;
      const { messageId, emoji, chatId } = req.body;

      const audit = new AuditDataBuilder('SEND', 'REACTION')
        .withResourceId(instanceId)
        .withRequest(req.ip, req.get('user-agent'))
        .withDetails({ messageId, emoji, chatId })
        .build();

      const handler = new SendReactionHandler(this.repository, this.connectionManager);
      const command = new SendReactionCommand(instanceId, messageId, emoji, chatId);
      await handler.execute(command);

      this._logger.info(`Reaction sent from instance ${instanceId}`);

      return ResponseHandler.success(res, { sent: true }, 'Reaction sent successfully', 200, audit);
    } catch (error: any) {
      next(error);
    }
  }

  async sendContact(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instanceId } = req.params;
      const { to, contacts } = req.body;

      if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
        throw new NotFoundError('At least one contact with displayName and vcard is required');
      }

      const validContacts = contacts.map((c: { displayName?: string; vcard?: string }) => ({
        displayName: c.displayName || 'Contact',
        vcard: c.vcard || '',
      }));

      const audit = new AuditDataBuilder('SEND', 'CONTACT')
        .withResourceId(instanceId)
        .withRequest(req.ip, req.get('user-agent'))
        .withDetails({ to, contactCount: validContacts.length })
        .build();

      const handler = new SendContactHandler(this.repository, this.connectionManager);
      const command = new SendContactCommand(instanceId, to, validContacts);
      await handler.execute(command);

      this._logger.info(`Contact(s) sent from instance ${instanceId} to ${to}`);

      return ResponseHandler.success(
        res,
        { sent: true },
        'Contact(s) sent successfully',
        200,
        audit
      );
    } catch (error: any) {
      next(error);
    }
  }

  async sendSticker(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      const handler = new SendStickerHandler(this.repository, this.connectionManager);
      const command = new SendStickerCommand(instanceId, to, req.file.buffer);
      await handler.execute(command);

      this._logger.info(`Sticker sent from instance ${instanceId} to ${to}`);

      return ResponseHandler.success(res, { sent: true }, 'Sticker sent successfully', 200, audit);
    } catch (error: any) {
      next(error);
    }
  }
}
