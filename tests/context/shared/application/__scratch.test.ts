import { describe, expect, it } from 'vitest';

import { MessageOrchestrator } from '@shared/application/services/MessageOrchestrator';

describe('scratch', () => {
  it('imports', () => {
    expect(MessageOrchestrator).toBeDefined();
  });
});
