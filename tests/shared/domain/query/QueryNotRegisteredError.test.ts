import { QueryNotRegisteredError } from '../../../../src/shared/domain/query/QueryNotRegisteredError';

describe('QueryNotRegisteredError', () => {
  test('constructor sets the message', () => {
    const error = new QueryNotRegisteredError('Query not found');
    expect(error.message).toBe('Query not found');
  });

  test('extends Error', () => {
    const error = new QueryNotRegisteredError('test');
    expect(error).toBeInstanceOf(Error);
  });
});
