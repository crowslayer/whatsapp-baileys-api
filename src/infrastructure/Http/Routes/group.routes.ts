import { NextFunction, Request, Response, Router } from 'express';
import { ContainerBuilder } from 'node-dependency-injection';

import { validate } from '@infrastructure/http/middlewares/ValidationMiddleware';
import {
  addParticipantsSchema,
  createGroupSchema,
  removeParticipantsSchema,
} from '@infrastructure/http/validators/express/schemas/groupsSchema';
import { instanceIdSchema } from '@infrastructure/http/validators/express/schemas/instanceSchema';

export const createGroupRouter = (container: ContainerBuilder): Router => {
  const router = Router();
  const createController = container.get('http.controller.groups.create_group');
  const addParticipants = container.get('http.controller.groups.add_participants');
  const removeParticipants = container.get('http.controller.groups.remove_participants');
  const listGroupsController = container.get('http.controller.groups.list_group');

  router.get(
    '/:instanceId/groups',
    validate(instanceIdSchema),
    (req: Request, res: Response, next: NextFunction) => listGroupsController.handle(req, res, next)
  );

  router.post(
    '/:instanceId/groups',
    validate(createGroupSchema),
    (req: Request, res: Response, next: NextFunction) => createController.handle(req, res, next)
  );

  router.post(
    '/:instanceId/groups/:groupId/participants/add',
    validate(addParticipantsSchema),
    (req: Request, res: Response, next: NextFunction) => addParticipants.handle(req, res, next)
  );

  router.post(
    '/:instanceId/groups/:groupId/participants/remove',
    validate(removeParticipantsSchema),
    (req: Request, res: Response, next: NextFunction) => removeParticipants.handle(req, res, next)
  );

  return router;
};
