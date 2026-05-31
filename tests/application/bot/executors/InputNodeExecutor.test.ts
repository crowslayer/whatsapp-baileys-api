import { InputNodeExecutor } from '../../../../src/application/bot/executors/InputNodeExecutor'
import type { INodeInput } from '../../../../src/application/bot/types/FlowTypes'
import type { IConversationState } from '../../../../src/application/bot/types/IConversationState'

describe('InputNodeExecutor', () => {
  const executor = new InputNodeExecutor()

  test('should support input type', () => {
    expect(executor.supports('input')).toBe(true)
    expect(executor.supports('message')).toBe(false)
  })

  test('should store trimmed and lowercased input in variables', () => {
    const node: INodeInput = { id: 'in1', type: 'input', variable: 'color', next: 'next1' }
    const state: IConversationState = { instanceId: 'i1', chatId: 'c1', variables: {} }
    const result = executor.execute({ node, state, input: '  Red ' })
    expect(result.variables).toEqual({ color: 'red' })
    expect(result.nextNodeId).toBe('next1')
  })

  test('should store undefined input as undefined', () => {
    const node: INodeInput = { id: 'in1', type: 'input', variable: 'color', next: 'next1' }
    const state: IConversationState = { instanceId: 'i1', chatId: 'c1', variables: {} }
    const result = executor.execute({ node, state, input: undefined })
    expect(result.variables).toEqual({ color: undefined })
  })
})
