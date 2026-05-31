import { vi } from 'vitest';

export function createMockCommandBus() {
  return {
    dispatch: vi.fn().mockResolvedValue(undefined),
  };
}
