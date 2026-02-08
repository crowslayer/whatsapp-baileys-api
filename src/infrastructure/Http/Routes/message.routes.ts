import { NextFunction, Request, Response, Router } from 'express';
import { body, param } from 'express-validator';

import { IWhatsAppInstanceRepository } from '../../../domain/repositories/IWhatsAppInstanceRepository.js';
import { BaileysConnectionManager } from '../../baileys/BaileysConnectionManager.js';
import { SendTextController } from '../controllers/messages/SendTextController.js';
import { validate } from '../middlewares/ValidationMiddleware';
export const createMessageRouter = (
  repository: IWhatsAppInstanceRepository,
  connectionManager: BaileysConnectionManager
): Router => {
  const router = Router();
  const textController = new SendTextController(repository, connectionManager);
  router.post(
    '/:instanceId/send',
    validate([
      param('instanceId').isString().notEmpty(),
      body('to').isString().notEmpty().withMessage('Recipient is required'),
      body('message').isString().notEmpty().withMessage('Message is required'),
    ]),
    (req: Request, res: Response, next: NextFunction) => textController.handle(req, res, next)
  );

  return router;
};
