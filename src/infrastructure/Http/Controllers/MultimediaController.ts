import { Request, Response, NextFunction } from 'express';
import { SendAudioCommand } from '@application/Commands/SendAudioCommand';
import { SendContactCommand } from '@application/Commands/SendContactCommand';
import { SendDocumentCommand } from '@application/Commands/SendDocumentCommand';
import { SendImageCommand } from '@application/Commands/SendImageCommand';
import { SendLocationCommand } from '@application/Commands/SendLocationCommand';
import { SendReactionCommand } from '@application/Commands/SendReactionCommand';
import { SendStickerCommand } from '@application/Commands/SendStickerCommand';
import { SendVideoCommand } from '@application/Commands/SendVideoCommand';
import { SendAudioHandler } from '@application/Handlers/SendAudioHandler';
import { SendContactHandler } from '@application/Handlers/SendContactHandler';
import { SendDocumentHandler } from '@application/Handlers/SendDocumentHandler';
import { SendImageHandler } from '@application/Handlers/SendImageHandler';
import { SendLocationHandler } from '@application/Handlers/SendLocationHandler';
import { SendReactionHandler } from '@application/Handlers/SendReactionHandler';
import { SendStickerHandler } from '@application/Handlers/SendStickerHandler';
import { SendVideoHandler } from '@application/Handlers/SendVideoHandler';
import { IWhatsAppInstanceRepository } from '@domain/Repositories/IWhatsAppInstanceRepository';
import { BaileysConnectionManager } from '@infrastructure/Baileys/BaileysConnectionManager';
import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';
import pino from 'pino';
export class MultimediaController {
    private logger = pino();
  
    constructor(
      private repository: IWhatsAppInstanceRepository,
      private connectionManager: BaileysConnectionManager
    ) {}
  
    async sendImage(req: Request, res: Response): Promise<Response> {
      try {
        const { instanceId } = req.params;
        const { to, caption, fileName } = req.body;
  
        if (!req.file) {
          return ResponseHandler.badRequest(res, 'Image file is required');
        }
  
        const audit = new AuditDataBuilder('SEND', 'IMAGE')
          .withResourceId(instanceId)
          .withRequest(req.ip, req.get('user-agent'))
          .withDetails({ to, fileSize: req.file.size })
          .build();
  
        const handler = new SendImageHandler(this.repository, this.connectionManager);
        const command = new SendImageCommand(instanceId, to, req.file.buffer, caption, fileName);
        await handler.execute(command);
  
        this.logger.info(`Image sent from instance ${instanceId} to ${to}`);
  
        return ResponseHandler.success(res, { sent: true }, 'Image sent successfully', 200, audit);
      } catch (error: any) {
        this.logger.error('Error sending image:', error);
        return this.handleError(error, res, req);
      }
    }
  
    async sendDocument(req: Request, res: Response): Promise<Response> {
      try {
        const { instanceId } = req.params;
        const { to, caption } = req.body;
  
        if (!req.file) {
          return ResponseHandler.badRequest(res, 'Document file is required');
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
  
        this.logger.info(`Document sent from instance ${instanceId} to ${to}`);
  
        return ResponseHandler.success(res, { sent: true }, 'Document sent successfully', 200, audit);
      } catch (error: any) {
        this.logger.error('Error sending document:', error);
        return this.handleError(error, res, req);
      }
    }
  
    async sendAudio(req: Request, res: Response): Promise<Response> {
      try {
        const { instanceId } = req.params;
        const { to, ptt } = req.body;
  
        if (!req.file) {
          return ResponseHandler.badRequest(res, 'Audio file is required');
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
  
        this.logger.info(`Audio sent from instance ${instanceId} to ${to}`);
  
        return ResponseHandler.success(res, { sent: true }, 'Audio sent successfully', 200, audit);
      } catch (error: any) {
        this.logger.error('Error sending audio:', error);
        return this.handleError(error, res, req);
      }
    }
  
    async sendVideo(req: Request, res: Response): Promise<Response> {
      try {
        const { instanceId } = req.params;
        const { to, caption, gifPlayback, fileName } = req.body;
  
        if (!req.file) {
          return ResponseHandler.badRequest(res, 'Video file is required');
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
  
        this.logger.info(`Video sent from instance ${instanceId} to ${to}`);
  
        return ResponseHandler.success(res, { sent: true }, 'Video sent successfully', 200, audit);
      } catch (error: any) {
        this.logger.error('Error sending video:', error);
        return this.handleError(error, res, req);
      }
    }
  
    async sendLocation(req: Request, res: Response): Promise<Response> {
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
  
        this.logger.info(`Location sent from instance ${instanceId} to ${to}`);
  
        return ResponseHandler.success(res, { sent: true }, 'Location sent successfully', 200, audit);
      } catch (error: any) {
        this.logger.error('Error sending location:', error);
        return this.handleError(error, res, req);
      }
    }
  
    async sendReaction(req: Request, res: Response): Promise<Response> {
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

        this.logger.info(`Reaction sent from instance ${instanceId}`);

        return ResponseHandler.success(res, { sent: true }, 'Reaction sent successfully', 200, audit);
      } catch (error: any) {
        this.logger.error('Error sending reaction:', error);
        return this.handleError(error, res, req);
      }
    }

    async sendContact(req: Request, res: Response): Promise<Response> {
      try {
        const { instanceId } = req.params;
        const { to, contacts } = req.body;

        if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
          return ResponseHandler.badRequest(res, 'At least one contact with displayName and vcard is required');
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

        this.logger.info(`Contact(s) sent from instance ${instanceId} to ${to}`);

        return ResponseHandler.success(res, { sent: true }, 'Contact(s) sent successfully', 200, audit);
      } catch (error: any) {
        this.logger.error('Error sending contact:', error);
        return this.handleError(error, res, req);
      }
    }

    async sendSticker(req: Request, res: Response): Promise<Response> {
      try {
        const { instanceId } = req.params;
        const { to } = req.body;

        if (!req.file) {
          return ResponseHandler.badRequest(res, 'Sticker file is required');
        }

        const audit = new AuditDataBuilder('SEND', 'STICKER')
          .withResourceId(instanceId)
          .withRequest(req.ip, req.get('user-agent'))
          .withDetails({ to, fileSize: req.file.size })
          .build();

        const handler = new SendStickerHandler(this.repository, this.connectionManager);
        const command = new SendStickerCommand(instanceId, to, req.file.buffer);
        await handler.execute(command);

        this.logger.info(`Sticker sent from instance ${instanceId} to ${to}`);

        return ResponseHandler.success(res, { sent: true }, 'Sticker sent successfully', 200, audit);
      } catch (error: any) {
        this.logger.error('Error sending sticker:', error);
        return this.handleError(error, res, req);
      }
    }

    private handleError(error: any, res: Response, req: Request): Response {
      const audit = new AuditDataBuilder('ERROR', 'MULTIMEDIA')
        .withRequest(req.ip, req.get('user-agent'))
        .withDetails({ error: error.message })
        .build();
  
      if (error.name === 'ValidationError') {
        return ResponseHandler.badRequest(res, error.message, error.fields, audit);
      }
      if (error.name === 'NotFoundError') {
        return ResponseHandler.notFound(res, error.message, audit);
      }
      return ResponseHandler.internalError(res, error.message, undefined, audit);
    }
  }