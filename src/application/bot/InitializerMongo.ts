import { FlowEngine } from './FlowEngine';
import { FlowTriggerResolver } from './FlowTriggerResolver';
import { InputNodeExecutor } from './InputNodeExecutor';
import { MessageNodeExecutor } from './MessageNodeExecutor';
import { IConversationStore } from './IConversationStore';
import { IMessageService } from '@infrastructure/baileys/adapter/IMessageService';
import { MongoFlowRepository } from '../../infrastructure/persistence/Mongo/Repositories/MongoFlowRepository';
import { FlowStore } from '../../infrastructure/persistence/Mongo/Repositories/FlowStore';
import { BotServiceMongo } from './BotServiceMongo';

export function createBotMongoEngine(store: IConversationStore, messaging: IMessageService) {
  const triggerResolver = new FlowTriggerResolver();
  const flowEngine = new FlowEngine([new InputNodeExecutor(), new MessageNodeExecutor()]);
  const flowRepo = new MongoFlowRepository();
  const flowStore = new FlowStore(flowRepo);
  return new BotServiceMongo(triggerResolver, flowEngine, store, messaging, flowRepo, flowStore);
}
