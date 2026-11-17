import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createFlowSchema,
  createNodesSchema,
  flowIdSchema,
  nodesSchema,
  updateFlowSchema,
} from '@apps/backend/http/validators/express/schemas/flowSchema';

const asRecord = (schema: unknown): Record<string, Record<string, unknown>> =>
  schema as Record<string, Record<string, unknown>>;

const nodesValidator = (): ((value: unknown) => boolean) =>
  (
    asRecord(nodesSchema).nodes.custom as unknown as {
      options: (value: unknown) => boolean;
    }
  ).options;

describe('flowSchema', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('validates the flow id coming from the params', () => {
    const schema = asRecord(flowIdSchema);

    expect(schema.flowId.in).toEqual(['params']);
    expect(schema.flowId.isUUID).toEqual({ errorMessage: 'Invalid id' });
  });

  it('requires the instance id and the name on creation', () => {
    const schema = asRecord(createFlowSchema);

    expect(Object.keys(schema).sort()).toEqual(['instanceId', 'name']);
    expect(schema.instanceId.exists).toBe(true);
    expect(schema.name.exists).toEqual({ errorMessage: 'Name is required' });
  });

  it('requires the flow id, the nodes, the start and the triggers', () => {
    const schema = asRecord(createNodesSchema);

    expect(Object.keys(schema).sort()).toEqual(
      ['flowId', 'name', 'nodes', 'triggers', 'triggers.*.type', 'triggers.*.value'].sort()
    );
  });

  it('marks the triggers as optional', () => {
    const schema = asRecord(createNodesSchema);

    expect(schema.triggers.optional).toBe(true);
    expect(schema.triggers.isArray).toBe(true);
  });

  it('requires the flow id on update', () => {
    const schema = asRecord(updateFlowSchema);

    expect(Object.keys(schema).sort()).toEqual(['flowId', 'instanceId', 'name']);
  });

  it('accepts a valid message node', () => {
    const validator = nodesValidator();

    const result = validator({
      start: { id: 'n1', type: 'message', text: 'hello' },
    });

    expect(result).toBe(true);
  });

  it('rejects nodes that are not an object', () => {
    const validator = nodesValidator();

    expect(() => validator('not-an-object')).toThrow('nodes must be an object');
  });

  it('rejects nodes without id and type', () => {
    const validator = nodesValidator();

    expect(() => validator({ start: { text: 'hello' } })).toThrow(
      'Node start must have id and type'
    );
  });

  it('rejects message nodes without text', () => {
    const validator = nodesValidator();

    expect(() => validator({ start: { id: 'n1', type: 'message' } })).toThrow(
      'Node start (message) must have text'
    );
  });

  it('rejects input nodes without variable', () => {
    const validator = nodesValidator();

    expect(() => validator({ start: { id: 'n1', type: 'input' } })).toThrow(
      'Node start (input) must have variable'
    );
  });

  it('rejects condition nodes with missing attributes', () => {
    const validator = nodesValidator();

    expect(() =>
      validator({ start: { id: 'n1', type: 'condition', variable: 'a' } })
    ).toThrow('Node start (condition) is invalid');
  });

  it('accepts condition nodes with every attribute', () => {
    const validator = nodesValidator();

    const result = validator({
      start: {
        id: 'n1',
        type: 'condition',
        variable: 'a',
        equals: 'b',
        ifTrue: 'x',
        ifFalse: 'y',
      },
    });

    expect(result).toBe(true);
  });

  it('rejects unknown node types', () => {
    const validator = nodesValidator();

    expect(() => validator({ start: { id: 'n1', type: 'unknown' } })).toThrow(
      'Unknown node type: unknown'
    );
  });

  it('rejects a next reference that is not a string', () => {
    const validator = nodesValidator();

    expect(() =>
      validator({ start: { id: 'n1', type: 'message', text: 'hi', next: 42 } })
    ).toThrow('Node start has invalid next');
  });

  it('accepts a null next reference', () => {
    const validator = nodesValidator();

    const result = validator({
      start: { id: 'n1', type: 'message', text: 'hi', next: null },
    });

    expect(result).toBe(true);
  });
});
