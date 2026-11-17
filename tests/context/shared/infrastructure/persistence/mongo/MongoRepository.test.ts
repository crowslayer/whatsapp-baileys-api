import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ErrorCode } from '@shared/domain/error/ErrorCode';
import { MongoInfrastructureError } from '@shared/infrastructure/persistence/mongo/MongoInfrastructureError';
import { MongoRepository } from '@shared/infrastructure/persistence/mongo/MongoRepository';

class TestMongoRepository extends MongoRepository {
  translate(error: unknown): MongoInfrastructureError {
    return this.translateError(error);
  }
}

describe('MongoRepository error translation', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('maps duplicate key errors to the duplicate-key domain code', () => {
    // Arrange
    const duplicate = Object.assign(new Error('duplicate'), { code: 11000, keyValue: { name: 'Main' } });

    // Act
    const translated = new TestMongoRepository().translate(duplicate);

    // Assert
    expect(translated).toBeInstanceOf(MongoInfrastructureError);
    expect(translated.code).toBe(ErrorCode.DB_DUPLICATE_KEY);
    expect(translated.message).toContain('Duplicate key violation');
  });

  it('preserves an existing infrastructure error', () => {
    // Arrange
    const error = new MongoInfrastructureError('already translated', ErrorCode.DATABASE_ERROR);

    // Act
    const translated = new TestMongoRepository().translate(error);

    // Assert
    expect(translated).toBe(error);
  });

  it('uses a generic database error for unknown failures', () => {
    // Arrange
    const failure = new Error('network down');

    // Act
    const translated = new TestMongoRepository().translate(failure);

    // Assert
    expect(translated.code).toBe(ErrorCode.DATABASE_ERROR);
    expect(translated.message).toBe('network down');
  });
});
