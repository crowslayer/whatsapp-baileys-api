import express, { Express } from 'express';
import { ContainerBuilder } from 'node-dependency-injection';

import { CreateInstanceController } from '@apps/backend/http/controllers/instances/CreateInstanceController';
import { DeleteInstanceController } from '@apps/backend/http/controllers/instances/DeleteInstanceController';
import { GetInstanceController } from '@apps/backend/http/controllers/instances/GetInstanceController';
import { GetInstancesController } from '@apps/backend/http/controllers/instances/GetInstancesController';
import { SendTextController } from '@apps/backend/http/controllers/messages/SendTextController';
import { createInstanceRouter } from '@apps/backend/http/routes/instance.routes';
import { createMessageRouter } from '@apps/backend/http/routes/message.routes';
import { errorMiddleware } from '@apps/backend/http/middlewares/ErrorMiddleware';
import { ILogger } from '@shared/domain/Logger';
import { Command } from '@shared/domain/command/Command';
import { ICommandBus } from '@shared/domain/command/CommandBus';
import { IQueryBus } from '@shared/domain/query/QueryBus';
import { ResponseBuilder } from '@shared/infrastructure/http/response/ResponseBuilder';
import { MongoInstanceReadRepository } from '@modules/instances/infrastructure/persistence/mongo/MongoInstanceReadRepository';
import { MongoInstanceRepository } from '@modules/instances/infrastructure/persistence/mongo/MongoInstanceRepository';
import { InstancesCreator } from '@modules/instances/application/create/InstancesCreator';
import { CreateInstanceCommand } from '@modules/instances/application/create/CreateInstanceCommand';
import { DeleteInstanceCommand } from '@modules/instances/application/delete/DeleteInstanceCommand';
import { InstancesEraser } from '@modules/instances/application/delete/InstancesEraser';
import { FindInstance } from '@modules/instances/application/get/FindInstance';
import { GetInstanceQuery } from '@modules/instances/application/get/GetInstanceQuery';
import { GetInstanceQueryHandler } from '@modules/instances/application/get/GetInstanceQueryHandler';
import { InstancesSearcher } from '@modules/instances/application/list/InstancesSearcher';
import { ListInstancesQuery } from '@modules/instances/application/list/ListInstancesQuery';

const logger = {
  error: () => undefined,
  warn: () => undefined,
  info: () => undefined,
  debug: () => undefined,
} as unknown as ILogger;

export function createApiTestApplication(sendTextController?: SendTextController): Express {
  const instanceRepository = new MongoInstanceRepository();
  const instanceReadRepository = new MongoInstanceReadRepository();
  const runtimeManager = {
    stop: async () => undefined,
  } as unknown as import('@shared/domain/whatsapp/IRuntimeManager').IRuntimeManager;
  const createUseCase = new InstancesCreator(instanceRepository);
  const deleteUseCase = new InstancesEraser(instanceRepository, runtimeManager);
  const findInstance = new FindInstance(instanceReadRepository);
  const searchInstances = new InstancesSearcher(instanceReadRepository);

  const commandBus: ICommandBus = {
    dispatch: async <TResponse>(command: Command<TResponse>): Promise<TResponse> => {
      if (command instanceof CreateInstanceCommand) {
        const instance = await createUseCase.execute(command);
        return { content: instance.toPrimitives() } as TResponse;
      }
      if (command instanceof DeleteInstanceCommand) {
        await deleteUseCase.execute(command);
        return undefined as TResponse;
      }
      throw new Error(`Unhandled command ${command.constructor.name}`);
    },
  };

  const queryBus = {
    ask: async (query: unknown) => {
      if (query instanceof ListInstancesQuery) {
        const instances = await searchInstances.execute();
        return { content: instances };
      }
      if (query instanceof GetInstanceQuery) {
        return new GetInstanceQueryHandler(findInstance).handle(query);
      }
      throw new Error(`Unhandled query ${String(query)}`);
    },
  } as unknown as IQueryBus;

  const unusedController = {
    handle: async () => ResponseBuilder.ok(null),
    renderQRPage: async () => undefined,
  };
  const services = new Map<string, unknown>([
    ['http.controller.get_qr', unusedController],
    ['http.controller.instance.creator', new CreateInstanceController(commandBus)],
    ['http.controller.instances.get.instances', new GetInstancesController(queryBus)],
    ['http.controller.instances.get.instance', new GetInstanceController(queryBus)],
    ['http.controller.qr_status', unusedController],
    ['http.controller.instance.eraser', new DeleteInstanceController(commandBus)],
    ['http.controller.instance.disconect', unusedController],
    ['http.controller.instance.connect', unusedController],
  ]);

  if (sendTextController) {
    services.set('http.controller.messages.send_text_message', sendTextController);
  }

  const container = {
    get: (id: string) => {
      const service = services.get(id);
      if (!service) throw new Error(`Missing test service ${id}`);
      return service;
    },
  } as unknown as ContainerBuilder;

  const app = express();
  app.use(express.json());
  app.use('/instances', createInstanceRouter(container));
  if (sendTextController) app.use('/messages', createMessageRouter(container));
  app.use(errorMiddleware(logger));
  return app;
}
