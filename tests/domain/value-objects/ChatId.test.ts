import { ChatId } from '../../../src/domain/value-objects/ChatId'

describe('ChatId', () => {
  test('fromString creates valid ChatId', () => {
    const chatId = ChatId.fromString('some-chat-id')
    expect(chatId.value).toBe('some-chat-id')
  })

  test('fromString with empty string throws Error', () => {
    expect(() => ChatId.fromString('')).toThrow(Error)
  })

  test('fromString with only spaces throws Error', () => {
    expect(() => ChatId.fromString('   ')).toThrow(Error)
  })

  test('equals returns true for same value', () => {
    const a = ChatId.fromString('chat-1')
    const b = ChatId.fromString('chat-1')
    expect(a.equals(b)).toBe(true)
  })

  test('equals returns false for different value', () => {
    const a = ChatId.fromString('chat-a')
    const b = ChatId.fromString('chat-b')
    expect(a.equals(b)).toBe(false)
  })

  test('value returns the trimmed string', () => {
    const chatId = ChatId.fromString('  trimmed-chat  ')
    expect(chatId.value).toBe('trimmed-chat')
  })

  test('toString returns the value', () => {
    const chatId = ChatId.fromString('chat-42')
    expect(chatId.toString()).toBe('chat-42')
  })
})
