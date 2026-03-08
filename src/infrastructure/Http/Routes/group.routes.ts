import { NextFunction, Request, Response, Router } from 'express';
import { ContainerBuilder } from 'node-dependency-injection';

import { validate } from '../middlewares/ValidationMiddleware';
import {
  addParticipantsSchema,
  createGroupSchema,
  removeParticipantsSchema,
} from '../validators/express/schemas/groupsSchema';

export const createGroupRouter = (container: ContainerBuilder): Router => {
  const router = Router();
  const createController = container.get('http.controller.groups.create_group');
  const addParticipants = container.get('http.controller.groups.add_participants');
  const removeParticipants = container.get('http.controller.groups.remove_participants');

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
