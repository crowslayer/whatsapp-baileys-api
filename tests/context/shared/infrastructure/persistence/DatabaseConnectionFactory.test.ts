import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { IConfig } from '@apps/backend/config';
import type { ILogger } from '@shared/domain/Logger';
import { DatabaseConfigurationError } from '@shared/infrastructure/persistence/error/DatabaseConfigurationError';
import { DatabaseConnectionFactory } from '@shared/infrastructure/persistence/DatabaseConnectionFactory';
import { MongoDBConnection } from '@shared/infrastructure/persistence/mongo/MongoDBConnection';

describe('DatabaseConnectionFactory', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('creates a MongoDB connection for mongoose configuration', () => {
    // Arrange
    const config = { database: { type: 'mongoose', enabled: true, uri: 'mongodb://localhost/test' } } as unknown as IConfig;
    const logger = { info: vi.fn(), error: vi.fn() } as unknown as ILogger;

    // Act
    const connection = DatabaseConnectionFactory.create(config, logger);

    // Assert
    expect(connection).toBeInstanceOf(MongoDBConnection);
  });

  it('rejects missing or unsupported database configurations', () => {
    // Arrange
    const logger = { info: vi.fn() } as unknown as ILogger;

    // Act & Assert
    expect(() => DatabaseConnectionFactory.create({} as IConfig, logger)).toThrow(DatabaseConfigurationError);
    expect(() => DatabaseConnectionFactory.create({ database: { type: 'typeorm' } } as unknown as IConfig, logger)).toThrow('TypeORM not implemented yet');
  });
});
