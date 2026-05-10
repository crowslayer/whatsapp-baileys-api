import { MessageNodeExecutor } from '../../../../src/application/bot/executors/MessageNodeExecutor'
import type { IMessageNode } from '../../../../src/application/bot/types/FlowTypes'
import type { IConversationState } from '../../../../src/application/bot/types/IConversationState'

describe('MessageNodeExecutor', () => {
  const executor = new MessageNodeExecutor()

  test('should support message type', () => {
    expect(executor.supports('message')).toBe(true)
    expect(executor.supports('input')).toBe(false)
  })

  test('should return reply with interpolated variables', () => {
    const node: IMessageNode = { id: 'm1', type: 'message', text: 'Hello {{name}}!', next: 'next1' }
    const state: IConversationState = { instanceId: 'i1', chatId: 'c1', variables: { name: 'John' } }
    const result = executor.execute({ node, state })
    expect(result.reply).toBe('Hello John!')
    expect(result.nextNodeId).toBe('next1')
    expect(result.isEnd).toBe(false)
  })

  test('should replace missing variable with empty string', () => {
    const node: IMessageNode = { id: 'm1', type: 'message', text: 'Hi {{unknown}}!', next: null }
    const state: IConversationState = { instanceId: 'i1', chatId: 'c1', variables: {} }
    const result = executor.execute({ node, state })
    expect(result.reply).toBe('Hi !')
  })

  test('should set isEnd when next is null', () => {
    const node: IMessageNode = { id: 'm1', type: 'message', text: 'Bye', next: null }
    const state: IConversationState = { instanceId: 'i1', chatId: 'c1', variables: {} }
    const result = executor.execute({ node, state })
    expect(result.isEnd).toBe(true)
    expect(result.nextNodeId).toBeNull()
  })

  test('should handle multiple variable interpolations', () => {
    const node: IMessageNode = { id: 'm1', type: 'message', text: '{{greeting}} {{name}}!', next: null }
    const state: IConversationState = { instanceId: 'i1', chatId: 'c1', variables: { greeting: 'Hello', name: 'World' } }
    const result = executor.execute({ node, state })
    expect(result.reply).toBe('Hello World!')
  })

  test('should handle text without variables', () => {
    const node: IMessageNode = { id: 'm1', type: 'message', text: 'Plain text', next: null }
    const state: IConversationState = { instanceId: 'i1', chatId: 'c1', variables: {} }
    const result = executor.execute({ node, state })
    expect(result.reply).toBe('Plain text')
  })
})
