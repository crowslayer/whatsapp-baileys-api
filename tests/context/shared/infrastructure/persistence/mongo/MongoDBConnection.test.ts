import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { mongooseMock } = vi.hoisted(() => ({
  mongooseMock: {
    connect: vi.fn(),
    disconnect: vi.fn(),
    connection: { readyState: 1, on: vi.fn() },
  },
}));

vi.mock('mongoose', () => ({ default: mongooseMock }));

import type { IMongooseConfig } from '@apps/backend/config';
import type { ILogger } from '@shared/domain/Logger';
import { MongoDBConnection } from '@shared/infrastructure/persistence/mongo/MongoDBConnection';

describe('MongoDBConnection', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('connects once and disconnects cleanly', async () => {
    // Arrange
    mongooseMock.connect.mockResolvedValue(mongooseMock);
    mongooseMock.disconnect.mockResolvedValue(undefined);
    const logger = { info: vi.fn(), error: vi.fn(), warn: vi.fn() } as unknown as ILogger;
    const config = { enabled: true, uri: 'mongodb://localhost/test', options: {} } as IMongooseConfig;
    const connection = new MongoDBConnection(config, logger);

    // Act
    await connection.connect();
    await connection.connect();
    await connection.disconnect();

    // Assert
    expect(mongooseMock.connect).toHaveBeenCalledOnce();
    expect(mongooseMock.disconnect).toHaveBeenCalledOnce();
    expect(logger.info).toHaveBeenCalledWith('MongoDB already connected');
  });

  it('rejects when the database is disabled', async () => {
    // Arrange
    const connection = new MongoDBConnection({ enabled: false, uri: '' } as IMongooseConfig, { info: vi.fn() } as unknown as ILogger);

    // Act & Assert
    await expect(connection.connect()).rejects.toThrow('Database not enabled');
  });
});
