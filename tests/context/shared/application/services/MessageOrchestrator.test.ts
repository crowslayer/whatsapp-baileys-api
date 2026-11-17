import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('node:timers/promises', () => ({
  setTimeout: vi.fn(async () => undefined),
}));

import { HumanBehaviorService } from '@shared/application/simulation/HumanBehaviorService';
import { MessageOrchestrator } from '@shared/application/services/MessageOrchestrator';
import { IEventBus } from '@shared/domain/event/IEventBus';
import { IRuntimeManager } from '@shared/domain/whatsapp/IRuntimeManager';
import { IWhatsAppRuntime } from '@shared/domain/whatsapp/IWhatsAppRuntime';
import { ISentMessage } from '@shared/domain/whatsapp/MessageTypes';
import { AnyEvent } from '@shared/domain/event/Event';
import { LimiterFactory } from '@modules/campaign/application/LimiterFactory';

const SENT_MESSAGE: ISentMessage = {
  messageId: 'message-1',
  chatId: 'chat-1',
  timestamp: new Date('2024-01-01T00:00:00.000Z'),
  senderId: 'sender-1',
  content: { messageType: 'text', text: 'hello' },
};

type SendText = (to: string, text: string) => Promise<ISentMessage | undefined>;

const createHarness = () => {
  const sendText = vi.fn<SendText>();
  const runtime = { messaging: { sendText } } as unknown as IWhatsAppRuntime;

  const runtimeRegistry = {
    get: vi.fn<(instanceId: string) => IWhatsAppRuntime>(() => runtime),
  };

  const run = vi.fn<(task: () => Promise<unknown>) => Promise<unknown>>(
    async (task: () => Promise<unknown>) => task()
  );
  const limiterFactory = {
    getLimiter: vi.fn(() => ({ run })),
  } as unknown as LimiterFactory;

  const human = {
    simulateTyping: vi.fn<(runtime: IWhatsAppRuntime, to: string, text: string) => Promise<void>>(
      async () => undefined
    ),
    simulateAfterSend: vi.fn<(runtime: IWhatsAppRuntime, to: string) => Promise<void>>(
      async () => undefined
    ),
  } as unknown as HumanBehaviorService;

  const publish = vi.fn<(events: AnyEvent[]) => Promise<void>>(async () => undefined);
  const eventBus = { publish, addSubscribers: vi.fn() } as unknown as IEventBus;

  const orchestrator = new MessageOrchestrator(
    runtimeRegistry as unknown as IRuntimeManager,
    limiterFactory,
    human,
    eventBus
  );

  return { orchestrator, sendText, run, human, publish, runtimeRegistry };
};

