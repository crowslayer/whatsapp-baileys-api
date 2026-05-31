import { vi } from 'vitest';

export function createMockResponse() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
    send: vi.fn(),
    locals: {
      requestId: 'req-123',
    },
  };
}
