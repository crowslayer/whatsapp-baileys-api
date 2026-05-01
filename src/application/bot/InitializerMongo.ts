import { FlowEngine } from './FlowEngine';
import { FlowTriggerResolver } from './FlowTriggerResolver';
import { InputNodeExecutor } from './InputNodeExecutor';
import { MessageNodeExecutor } from './MessageNodeExecutor';
import { IConversationStore } from './IConversationStore';
import { IMessageService } from '@infrastructure/baileys/adapter/IMessageService';
import { MongoFlowRepository } from '../../infrastructure/persistence/Mongo/Repositories/MongoFlowRepository';
import { FlowStore } from '../../infrastructure/persistence/Mongo/Repositories/FlowStore';
import { BotServiceMongo } from './BotServiceMongo';

import { BotListener } from '../../Baileys/adapter/BotListener';

export function createBotMongoEngine(store: IConversationStore, messaging: IMessageService) {
  const triggerResolver = new FlowTriggerResolver();
  const flowEngine = new FlowEngine([new InputNodeExecutor(), new MessageNodeExecutor()]);
  const flowRepo = new MongoFlowRepository();
  const flowStore = new FlowStore(flowRepo);
  // Return the engine instance; BotListener can be bound later when a socket is available
  return new BotServiceMongo(triggerResolver, flowEngine, store, messaging, flowRepo, flowStore);
}

export function createBotListenerForInstance(botService: any, instanceId: string): BotListener {
  return new BotListener(botService, instanceId);
}
