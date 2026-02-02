import { Router, Request, Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../Middlewares/ValidationMiddleware';
import { IWhatsAppInstanceRepository } from '../../../domain/Repositories/IWhatsAppInstanceRepository.js';
import { BaileysConnectionManager } from '../../Baileys/BaileysConnectionManager.js';
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
      (req:Request, res:Response, next:NextFunction) => controller.send(req, res, next)
    );
  
    return router;
  };
  