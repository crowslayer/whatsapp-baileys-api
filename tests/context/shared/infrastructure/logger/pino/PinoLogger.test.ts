import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { loggerMock, pinoMock } = vi.hoisted(() => {
  const logger = {
    trace: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn(), fatal: vi.fn(), debug: vi.fn(),
    child: vi.fn(),
  };
  return { loggerMock: logger, pinoMock: vi.fn(() => logger) };
});

vi.mock('pino', () => ({ default: pinoMock }));

import { PinoLogger } from '@shared/infrastructure/logger/pino/PinoLogger';

describe('PinoLogger', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('forwards messages and structured context to Pino', () => {
    // Arrange
    const logger = new PinoLogger();

    // Act
    logger.info('started');
    logger.error('request failed', { requestId: 'r1' });
    logger.debug({ component: 'worker' });

    // Assert
    expect(loggerMock.info).toHaveBeenCalledWith('started');
    expect(loggerMock.error).toHaveBeenCalledWith({ requestId: 'r1' }, 'request failed');
    expect(loggerMock.debug).toHaveBeenCalledWith({ component: 'worker' });
    expect(logger.getLogger()).toBe(loggerMock);
  });
});
