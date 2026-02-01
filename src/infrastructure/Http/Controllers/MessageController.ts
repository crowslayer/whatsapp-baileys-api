import { SendMessageCommand } from '@application/Commands/SendMessageCommand';
import { SendMessageHandler } from '@application/Handlers/SendMessageHandler';
import { IWhatsAppInstanceRepository } from '@domain/Repositories/IWhatsAppInstanceRepository';
import { BaileysConnectionManager } from '@infrastructure/Baileys/BaileysConnectionManager';
import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';
import { Request, Response, NextFunction } from 'express';
import pino from 'pino';

export class MessageController {
    private logger = pino();
  
    constructor(
      private repository: IWhatsAppInstanceRepository,
      private connectionManager: BaileysConnectionManager
    ) {}
  
    async send(req: Request, res: Response): Promise<Response> {
      try {
        const { instanceId } = req.params;
        const { to, message } = req.body;
  
        const audit = new AuditDataBuilder('SEND', 'MESSAGE')
          .withResourceId(instanceId)
          .withRequest(req.ip, req.get('user-agent'))
          .withDetails({ to, messageLength: message.length })
          .build();
  
        const handler = new SendMessageHandler(this.repository, this.connectionManager);
        const command = new SendMessageCommand(instanceId, to, message);
        await handler.execute(command);
  
        this.logger.info(`Message sent from instance ${instanceId} to ${to}`);
  
        return ResponseHandler.success(res, { sent: true }, 'Message sent successfully', 200, audit);
      } catch (error: any) {
        this.logger.error('Error sending message:', error);
        return this.handleError(error, res, req);
      }
    }
  
    private handleError(error: any, res: Response, req: Request): Response {
      const audit = new AuditDataBuilder('ERROR', 'MESSAGE')
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