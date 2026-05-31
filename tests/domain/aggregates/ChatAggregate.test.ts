import { ChatAggregate } from '../../../src/domain/aggregates/ChatAggregate';
import { ChatId } from '../../../src/domain/value-objects/ChatId';
import { ChatType } from '../../../src/domain/value-objects/ChatType';

describe('ChatAggregate', () => {
  const chatId = ChatId.fromString('chat-1');
  const instanceId = 'inst-1';
  const type = ChatType.INDIVIDUAL;

  test('create with all props sets values correctly', () => {
    const chat = ChatAggregate.create({
      chatId,
      instanceId,
      type,
      name: 'Test Chat',
      unreadCount: 5,
      isArchived: true,
      isMuted: false,
    });
    expect(chat.chatId).toBe('chat-1');
    expect(chat.instanceId).toBe('inst-1');
    expect(chat.type).toBe(ChatType.INDIVIDUAL);
    expect(chat.name).toBe('Test Chat');
    expect(chat.unreadCount).toBe(5);
    expect(chat.isArchived).toBe(true);
    expect(chat.isMuted).toBe(false);
  });

  test('create with optional props (phoneNumber, profilePictureUrl, etc.)', () => {
    const chat = ChatAggregate.create({
      chatId,
      instanceId,
      type,
      name: 'Opt Chat',
      phoneNumber: '5215512345678',
      unreadCount: 0,
      lastMessageTimestamp: new Date('2024-01-01'),
      isArchived: false,
      isMuted: true,
      participantCount: 10,
      description: 'A group chat',
      profilePictureUrl: 'http://pic.test/chat.jpg',
    });
    expect(chat.phoneNumber).toBe('5215512345678');
    expect(chat.lastMessageTimestamp).toEqual(new Date('2024-01-01'));
    expect(chat.participantCount).toBe(10);
    expect(chat.description).toBe('A group chat');
    expect(chat.profilePictureUrl).toBe('http://pic.test/chat.jpg');
  });

  test('create sets createdAt/updatedAt', () => {
    const before = new Date();
    const chat = ChatAggregate.create({
      chatId,
      instanceId,
      type,
      name: 'Time Test',
      unreadCount: 0,
      isArchived: false,
      isMuted: false,
    });
    const after = new Date();
    expect(chat.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(chat.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    expect(chat.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(chat.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  test('restore preserves all values including timestamps', () => {
    const createdAt = new Date('2023-01-01');
    const updatedAt = new Date('2023-06-15');
    const chat = ChatAggregate.restore({
      chatId,
      instanceId,
      type,
      name: 'Restored Chat',
      phoneNumber: '5215512345678',
      unreadCount: 3,
      lastMessageTimestamp: new Date('2023-06-14'),
      isArchived: true,
      isMuted: false,
      participantCount: 5,
      description: 'Restored desc',
      profilePictureUrl: 'http://pic.test/restored.jpg',
      createdAt,
      updatedAt,
    });
    expect(chat.chatId).toBe('chat-1');
    expect(chat.instanceId).toBe('inst-1');
    expect(chat.type).toBe(ChatType.INDIVIDUAL);
    expect(chat.name).toBe('Restored Chat');
    expect(chat.phoneNumber).toBe('5215512345678');
    expect(chat.unreadCount).toBe(3);
    expect(chat.lastMessageTimestamp).toEqual(new Date('2023-06-14'));
    expect(chat.isArchived).toBe(true);
    expect(chat.isMuted).toBe(false);
    expect(chat.participantCount).toBe(5);
    expect(chat.description).toBe('Restored desc');
    expect(chat.profilePictureUrl).toBe('http://pic.test/restored.jpg');
    expect(chat.createdAt).toEqual(new Date('2023-01-01'));
    expect(chat.updatedAt).toEqual(new Date('2023-06-15'));
  });

  test('chatId getter returns the value', () => {
    const chat = ChatAggregate.create({
      chatId,
      instanceId,
      type,
      name: 'Getter Chat',
      unreadCount: 0,
      isArchived: false,
      isMuted: false,
    });
    expect(chat.chatId).toBe('chat-1');
  });

  test('instanceId getter returns correct value', () => {
    const chat = ChatAggregate.create({
      chatId,
      instanceId,
      type,
      name: 'Instance Getter',
      unreadCount: 0,
      isArchived: false,
      isMuted: false,
    });
    expect(chat.instanceId).toBe('inst-1');
  });

  test('type getter returns ChatType', () => {
    const chat = ChatAggregate.create({
      chatId,
      instanceId,
      type,
      name: 'Type Getter',
      unreadCount: 0,
      isArchived: false,
      isMuted: false,
    });
    expect(chat.type).toBe(ChatType.INDIVIDUAL);
  });

  test('isGroup() delegates to type.isGroup()', () => {
    const individual = ChatAggregate.create({
      chatId,
      instanceId,
      type: ChatType.INDIVIDUAL,
      name: 'Individual',
      unreadCount: 0,
      isArchived: false,
      isMuted: false,
    });
    const group = ChatAggregate.create({
      chatId,
      instanceId,
      type: ChatType.GROUP,
      name: 'Group',
      unreadCount: 0,
      isArchived: false,
      isMuted: false,
    });
    expect(individual.isGroup()).toBe(false);
    expect(group.isGroup()).toBe(true);
  });

  test('isIndividual() delegates to type.isIndividual()', () => {
    const individual = ChatAggregate.create({
      chatId,
      instanceId,
      type: ChatType.INDIVIDUAL,
      name: 'Individual',
      unreadCount: 0,
      isArchived: false,
      isMuted: false,
    });
    const group = ChatAggregate.create({
      chatId,
      instanceId,
      type: ChatType.GROUP,
      name: 'Group',
      unreadCount: 0,
      isArchived: false,
      isMuted: false,
    });
    expect(individual.isIndividual()).toBe(true);
    expect(group.isIndividual()).toBe(false);
  });

  test('updateFromBaileys updates fields: name, unreadCount, lastMessageTimestamp', () => {
    const chat = ChatAggregate.create({
      chatId,
      instanceId,
      type,
      name: 'Old Name',
      unreadCount: 1,
      isArchived: false,
      isMuted: false,
    });
    chat.updateFromBaileys({
      name: 'New Name',
      unreadCount: 10,
      lastMessageTimestamp: new Date('2024-06-01'),
    });
    expect(chat.name).toBe('New Name');
    expect(chat.unreadCount).toBe(10);
    expect(chat.lastMessageTimestamp).toEqual(new Date('2024-06-01'));
  });

  test('updateFromBaileys updates optional fields: isArchived, isMuted, participantCount, description, profilePictureUrl', () => {
    const chat = ChatAggregate.create({
      chatId,
      instanceId,
      type,
      name: 'Opt Update',
      unreadCount: 0,
      isArchived: false,
      isMuted: false,
    });
    chat.updateFromBaileys({
      isArchived: true,
      isMuted: true,
      participantCount: 20,
      description: 'Updated desc',
      profilePictureUrl: 'http://pic.test/updated.jpg',
    });
    expect(chat.isArchived).toBe(true);
    expect(chat.isMuted).toBe(true);
    expect(chat.participantCount).toBe(20);
    expect(chat.description).toBe('Updated desc');
    expect(chat.profilePictureUrl).toBe('http://pic.test/updated.jpg');
  });

  test('updateFromBaileys updates updatedAt timestamp', () => {
    const chat = ChatAggregate.create({
      chatId,
      instanceId,
      type,
      name: 'Timestamp Update',
      unreadCount: 0,
      isArchived: false,
      isMuted: false,
    });
    const before = chat.updatedAt;
    chat.updateFromBaileys({ name: 'Updated' });
    expect(chat.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  test('updateFromBaileys ignores undefined fields (only updates defined ones)', () => {
    const chat = ChatAggregate.create({
      chatId,
      instanceId,
      type,
      name: 'Ignore Undefined',
      unreadCount: 5,
      isArchived: false,
      isMuted: true,
      phoneNumber: '5215512345678',
    });
    chat.updateFromBaileys({
      name: 'Still Updated',
      unreadCount: undefined,
      isArchived: undefined,
      phoneNumber: undefined,
    });
    expect(chat.name).toBe('Still Updated');
    expect(chat.unreadCount).toBe(5);
    expect(chat.isArchived).toBe(false);
    expect(chat.phoneNumber).toBe('5215512345678');
  });
});
