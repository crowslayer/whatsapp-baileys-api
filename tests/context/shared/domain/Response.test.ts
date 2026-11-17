import { beforeEach, describe, expect, it, vi } from 'vitest';

import { IResponse } from '@shared/domain/Response';

describe('IResponse', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('accepts an empty response without content', () => {
    const response: IResponse = {};

    expect(response.content).toBeUndefined();
  });

  it('accepts a response carrying any content', () => {
    const response: IResponse = { content: { id: '1' } };

    expect(response.content).toEqual({ id: '1' });
  });

  it('accepts a response carrying primitive content', () => {
    const response: IResponse = { content: 'plain' };

    expect(response.content).toBe('plain');
  });

  it('accepts a response carrying null content', () => {
    const response: IResponse = { content: null };

    expect(response.content).toBeNull();
  });

  it('accepts a response carrying an array as content', () => {
    const response: IResponse = { content: [1, 2, 3] };

    expect(response.content).toHaveLength(3);
  });
});
