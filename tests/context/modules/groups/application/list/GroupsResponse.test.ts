import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GroupsResponse } from '@modules/groups/application/list/GroupsResponse';

describe('GroupsResponse', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('wraps group results and count', () => {
    // Arrange
    const result = { groups: [], groupsCount: 0 };

    // Act
    const response = GroupsResponse.create(result);

    // Assert
    expect(response.content).toBe(result);
  });

  it('returns the default empty result when input is null', () => {
    // Arrange / Act
    const response = GroupsResponse.create(null as never);

    // Assert
    expect(response.content).toEqual({ groups: [], groupsCount: 0 });
  });
});
