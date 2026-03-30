import { NextFunction, Request, Response, Router } from 'express';
import { ContainerBuilder } from 'node-dependency-injection';

import { validate } from '@infrastructure/http/middlewares/ValidationMiddleware';
import { instanceIdSchema } from '@infrastructure/http/validators/express/schemas/instanceSchema';

export const createChatsRouter = (container: ContainerBuilder): Router => {
  const router = Router();
  const qetLisChatontroller = container.get('http.controller.chats.list_chats');

  router.get(
    '/:instanceId/chats',
    validate(instanceIdSchema),
    (req: Request, res: Response, next: NextFunction) => qetLisChatontroller.handle(req, res, next)
  );

  return router;
};
