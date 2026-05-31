import { FlowEngine } from '../../../src/application/bot/FlowEngine'
import { MockLogger } from '../../helpers/MockLogger'
import type { IConversationState } from '../../../src/application/bot/types/IConversationState'
import type { IFlow, FlowNode } from '../../../src/application/bot/types/FlowTypes'
import type { INodeExecutor } from '../../../src/application/bot/types/INodeExecutor'

function makeMessageNode(id: string, text: string, next: string | null): FlowNode {
  return { id, type: 'message', text, next } as any
}

function makeInputNode(id: string, variable: string, next: string | null): FlowNode {
  return { id, type: 'input', variable, next } as any
}

function makeConditionNode(id: string, variable: string, equals: string, ifTrue: string, ifFalse: string): FlowNode {
  return { id, type: 'condition', variable, equals, ifTrue, ifFalse, next: null } as any
}

describe('FlowEngine', () => {
  let logger: MockLogger
  let engine: FlowEngine
  let mockExecutors: INodeExecutor[]
  let messageExecutor: INodeExecutor
  let inputExecutor: INodeExecutor
  let conditionExecutor: INodeExecutor

  beforeEach(() => {
    logger = new MockLogger()

    messageExecutor = {
      supports: (t: string) => t === 'message',
      execute: vi.fn(({ node, state }: any) => ({
        reply: (node as any).text,
        nextNodeId: (node as any).next,
        isEnd: (node as any).next === null,
      })),
    }

    inputExecutor = {
      supports: (t: string) => t === 'input',
      execute: vi.fn(({ node, input, state }: any) => ({
        variables: { ...state.variables, [(node as any).variable]: input?.trim().toLowerCase() },
        nextNodeId: (node as any).next,
      })),
    }

    conditionExecutor = {
      supports: (t: string) => t === 'condition',
      execute: vi.fn(({ node, state }: any) => ({
        nextNodeId: state.variables[(node as any).variable] === (node as any).equals ? (node as any).ifTrue : (node as any).ifFalse,
      })),
    }

    mockExecutors = [messageExecutor, inputExecutor, conditionExecutor]
    engine = new FlowEngine(mockExecutors, logger)
  })

  test('should return variables when no current node', () => {
    const state: IConversationState = { instanceId: 'i1', chatId: 'c1', variables: { foo: 'bar' } }
    const flow: IFlow = {
      flowId: 'f1', instanceId: 'i1', name: 'Test', version: 1,
      start: 'start', nodes: {}, isActive: true,
    }
    const result = engine.execute(flow, state)
    expect(result.variables).toEqual({ foo: 'bar' })
    expect(logger.warn).toHaveBeenCalled()
  })

  test('should warn when node not found in flow', () => {
    const state: IConversationState = { instanceId: 'i1', chatId: 'c1', currentNodeId: 'missing', variables: {} }
    const flow: IFlow = {
      flowId: 'f1', instanceId: 'i1', name: 'Test', version: 1,
      start: 'start', nodes: {}, isActive: true,
    }
    const result = engine.execute(flow, state)
    expect(result.variables).toEqual({})
    expect(logger.warn).toHaveBeenCalled()
  })

  test('should throw when no executor supports node type', () => {
    const state: IConversationState = { instanceId: 'i1', chatId: 'c1', currentNodeId: 'n1', variables: {} }
    const flow: IFlow = {
      flowId: 'f1', instanceId: 'i1', name: 'Test', version: 1,
      start: 'start',
      nodes: { n1: { id: 'n1', type: 'unknown', next: null } as any },
      isActive: true,
    }
    expect(() => engine.execute(flow, state)).toThrow('No executor for unknown')
  })

  test('should execute message nodes and traverse', () => {
    const state: IConversationState = { instanceId: 'i1', chatId: 'c1', currentNodeId: 'start', variables: {} }
    const flow: IFlow = {
      flowId: 'f1', instanceId: 'i1', name: 'Test', version: 1,
      start: 'start',
      nodes: {
        start: makeMessageNode('start', 'Hello', 'next1'),
        next1: makeMessageNode('next1', 'World', null),
      },
      isActive: true,
    }
    const result = engine.execute(flow, state)
    expect(result.reply).toBe('World')
    expect(messageExecutor.execute).toHaveBeenCalledTimes(2)
  })

  test('should stop at input node when no input provided', () => {
    const state: IConversationState = { instanceId: 'i1', chatId: 'c1', currentNodeId: 'start', variables: {} }
    const flow: IFlow = {
      flowId: 'f1', instanceId: 'i1', name: 'Test', version: 1,
      start: 'start',
      nodes: {
        start: makeInputNode('start', 'color', 'next1'),
        next1: makeMessageNode('next1', 'Thanks', null),
      },
      isActive: true,
    }
    const result = engine.execute(flow, state)
    expect(inputExecutor.execute).toHaveBeenCalledTimes(1)
    expect(messageExecutor.execute).not.toHaveBeenCalled()
    expect(result.variables).toEqual({})
  })

  test('should execute input node with input and continue', () => {
    const state: IConversationState = { instanceId: 'i1', chatId: 'c1', currentNodeId: 'start', variables: {} }
    const flow: IFlow = {
      flowId: 'f1', instanceId: 'i1', name: 'Test', version: 1,
      start: 'start',
      nodes: {
        start: makeInputNode('start', 'color', 'end'),
        end: makeMessageNode('end', 'Done', null),
      },
      isActive: true,
    }
    const result = engine.execute(flow, state, 'Blue')
    expect(state.variables).toEqual({ color: 'blue' })
    expect(messageExecutor.execute).toHaveBeenCalled()
    expect(result.reply).toBe('Done')
  })

  test('should end when node has no nextNodeId', () => {
    const state: IConversationState = { instanceId: 'i1', chatId: 'c1', currentNodeId: 'end', variables: {} }
    const flow: IFlow = {
      flowId: 'f1', instanceId: 'i1', name: 'Test', version: 1,
      start: 'end',
      nodes: { end: makeMessageNode('end', 'Final', null) },
      isActive: true,
    }
    const result = engine.execute(flow, state)
    expect(result.isEnd).toBe(true)
    expect(result.reply).toBe('Final')
  })

  test('should evaluate condition nodes', () => {
    const state: IConversationState = { instanceId: 'i1', chatId: 'c1', currentNodeId: 'cond', variables: { color: 'red' } }
    const flow: IFlow = {
      flowId: 'f1', instanceId: 'i1', name: 'Test', version: 1,
      start: 'cond',
      nodes: {
        cond: makeConditionNode('cond', 'color', 'red', 'match', 'no_match'),
        match: makeMessageNode('match', 'Matched', null),
        no_match: makeMessageNode('no_match', 'Not matched', null),
      },
      isActive: true,
    }
    const result = engine.execute(flow, state)
    expect(result.reply).toBe('Matched')
  })
})
