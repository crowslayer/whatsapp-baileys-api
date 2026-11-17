import { Router } from 'express';
import { ContainerBuilder } from 'node-dependency-injection';

import { ControllerAdapter } from '@apps/backend/http/controllers/ControllerAdapter';
import { validate } from '@apps/backend/http/middlewares/ValidationMiddleware';
import { messageSchema } from '@apps/backend/http/validators/express/schemas/messageSchema';

export const createMessageRouter = (container: ContainerBuilder): Router => {
  const router = Router();
  const textController = container.get('http.controller.messages.send_text_message');
  router.post('/:instanceId/send', validate(messageSchema), ControllerAdapter(textController));

  return router;
};
