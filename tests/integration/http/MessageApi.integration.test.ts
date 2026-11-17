import { Server } from 'node:http';
import { AddressInfo } from 'node:net';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { SendTextController } from '@apps/backend/http/controllers/messages/SendTextController';
import { ICommandBus } from '@shared/domain/command/CommandBus';
import { EventSubscribers } from '@shared/infrastructure/event-bus/EventSubscribers';
import { InMemoryEventBus } from '@shared/infrastructure/event-bus/in-memory/InMemoryEventBus';
import { HumanBehaviorService } from '@shared/application/simulation/HumanBehaviorService';
import { IWhatsAppRuntime } from '@shared/domain/whatsapp/IWhatsAppRuntime';
import { MessageOrchestrator } from '@shared/application/services/MessageOrchestrator';
import { IRuntimeManager } from '@shared/domain/whatsapp/IRuntimeManager';
import { LimiterFactory } from '@modules/campaign/application/LimiterFactory';
import { InstanceAggregate } from '@modules/instances/domain/InstanceAggregate';
import { Name } from '@modules/instances/domain/Name';
import { MongoInstanceRepository } from '@modules/instances/infrastructure/persistence/mongo/MongoInstanceRepository';
import { WhatsAppInstanceModel } from '@modules/instances/infrastructure/persistence/mongo/WhatsAppInstanceModel';
import { MongoMessageReadRepository } from '@modules/messages/infrastructure/persistence/mongo/MongoMessageReadRepository';
import { MongoMessageRepository } from '@modules/messages/infrastructure/persistence/mongo/MongoMessageRepository';
import { SendMessageCommand } from '@modules/messages/application/text/SendMessageCommand';
import { SendMessageCommandHandler } from '@modules/messages/application/text/SendMessageCommandHandler';
import { TextMessageSender } from '@modules/messages/application/text/TextMessageSender';
import { StoreOutgoingMessageSubscriber } from '@modules/messages/application/events/subscribers/StoreOutgoingMessageSubscriber';
import { createApiTestApplication } from '../support/ApiTestApplication';
import { MongoTestDatabase } from '../support/MongoTestDatabase';

describe('Message API integration', () => {
  const database = new MongoTestDatabase();
  const messageId = 'f0e22560-0e65-4b4f-a4d6-e760dbb5986b';
  const chatId = '5215512345678@s.whatsapp.net';
  const sendText = vi.fn(async (to: string, text: string) => ({
    messageId,
    chatId: to,
    timestamp: new Date('2026-01-01T00:00:00.000Z'),
    senderId: '5215555555555@s.whatsapp.net',
    content: { messageType: 'text' as const, text },
  }));
  const runtime = { messaging: { sendText } } as unknown as IWhatsAppRuntime;
  const runtimeManager = { get: () => runtime } as unknown as IRuntimeManager;
  const eventBus = new InMemoryEventBus();
  const messageRepository = new MongoMessageRepository();
  const subscriber = new StoreOutgoingMessageSubscriber(messageRepository);
  const subscribers = new EventSubscribers([subscriber]);
  eventBus.addSubscribers(subscribers);
  const human = {
    simulateTyping: async () => undefined,
    simulateAfterSend: async () => undefined,
  } as unknown as HumanBehaviorService;
  const orchestrator = new MessageOrchestrator(
    runtimeManager,
    new LimiterFactory(),
    human,
    eventBus
  );
  const sender = new TextMessageSender(new MongoInstanceRepository(), orchestrator);
  const handler = new SendMessageCommandHandler(sender);
  const commandBus: ICommandBus = {
    dispatch: async <TResponse>(
      command: import('@shared/domain/command/Command').Command<TResponse>
    ) => {
      if (command instanceof SendMessageCommand) {
        return (await handler.handle(command)) as TResponse;
      }
      throw new Error(`Unhandled command ${command.constructor.name}`);
    },
  };
  const app = createApiTestApplication(new SendTextController(commandBus));
  let server: Server;
  let baseUrl: string;
  let instanceId: string;

  beforeAll(async () => {
    await database.connect();
    server = app.listen(0, '127.0.0.1');
    await new Promise<void>((resolve) => server.once('listening', resolve));
    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  }, 60_000);

  beforeEach(async () => {
    vi.clearAllMocks();
    await database.clear();
    const instance = InstanceAggregate.create({
      name: Name.create('Message integration instance'),
    });
    instanceId = instance.instanceId;
    const repository = new MongoInstanceRepository();
    await repository.save(instance);
    await WhatsAppInstanceModel.updateOne(
      { instanceId },
      { $set: { status: 'connected', phoneNumber: '5512345678' } }
    );
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    await database.disconnect();
  }, 60_000);

  it('sends text through the HTTP flow and persists the outgoing message event', async () => {
    // Arrange
    const payload = { to: '5512345678', message: 'P1 integration message' };

    // Act
    const response = await fetch(`${baseUrl}/messages/${instanceId}/send`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(20_000),
    });
    const body = (await response.json()) as {
      success: boolean;
      content: { messageId: string; chatId: string; content: { text: string } };
    };
    const storedMessage = await new MongoMessageReadRepository().findById(instanceId, messageId);

    // Assert
    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      success: true,
      content: { messageId, chatId, content: { text: payload.message } },
    });
    expect(sendText).toHaveBeenCalledWith(`${chatId}`, payload.message);
    expect(storedMessage).toMatchObject({
      instanceId,
      chatId,
      messageId,
      direction: 'outgoing',
      status: 'sent',
      content: { messageType: 'text', text: payload.message },
    });
  }, 30_000);

  it('rejects a request with invalid phone input before calling the WhatsApp runtime', async () => {
    // Arrange
    const payload = { to: 'invalid-phone', message: 'hello' };

    // Act
    const response = await fetch(`${baseUrl}/messages/${instanceId}/send`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });

    // Assert
    expect(response.status).toBe(400);
    expect(sendText).not.toHaveBeenCalled();
  });

  it('rejects sending from a disconnected instance without calling the runtime', async () => {
    // Arrange
    await WhatsAppInstanceModel.updateOne({ instanceId }, { $set: { status: 'disconnected' } });

    // Act
    const response = await fetch(`${baseUrl}/messages/${instanceId}/send`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ to: '5512345678', message: 'hello' }),
    });

    // Assert
    expect(response.status).toBe(400);
    expect(sendText).not.toHaveBeenCalled();
  });

  it('returns not found when the instance does not exist', async () => {
    // Arrange
    const missingInstanceId = 'd4b44837-7f6e-4fb9-9bd0-5da3c5d7ae81';

    // Act
    const response = await fetch(`${baseUrl}/messages/${missingInstanceId}/send`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ to: '5512345678', message: 'hello' }),
    });

    // Assert
    expect(response.status).toBe(422);
    expect(sendText).not.toHaveBeenCalled();
  });

  it('returns a server error when the WhatsApp runtime rejects the send', async () => {
    // Arrange
    sendText.mockRejectedValue(new Error('Runtime unavailable'));

    // Act
    const response = await fetch(`${baseUrl}/messages/${instanceId}/send`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ to: '5512345678', message: 'hello' }),
      signal: AbortSignal.timeout(20_000),
    });

    // Assert
    expect(response.status).toBe(500);
    expect(sendText).toHaveBeenCalledTimes(9);
  }, 25_000);
});
