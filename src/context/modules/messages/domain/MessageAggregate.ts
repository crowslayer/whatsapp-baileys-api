import { AggregateRoot } from '@shared/domain/AggregateRoot';
import {
  MessageDirection,
  MessageStatus,
  SentMessageContent,
} from '@shared/domain/whatsapp/MessageTypes';

import { ChatId } from '@modules/chats/domain/ChatId';
import { InstanceId } from '@modules/instances/domain/InstanceId';
import { MessageId } from '@modules/messages/domain/MessageId';
import { CreatedAt } from '@modules/shared/domain/CreatedAt';
import { UpdatedAt } from '@modules/shared/domain/UpdatedAt';

interface IMessageProps {
  messageId: MessageId;
  instanceId: InstanceId;
  chatId: ChatId;
  senderId: string;
  direction: MessageDirection;
  timestamp: Date;
  content: SentMessageContent;
  status?: MessageStatus;
  createdAt?: CreatedAt;
  updatedAt?: UpdatedAt;
}

interface IMessage {
  messageId: string;
  instanceId: string;
  chatId: string;
  senderId: string;
  direction: MessageDirection;
  timestamp: Date;
  content: SentMessageContent;
  status?: MessageStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export class MessageAggregate extends AggregateRoot<string> {
  private readonly _messageId: MessageId;
  private readonly _instanceId: InstanceId;
  private readonly _chatId: ChatId;
  private readonly _senderId: string;
  private readonly _direction: MessageDirection;
  private readonly _timestamp: Date;
  private readonly _content: Readonly<SentMessageContent>;
  private _status?: MessageStatus;

  private constructor(props: IMessageProps) {
    super(props.messageId.value, props.createdAt?.value, props.updatedAt?.value);
    // this.validate(props);

    this._messageId = props.messageId;
    this._instanceId = props.instanceId;
    this._chatId = props.chatId;
    this._senderId = props.senderId;
    this._direction = props.direction;
    this._timestamp = props.timestamp;
    this._content = Object.freeze(props.content);

    this._status = props.status;
  }

  // ─────────────────────────────────────────────
  // Factory
  // ─────────────────────────────────────────────

  static create(props: IMessageProps): MessageAggregate {
    return new MessageAggregate(props);
  }

  // ─────────────────────────────────────────────
  // Restore
  // ─────────────────────────────────────────────

  static restore(props: IMessageProps): MessageAggregate {
    return new MessageAggregate(props);
  }

  // ─────────────────────────────────────────────
  // Getters
  // ─────────────────────────────────────────────

  get messageId(): MessageId {
    return this._messageId;
  }

  get instanceId(): InstanceId {
    return this._instanceId;
  }

  get chatId(): ChatId {
    return this._chatId;
  }

  get senderId(): string {
    return this._senderId;
  }

  get direction(): MessageDirection {
    return this._direction;
  }

  get timestamp(): Date {
    return new Date(this._timestamp);
  }

  get content(): SentMessageContent {
    return this._content;
  }

  get status(): MessageStatus | undefined {
    return this._status;
  }

  toPrimitives(): IMessage {
    return {
      messageId: this._messageId.value,
      instanceId: this._instanceId.value,
      chatId: this._chatId.value,
      senderId: this._senderId,
      direction: this._direction,
      timestamp: this._timestamp,
      content: this._content,
      status: this._status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  // ─────────────────────────────────────────────
  // Domain behavior
  // ─────────────────────────────────────────────

  markAsPending(): void {
    this.changeStatus('pending');
  }

  markAsSent(): void {
    this.changeStatus('sent');
  }

  markAsDelivered(): void {
    this.changeStatus('delivered');
  }

  markAsRead(): void {
    this.changeStatus('read');
  }

  markAsFailed(): void {
    this.changeStatus('failed');
  }

  // ─────────────────────────────────────────────
  // Status transition
  // ─────────────────────────────────────────────

  private changeStatus(status: MessageStatus): void {
    if (this._direction === 'incoming') {
      throw new Error('Incoming messages cannot have delivery status changes');
    }

    this._status = status;
  }

  // ─────────────────────────────────────────────
  // Validation
  // ─────────────────────────────────────────────

  protected validate(): void {
    if (!this._messageId) {
      throw new Error('Message id is required');
    }

    if (!this._instanceId) {
      throw new Error('Instance id is required');
    }

    if (!this._chatId) {
      throw new Error('Chat id is required');
    }

    if (!this._senderId?.trim()) {
      throw new Error('Sender id is required');
    }

    if (!(this._timestamp instanceof Date) || isNaN(this._timestamp.getTime())) {
      throw new Error('Invalid message timestamp');
    }

    if (!this._content) {
      throw new Error('Message content is required');
    }

    if (this._direction === 'incoming' && this._status !== undefined) {
      throw new Error('Incoming messages cannot have an outgoing status');
    }
  }
}
