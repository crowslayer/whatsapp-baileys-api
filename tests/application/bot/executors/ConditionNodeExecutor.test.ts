import { ConditionNodeExecutor } from '../../../../src/application/bot/executors/ConditionNodeExecutor'
import type { IConditionNode } from '../../../../src/application/bot/types/FlowTypes'
import type { IConversationState } from '../../../../src/application/bot/types/IConversationState'

describe('ConditionNodeExecutor', () => {
  const executor = new ConditionNodeExecutor()

  test('should support condition type', () => {
    expect(executor.supports('condition')).toBe(true)
    expect(executor.supports('message')).toBe(false)
    expect(executor.supports('input')).toBe(false)
  })

  test('should return ifTrue branch when condition matches', () => {
    const node: IConditionNode = {
      id: 'c1', type: 'condition', variable: 'color', equals: 'red',
      ifTrue: 'match', ifFalse: 'no_match', next: null,
    }
    const state: IConversationState = { instanceId: 'i1', chatId: 'c1', variables: { color: 'red' } }
    const result = executor.execute({ node, state })
    expect(result.nextNodeId).toBe('match')
  })

  test('should return ifFalse branch when condition does not match', () => {
    const node: IConditionNode = {
      id: 'c1', type: 'condition', variable: 'color', equals: 'red',
      ifTrue: 'match', ifFalse: 'no_match', next: null,
    }
    const state: IConversationState = { instanceId: 'i1', chatId: 'c1', variables: { color: 'blue' } }
    const result = executor.execute({ node, state })
    expect(result.nextNodeId).toBe('no_match')
  })

  test('should handle missing variable in state', () => {
    const node: IConditionNode = {
      id: 'c1', type: 'condition', variable: 'missing', equals: 'val',
      ifTrue: 't', ifFalse: 'f', next: null,
    }
    const state: IConversationState = { instanceId: 'i1', chatId: 'c1', variables: {} }
    const result = executor.execute({ node, state })
    expect(result.nextNodeId).toBe('f')
  })
})
