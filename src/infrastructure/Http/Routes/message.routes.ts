import { NextFunction, Request, Response, Router } from 'express';
import { ContainerBuilder } from 'node-dependency-injection';

import { validate } from '../middlewares/ValidationMiddleware';
import { messageSchema } from '../validators/express/schemas/messageSchema';

export const createMessageRouter = (container: ContainerBuilder): Router => {
  const router = Router();
  const textController = container.get('http.controller.messages.send_text_message');
  router.post(
    '/:instanceId/send',
    validate(messageSchema),
    (req: Request, res: Response, next: NextFunction) => textController.handle(req, res, next)
  );

  return router;
};
