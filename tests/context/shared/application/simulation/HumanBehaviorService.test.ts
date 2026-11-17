import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('node:timers/promises', () => ({
  setTimeout: vi.fn(async () => undefined),
}));

import { setTimeout as delay } from 'node:timers/promises';

import { HumanBehaviorService } from '@shared/application/simulation/HumanBehaviorService';
import { ILogger } from '@shared/domain/Logger';
import { IWhatsAppRuntime } from '@shared/domain/whatsapp/IWhatsAppRuntime';
import { IPresenceService } from '@shared/domain/whatsapp/IPresenceService';

type PresenceType = 'unavailable' | 'available' | 'composing' | 'recording' | 'paused';

const createLogger = (): ILogger => ({
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  fatal: vi.fn(),
  debug: vi.fn(),
  trace: vi.fn(),
});

const createRuntime = (): {
  sendPresence: ReturnType<typeof vi.fn<(jid: string, type: PresenceType) => Promise<void>>>;
  runtime: IWhatsAppRuntime;
} => {
  const sendPresence = vi.fn<(jid: string, type: PresenceType) => Promise<void>>();

  const presence: IPresenceService = {
    subscribePresence: vi.fn(),
    sendPresence,
  };

  return { sendPresence, runtime: { presence } as unknown as IWhatsAppRuntime };
};

describe('HumanBehaviorService', () => {
  let logger: ILogger;
  let service: HumanBehaviorService;

  beforeEach(() => {
    vi.clearAllMocks();
    logger = createLogger();
    service = new HumanBehaviorService(logger);
  });

  describe('getTypingDelay', () => {
    it('returns a short delay for texts shorter than 10 characters', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);

      const result = service.getTypingDelay('hi');

      expect(result).toBe(300);
    });

    it('returns a medium delay for texts between 10 and 49 characters', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);

      const result = service.getTypingDelay('0123456789');

      expect(result).toBe(750);
    });

    it('returns a long delay for texts between 50 and 119 characters', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);

      const result = service.getTypingDelay('a'.repeat(50));

      expect(result).toBe(1750);
    });

    it('returns the maximum delay for texts of 120 characters or more', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);

      const result = service.getTypingDelay('a'.repeat(120));

      expect(result).toBe(3500);
    });

    it('returns the minimum delay for an empty text', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0);

      const result = service.getTypingDelay('');

      expect(result).toBe(200);
    });
  });

  describe('getPostDelay', () => {
    it('returns a delay between 300 and 800 milliseconds', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0);

      const result = service.getPostDelay();

      expect(result).toBe(300);
    });
  });

  describe('shouldGoOffline', () => {
    it('returns true when the random value is greater than 0.8', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.9);

      const result = service.shouldGoOffline();

      expect(result).toBe(true);
    });

    it('returns false when the random value is exactly 0.8', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.8);

      const result = service.shouldGoOffline();

      expect(result).toBe(false);
    });
  });

  describe('simulateTyping', () => {
    it('sends composing and paused presence for a valid individual jid', async () => {
      const { sendPresence, runtime } = createRuntime();

      await service.simulateTyping(runtime, '123@s.whatsapp.net', 'hello');

      expect(sendPresence).toHaveBeenNthCalledWith(1, '123@s.whatsapp.net', 'composing');
      expect(sendPresence).toHaveBeenNthCalledWith(2, '123@s.whatsapp.net', 'paused');
    });

    it('does not send composing presence for a group jid', async () => {
      const { sendPresence, runtime } = createRuntime();

      await service.simulateTyping(runtime, '123-456@g.us', 'hello');

      expect(sendPresence).toHaveBeenCalledTimes(1);
      expect(sendPresence).toHaveBeenCalledWith('123-456@g.us', 'paused');
    });

    it('does not send any presence for a jid without domain', async () => {
      const { sendPresence, runtime } = createRuntime();

      await service.simulateTyping(runtime, '12345', 'hello');

      expect(sendPresence).not.toHaveBeenCalled();
    });

    it('does not send any presence for an empty jid', async () => {
      const { sendPresence, runtime } = createRuntime();

      await service.simulateTyping(runtime, '', 'hello');

      expect(sendPresence).not.toHaveBeenCalled();
    });

    it('waits for the typing delay before finishing', async () => {
      const { runtime } = createRuntime();

      await service.simulateTyping(runtime, '123@s.whatsapp.net', 'hello');

      expect(vi.mocked(delay)).toHaveBeenCalled();
    });

    it('logs and swallows errors raised while sending composing presence', async () => {
      const { sendPresence, runtime } = createRuntime();
      sendPresence.mockRejectedValueOnce(new Error('presence down'));

      await service.simulateTyping(runtime, '123@s.whatsapp.net', 'hello');

      expect(logger.error).toHaveBeenCalledWith(
        'Error actualiando presencia a composing',
        expect.any(Error)
      );
      expect(sendPresence).toHaveBeenCalledTimes(2);
    });

    it('logs and swallows errors raised while sending paused presence', async () => {
      const { sendPresence, runtime } = createRuntime();
      sendPresence
        .mockImplementationOnce(async () => undefined)
        .mockRejectedValueOnce(new Error('presence down'));

      await service.simulateTyping(runtime, '123@s.whatsapp.net', 'hello');

      expect(logger.error).toHaveBeenCalledWith('Error actualizando estado', expect.any(Error));
    });
  });

  describe('simulateAfterSend', () => {
    it('does not send unavailable presence when the user stays online', async () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      const { sendPresence, runtime } = createRuntime();

      await service.simulateAfterSend(runtime, '123@s.whatsapp.net');

      expect(sendPresence).not.toHaveBeenCalled();
    });

    it('sends unavailable presence when the user goes offline', async () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.9);
      const { sendPresence, runtime } = createRuntime();

      await service.simulateAfterSend(runtime, '123@s.whatsapp.net');

      expect(sendPresence).toHaveBeenCalledWith('123@s.whatsapp.net', 'unavailable');
    });

    it('does not send unavailable presence for an invalid jid', async () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.9);
      const { sendPresence, runtime } = createRuntime();

      await service.simulateAfterSend(runtime, 'invalid');

      expect(sendPresence).not.toHaveBeenCalled();
    });

    it('logs and swallows errors raised while sending unavailable presence', async () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.9);
      const { sendPresence, runtime } = createRuntime();
      sendPresence.mockRejectedValueOnce(new Error('presence down'));

      await service.simulateAfterSend(runtime, '123@s.whatsapp.net');

      expect(logger.error).toHaveBeenCalledWith(
        'Error actualizando a unavailable',
        expect.any(Error)
      );
    });
  });
});
