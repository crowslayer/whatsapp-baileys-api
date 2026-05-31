import { vi } from 'vitest';

export function createRequest(overrides: any = {}) {
  return {
    params: {
      instanceId: 'inst-1',
      ...overrides.params,
    },
    body: {
      ...overrides.body,
    },
    file: overrides.file,
    ip: '127.0.0.1',
    get: vi.fn().mockReturnValue('test-agent'),
  };
}
