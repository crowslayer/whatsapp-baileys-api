import { NextFunction, Request, Response, Router } from 'express';

import { IWhatsAppInstanceRepository } from '../../../domain/repositories/IWhatsAppInstanceRepository.js';
import { BaileysConnectionManager } from '../../baileys/BaileysConnectionManager.js';
import { SendTextController } from '../controllers/messages/SendTextController.js';
import { validate } from '../middlewares/ValidationMiddleware';
import { messageSchema } from '../validators/express/schemas/messageSchema';
export const createMessageRouter = (
  repository: IWhatsAppInstanceRepository,
  connectionManager: BaileysConnectionManager
): Router => {
  const router = Router();
  const textController = new SendTextController(repository, connectionManager);
  router.post(
    '/:instanceId/send',
    validate(messageSchema),
    (req: Request, res: Response, next: NextFunction) => textController.handle(req, res, next)
  );

  return router;
};
