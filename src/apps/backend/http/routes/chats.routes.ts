import { Router } from 'express';
import { ContainerBuilder } from 'node-dependency-injection';

import { ControllerAdapter } from '@apps/backend/http/controllers/ControllerAdapter';
import { validate } from '@apps/backend/http/middlewares/ValidationMiddleware';
import { instanceIdSchema } from '@apps/backend/http/validators/express/schemas/instanceSchema';

export const createChatsRouter = (container: ContainerBuilder): Router => {
  const router = Router();
  const qetLisChatontroller = container.get('http.controller.chats.list_chats');

  router.get(
    '/:instanceId/chats',
    validate(instanceIdSchema),
    ControllerAdapter(qetLisChatontroller)
  );

  return router;
};
