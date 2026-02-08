import { NextFunction, Request, Response, Router } from 'express';
import { body, param } from 'express-validator';

import { IWhatsAppInstanceRepository } from '../../../domain/repositories/IWhatsAppInstanceRepository.js';
import { BaileysConnectionManager } from '../../baileys/BaileysConnectionManager.js';
import { MessageController } from '../controllers/MessageController';
import { validate } from '../middlewares/ValidationMiddleware';
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
    (req: Request, res: Response, next: NextFunction) => controller.send(req, res, next)
  );

  return router;
};
