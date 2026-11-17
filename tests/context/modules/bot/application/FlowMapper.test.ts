import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FlowMapper } from '@modules/bot/application/FlowMapper';

describe('FlowMapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('maps supported UI nodes and their outgoing edges', () => {
    // Arrange
    const nodes = [
      { id: 'message-1', type: 'message', position: { x: 0, y: 0 }, data: { text: 'Hello' } },
      { id: 'input-1', type: 'input', position: { x: 1, y: 1 }, data: { variable: 'name' } },
      { id: 'ai-1', type: 'ai', position: { x: 2, y: 2 }, data: { prompt: 'Respond' } },
    ];
    const edges = [
      { source: 'message-1', target: 'input-1' },
      { source: 'input-1', target: 'ai-1' },
    ];

    // Act
    const result = FlowMapper.toDomain(nodes, edges);

    // Assert
    expect(result.start).toBe('message-1');
    expect(result.nodes).toEqual({
      'message-1': { id: 'message-1', type: 'message', text: 'Hello', next: 'input-1' },
      'input-1': { id: 'input-1', type: 'input', variable: 'name', next: 'ai-1' },
      'ai-1': { id: 'ai-1', type: 'ai', prompt: 'Respond', next: null },
    });
    expect(result.flowId).toEqual(expect.any(String));
  });

  it('returns an empty flow shape when no nodes are provided', () => {
    // Arrange
    const nodes: Array<{
      id: string;
      type: string;
      position: { x: number; y: number };
      data: Record<string, string>;
    }> = [];

    // Act
    const result = FlowMapper.toDomain(nodes, []);

    // Assert
    expect(result.start).toBe('');
    expect(result.nodes).toEqual({});
    expect(result.flowId).toEqual(expect.any(String));
  });

  it('ignores unsupported node types and leaves unlinked nodes terminal', () => {
    // Arrange
    const nodes = [
      { id: 'unknown-1', type: 'unsupported', position: { x: 0, y: 0 }, data: {} },
      { id: 'message-1', type: 'message', position: { x: 0, y: 0 }, data: { text: 'Done' } },
    ];

    // Act
    const result = FlowMapper.toDomain(nodes, []);

    // Assert
    expect(result.start).toBe('unknown-1');
    expect(result.nodes).toEqual({
      'message-1': { id: 'message-1', type: 'message', text: 'Done', next: null },
    });
  });
});
