import { ChatType } from '../../../src/domain/value-objects/ChatType';

describe('ChatType', () => {
  test('INDIVIDUAL has value individual', () => {
    expect(ChatType.INDIVIDUAL.value).toBe('chat');
  });

  test('GROUP has value group', () => {
    expect(ChatType.GROUP.value).toBe('group');
  });

  test('create(individual) works', () => {
    const chatType = ChatType.create('chat');
    expect(chatType.value).toBe('chat');
  });

  test('create(group) works', () => {
    const chatType = ChatType.create('group');
    expect(chatType.value).toBe('group');
  });

  test('create(invalid) throws Error', () => {
    expect(() => ChatType.create('invalid')).toThrow(Error);
  });

  test('isGroup returns true for GROUP, false for INDIVIDUAL', () => {
    expect(ChatType.GROUP.isGroup()).toBe(true);
    expect(ChatType.INDIVIDUAL.isGroup()).toBe(false);
  });

  test('isIndividual returns true for INDIVIDUAL, false for GROUP', () => {
    expect(ChatType.INDIVIDUAL.isIndividual()).toBe(true);
    expect(ChatType.GROUP.isIndividual()).toBe(false);
  });

  test('toString returns the value', () => {
    expect(ChatType.INDIVIDUAL.toString()).toBe('chat');
    expect(ChatType.GROUP.toString()).toBe('group');
  });
});
