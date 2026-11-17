import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MessageDirection, SentTextContent } from '@shared/domain/whatsapp/MessageTypes';

import { ChatId } from '@modules/chats/domain/ChatId';
import { InstanceId } from '@modules/instances/domain/InstanceId';
import { MessageAggregate } from '@modules/messages/domain/MessageAggregate';
import { MessageId } from '@modules/messages/domain/MessageId';
import { CreatedAt } from '@modules/shared/domain/CreatedAt';
import { UpdatedAt } from '@modules/shared/domain/UpdatedAt';

const INSTANCE_UUID = '0198f3a2-1b4c-7d5e-8f90-1234567890ab';
const MESSAGE_UUID = '0198f3a2-1b4c-7d5e-8f90-1234567890cd';

const buildContent = (text: string): SentTextContent => ({
  messageType: 'text',
  text,
});

describe('MessageAggregate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exposes the identifier through the messageId getter', () => {
    const messageId = MessageId.fromString(MESSAGE_UUID);

    const aggregate = MessageAggregate.create({
      messageId,
      instanceId: InstanceId.fromString(INSTANCE_UUID),
      chatId: ChatId.fromString('chat-1'),
      senderId: 'sender-1',
      direction: 'outgoing' as MessageDirection,
      timestamp: new Date('2024-01-01T00:00:00.000Z'),
      content: buildContent('hello'),
    });

    expect(aggregate.messageId).toBe(messageId);
  });

  it('exposes the instance and chat identifiers', () => {
    const instanceId = InstanceId.fromString(INSTANCE_UUID);
    const chatId = ChatId.fromString('chat-1');

    const aggregate = MessageAggregate.create({
      messageId: MessageId.fromString(MESSAGE_UUID),
      instanceId,
      chatId,
      senderId: 'sender-1',
      direction: 'outgoing' as MessageDirection,
      timestamp: new Date('2024-01-01T00:00:00.000Z'),
      content: buildContent('hello'),
    });

    expect(aggregate.instanceId).toBe(instanceId);
    expect(aggregate.chatId).toBe(chatId);
  });

  it('exposes the sender, direction and content', () => {
    const aggregate = MessageAggregate.create({
      messageId: MessageId.fromString(MESSAGE_UUID),
      instanceId: InstanceId.fromString(INSTANCE_UUID),
      chatId: ChatId.fromString('chat-1'),
      senderId: 'sender-1',
      direction: 'incoming' as MessageDirection,
      timestamp: new Date('2024-01-01T00:00:00.000Z'),
      content: buildContent('hello'),
    });

    expect(aggregate.senderId).toBe('sender-1');
    expect(aggregate.direction).toBe('incoming');
    expect(aggregate.content).toEqual(buildContent('hello'));
  });

  it('returns a defensive copy of the timestamp', () => {
    const timestamp = new Date('2024-01-01T00:00:00.000Z');

    const aggregate = MessageAggregate.create({
      messageId: MessageId.fromString(MESSAGE_UUID),
      instanceId: InstanceId.fromString(INSTANCE_UUID),
      chatId: ChatId.fromString('chat-1'),
      senderId: 'sender-1',
      direction: 'outgoing' as MessageDirection,
      timestamp,
      content: buildContent('hello'),
    });

    const exposed = aggregate.timestamp;

    expect(exposed).not.toBe(timestamp);
    expect(exposed.getTime()).toBe(timestamp.getTime());
  });

  it('freezes the content object', () => {
    const aggregate = MessageAggregate.create({
      messageId: MessageId.fromString(MESSAGE_UUID),
      instanceId: InstanceId.fromString(INSTANCE_UUID),
      chatId: ChatId.fromString('chat-1'),
      senderId: 'sender-1',
      direction: 'outgoing' as MessageDirection,
      timestamp: new Date('2024-01-01T00:00:00.000Z'),
      content: buildContent('hello'),
    });

    expect(Object.isFrozen(aggregate.content)).toBe(true);
  });

  it('starts without status when none is provided', () => {
    const aggregate = MessageAggregate.create({
      messageId: MessageId.fromString(MESSAGE_UUID),
      instanceId: InstanceId.fromString(INSTANCE_UUID),
      chatId: ChatId.fromString('chat-1'),
      senderId: 'sender-1',
      direction: 'outgoing' as MessageDirection,
      timestamp: new Date('2024-01-01T00:00:00.000Z'),
      content: buildContent('hello'),
    });

    expect(aggregate.status).toBeUndefined();
  });

  it('keeps the status provided on creation', () => {
    const aggregate = MessageAggregate.create({
      messageId: MessageId.fromString(MESSAGE_UUID),
      instanceId: InstanceId.fromString(INSTANCE_UUID),
      chatId: ChatId.fromString('chat-1'),
      senderId: 'sender-1',
      direction: 'outgoing' as MessageDirection,
      timestamp: new Date('2024-01-01T00:00:00.000Z'),
      content: buildContent('hello'),
      status: 'pending',
    });

    expect(aggregate.status).toBe('pending');
  });

  it('marks the message as pending', () => {
    const aggregate = MessageAggregate.create({
      messageId: MessageId.fromString(MESSAGE_UUID),
      instanceId: InstanceId.fromString(INSTANCE_UUID),
      chatId: ChatId.fromString('chat-1'),
      senderId: 'sender-1',
      direction: 'outgoing' as MessageDirection,
      timestamp: new Date('2024-01-01T00:00:00.000Z'),
      content: buildContent('hello'),
    });

    aggregate.markAsPending();

    expect(aggregate.status).toBe('pending');
  });

  it('marks the message as sent', () => {
    const aggregate = MessageAggregate.create({
      messageId: MessageId.fromString(MESSAGE_UUID),
      instanceId: InstanceId.fromString(INSTANCE_UUID),
      chatId: ChatId.fromString('chat-1'),
      senderId: 'sender-1',
      direction: 'outgoing' as MessageDirection,
      timestamp: new Date('2024-01-01T00:00:00.000Z'),
      content: buildContent('hello'),
    });

    aggregate.markAsSent();

    expect(aggregate.status).toBe('sent');
  });

  it('marks the message as delivered', () => {
    const aggregate = MessageAggregate.create({
      messageId: MessageId.fromString(MESSAGE_UUID),
      instanceId: InstanceId.fromString(INSTANCE_UUID),
      chatId: ChatId.fromString('chat-1'),
      senderId: 'sender-1',
      direction: 'outgoing' as MessageDirection,
      timestamp: new Date('2024-01-01T00:00:00.000Z'),
      content: buildContent('hello'),
    });

    aggregate.markAsDelivered();

    expect(aggregate.status).toBe('delivered');
  });

  it('marks the message as read', () => {
    const aggregate = MessageAggregate.create({
      messageId: MessageId.fromString(MESSAGE_UUID),
      instanceId: InstanceId.fromString(INSTANCE_UUID),
      chatId: ChatId.fromString('chat-1'),
      senderId: 'sender-1',
      direction: 'outgoing' as MessageDirection,
      timestamp: new Date('2024-01-01T00:00:00.000Z'),
      content: buildContent('hello'),
    });

    aggregate.markAsRead();

    expect(aggregate.status).toBe('read');
  });

  it('marks the message as failed', () => {
    const aggregate = MessageAggregate.create({
      messageId: MessageId.fromString(MESSAGE_UUID),
      instanceId: InstanceId.fromString(INSTANCE_UUID),
      chatId: ChatId.fromString('chat-1'),
      senderId: 'sender-1',
      direction: 'outgoing' as MessageDirection,
      timestamp: new Date('2024-01-01T00:00:00.000Z'),
      content: buildContent('hello'),
    });

    aggregate.markAsFailed();

    expect(aggregate.status).toBe('failed');
  });

  it('overwrites the previous status on each transition', () => {
    const aggregate = MessageAggregate.create({
      messageId: MessageId.fromString(MESSAGE_UUID),
      instanceId: InstanceId.fromString(INSTANCE_UUID),
      chatId: ChatId.fromString('chat-1'),
      senderId: 'sender-1',
      direction: 'outgoing' as MessageDirection,
      timestamp: new Date('2024-01-01T00:00:00.000Z'),
      content: buildContent('hello'),
    });

    aggregate.markAsPending();
    aggregate.markAsSent();

    expect(aggregate.status).toBe('sent');
  });

  it('throws when changing the status of an incoming message', () => {
    const aggregate = MessageAggregate.create({
      messageId: MessageId.fromString(MESSAGE_UUID),
      instanceId: InstanceId.fromString(INSTANCE_UUID),
      chatId: ChatId.fromString('chat-1'),
      senderId: 'sender-1',
      direction: 'incoming' as MessageDirection,
      timestamp: new Date('2024-01-01T00:00:00.000Z'),
      content: buildContent('hello'),
    });

    expect(() => aggregate.markAsSent()).toThrow(
      'Incoming messages cannot have delivery status changes'
    );
  });

  it('keeps the status untouched when the transition is rejected', () => {
    const aggregate = MessageAggregate.create({
      messageId: MessageId.fromString(MESSAGE_UUID),
      instanceId: InstanceId.fromString(INSTANCE_UUID),
      chatId: ChatId.fromString('chat-1'),
      senderId: 'sender-1',
      direction: 'incoming' as MessageDirection,
      timestamp: new Date('2024-01-01T00:00:00.000Z'),
      content: buildContent('hello'),
    });

    expect(() => aggregate.markAsRead()).toThrow();
    expect(aggregate.status).toBeUndefined();
  });

  it('serializes the aggregate to primitives', () => {
    const timestamp = new Date('2024-01-01T00:00:00.000Z');
    const createdAt = CreatedAt.create(timestamp);
    const updatedAt = UpdatedAt.create(timestamp);

    const aggregate = MessageAggregate.create({
      messageId: MessageId.fromString(MESSAGE_UUID),
      instanceId: InstanceId.fromString(INSTANCE_UUID),
      chatId: ChatId.fromString('chat-1'),
      senderId: 'sender-1',
      direction: 'outgoing' as MessageDirection,
      timestamp,
      content: buildContent('hello'),
      status: 'sent',
      createdAt,
      updatedAt,
    });

    expect(aggregate.toPrimitives()).toEqual({
      messageId: MESSAGE_UUID,
      instanceId: INSTANCE_UUID,
      chatId: 'chat-1',
      senderId: 'sender-1',
      direction: 'outgoing',
      timestamp,
      content: buildContent('hello'),
      status: 'sent',
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  });

  it('exposes the aggregate identifier through the id getter', () => {
    const aggregate = MessageAggregate.create({
      messageId: MessageId.fromString(MESSAGE_UUID),
      instanceId: InstanceId.fromString(INSTANCE_UUID),
      chatId: ChatId.fromString('chat-1'),
      senderId: 'sender-1',
      direction: 'outgoing' as MessageDirection,
      timestamp: new Date('2024-01-01T00:00:00.000Z'),
      content: buildContent('hello'),
    });

    expect(aggregate.id).toBe(MESSAGE_UUID);
  });

  it('restores an aggregate with the same primitive values', () => {
    const aggregate = MessageAggregate.restore({
      messageId: MessageId.fromString(MESSAGE_UUID),
      instanceId: InstanceId.fromString(INSTANCE_UUID),
      chatId: ChatId.fromString('chat-1'),
      senderId: 'sender-1',
      direction: 'outgoing' as MessageDirection,
      timestamp: new Date('2024-01-01T00:00:00.000Z'),
      content: buildContent('hello'),
      status: 'delivered',
    });

    expect(aggregate.status).toBe('delivered');
    expect(aggregate.senderId).toBe('sender-1');
  });

  it('does not publish domain events on creation', () => {
    const aggregate = MessageAggregate.create({
      messageId: MessageId.fromString(MESSAGE_UUID),
      instanceId: InstanceId.fromString(INSTANCE_UUID),
      chatId: ChatId.fromString('chat-1'),
      senderId: 'sender-1',
      direction: 'outgoing' as MessageDirection,
      timestamp: new Date('2024-01-01T00:00:00.000Z'),
      content: buildContent('hello'),
    });

    expect(aggregate.domainEvents).toHaveLength(0);
  });
});
