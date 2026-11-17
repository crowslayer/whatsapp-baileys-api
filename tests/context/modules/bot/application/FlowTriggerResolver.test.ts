import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FlowTriggerResolver } from '@modules/bot/application/FlowTriggerResolver';
import type { IFlow } from '@modules/flows/domain/FlowTypes';

describe('FlowTriggerResolver', () => {
  let resolver: FlowTriggerResolver;

  beforeEach(() => {
    vi.clearAllMocks();
    resolver = new FlowTriggerResolver();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('matches keywords without case or surrounding whitespace differences', () => {
    // Arrange
    const flow = { triggers: [{ type: 'keyword', value: 'HELLO' }] } as IFlow;

    // Act
    const result = resolver.resolve([flow], '  hello  ');

    // Assert
    expect(result).toBe(flow);
  });

  it('matches contained text and returns the first matching flow', () => {
    // Arrange
    const first = { triggers: [{ type: 'contains', value: 'help' }] } as IFlow;
    const second = { triggers: [{ type: 'keyword', value: 'need help' }] } as IFlow;

    // Act
    const result = resolver.resolve([first, second], 'I need help now');

    // Assert
    expect(result).toBe(first);
  });

  it('returns null when there are no matching triggers', () => {
    // Arrange
    const flows = [{ triggers: [] }, {}] as IFlow[];

    // Act
    const result = resolver.resolve(flows, 'hello');

    // Assert
    expect(result).toBeNull();
  });
});
