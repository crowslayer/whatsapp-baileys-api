import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../Middlewares/ValidationMiddleware';
import { IWhatsAppInstanceRepository } from '@domain/Repositories/IWhatsAppInstanceRepository';
import { BaileysConnectionManager } from '@infrastructure/Baileys/BaileysConnectionManager';
import { MessageController } from '../Controllers/MessageController';
export const createMessageRouter = (
    repository: IWhatsAppInstanceRepository,
    connectionManager: BaileysConnectionManager
  ): Router => {
    const router = Router();
    const controller = new MessageController(repository, connectionManager);
  
    router.post(
      '/:instanceId/send',
      validate([
        param('instanceId').isString().notEmpty(),
        body('to').isString().notEmpty().withMessage('Recipient is required'),
        body('message').isString().notEmpty().withMessage('Message is required'),
      ]),
      (req, res) => controller.send(req, res)
    );
  
    return router;
  };
  