describe('MessageOrchestrator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('send', () => {
    it('returns the message sent by the runtime', async () => {
      const { orchestrator, sendText } = createHarness();
      sendText.mockResolvedValue(SENT_MESSAGE);

      const result = await orchestrator.send('instance-1', 'chat-1', 'hello');

      expect(result).toEqual(SENT_MESSAGE);
    });

    it('sends the text to the requested recipient', async () => {
      const { orchestrator, sendText } = createHarness();
      sendText.mockResolvedValue(SENT_MESSAGE);

      await orchestrator.send('instance-1', 'chat-1', 'hello');

      expect(sendText).toHaveBeenCalledWith('chat-1', 'hello');
    });

    it('runs the task through the limiter of the instance', async () => {
      const { orchestrator, sendText, run } = createHarness();
      sendText.mockResolvedValue(SENT_MESSAGE);

      await orchestrator.send('instance-1', 'chat-1', 'hello');

      expect(run).toHaveBeenCalledTimes(1);
    });

    it('simulates human typing before sending', async () => {
      const { orchestrator, sendText, human } = createHarness();
      sendText.mockResolvedValue(SENT_MESSAGE);

      await orchestrator.send('instance-1', 'chat-1', 'hello');

      expect(human.simulateTyping).toHaveBeenCalledWith(expect.anything(), 'chat-1', 'hello');
    });

    it('simulates the after send behaviour once the message is delivered', async () => {
      const { orchestrator, sendText, human } = createHarness();
      sendText.mockResolvedValue(SENT_MESSAGE);

      await orchestrator.send('instance-1', 'chat-1', 'hello');

      expect(human.simulateAfterSend).toHaveBeenCalledWith(expect.anything(), 'chat-1');
    });

    it('publishes an outgoing message event with the message payload', async () => {
      const { orchestrator, sendText, publish } = createHarness();
      sendText.mockResolvedValue(SENT_MESSAGE);

      await orchestrator.send('instance-1', 'chat-1', 'hello');

      expect(publish).toHaveBeenCalledTimes(1);
      const [events] = publish.mock.calls[0];
      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('whatsapp.message.sended');
      expect(events[0].payload).toEqual({
        instanceId: 'instance-1',
        chatId: 'chat-1',
        messageId: 'message-1',
        senderId: 'sender-1',
        timestamp: SENT_MESSAGE.timestamp,
        content: SENT_MESSAGE.content,
      });
    });

    it('throws a RuntimeError when the runtime does not return a message', async () => {
      const { orchestrator, sendText } = createHarness();
      sendText.mockResolvedValue(undefined);

      await expect(orchestrator.send('instance-1', 'chat-1', 'hello')).rejects.toThrow(
        'Message was not sent'
      );
    });

    it('retries twice before giving up when the message is not sent', async () => {
      const { orchestrator, sendText } = createHarness();
      sendText.mockResolvedValue(undefined);

      await expect(orchestrator.send('instance-1', 'chat-1', 'hello')).rejects.toThrow(
        'Message was not sent'
      );
      expect(sendText).toHaveBeenCalledTimes(3);
    });

    it('retries and succeeds when the first attempt fails', async () => {
      const { orchestrator, sendText } = createHarness();
      sendText.mockRejectedValueOnce(new Error('network down'));
      sendText.mockResolvedValue(SENT_MESSAGE);

      const result = await orchestrator.send('instance-1', 'chat-1', 'hello');

      expect(result).toEqual(SENT_MESSAGE);
      expect(sendText).toHaveBeenCalledTimes(2);
    });

    it('rejects with a timeout error when the runtime never answers', async () => {
      const { orchestrator, sendText } = createHarness();
      sendText.mockImplementation(() => new Promise<ISentMessage | undefined>(() => undefined));

      await expect(orchestrator.send('instance-1', 'chat-1', 'hello')).rejects.toThrow('timeout');
    });

    it('does not publish an event when the message fails', async () => {
      const { orchestrator, sendText, publish } = createHarness();
      sendText.mockResolvedValue(undefined);

      await expect(orchestrator.send('instance-1', 'chat-1', 'hello')).rejects.toThrow();

      expect(publish).not.toHaveBeenCalled();
    });
  });

  describe('sendBulk', () => {
    it('rejects when the recipient list exceeds 1000 entries', async () => {
      const { orchestrator } = createHarness();
      const recipients = Array.from({ length: 1001 }, (_, index) => `chat-${index}`);

      await expect(orchestrator.sendBulk('instance-1', recipients, 'hello')).rejects.toThrow(
        'Bulk limit exceeded'
      );
    });

    it('returns zero counters for an empty recipient list', async () => {
      const { orchestrator } = createHarness();

      const result = await orchestrator.sendBulk('instance-1', [], 'hello');

      expect(result).toEqual({ success: 0, failed: 0 });
    });

    it('counts every successful delivery', async () => {
      const { orchestrator, sendText } = createHarness();
      sendText.mockResolvedValue(SENT_MESSAGE);

      const result = await orchestrator.sendBulk('instance-1', ['a', 'b', 'c'], 'hello');

      expect(result).toEqual({ success: 3, failed: 0 });
    });

    it('counts the recipients that failed to be delivered', async () => {
      const { orchestrator, sendText } = createHarness();
      sendText.mockRejectedValue(new Error('network down'));

      const result = await orchestrator.sendBulk('instance-1', ['a', 'b'], 'hello');

      expect(result).toEqual({ success: 0, failed: 2 });
    });

    it('mixes successful and failed deliveries', async () => {
      const { orchestrator, sendText } = createHarness();
      sendText.mockResolvedValueOnce(SENT_MESSAGE);
      sendText.mockRejectedValueOnce(new Error('network down'));

      const result = await orchestrator.sendBulk('instance-1', ['a', 'b'], 'hello');

      expect(result).toEqual({ success: 1, failed: 1 });
    });
  });
});
