import { ChatId } from '@domain/value-objects/ChatId';
import { ChatType } from '@domain/value-objects/ChatType';

import { AggregateRoot } from '@shared/domain/AggregateRoot';

export interface IChatProps {
  chatId: ChatId;
  instanceId: string;
  type: ChatType;
  name: string;
  phoneNumber?: string;
  unreadCount: number;
  lastMessageTimestamp?: Date;
  isArchived: boolean;
  isMuted: boolean;
  participantCount?: number;
  description?: string;
  profilePictureUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IRestoreChatProps extends IChatProps {
  createdAt: Date;
  updatedAt: Date;
}

export class ChatAggregate {
  private readonly _chatId: ChatId;
  private readonly _instanceId: string;
  private _type: ChatType;
  private _name: string;
  private _phoneNumber?: string;
  private _unreadCount: number;
  private _lastMessageTimestamp?: Date;
  private _isArchived: boolean;
  private _isMuted: boolean;
  private _participantCount?: number;
  private _description?: string;
  private _profilePictureUrl?: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: IRestoreChatProps) {
    this._chatId = props.chatId;
    this._instanceId = props.instanceId;
    this._type = props.type;
    this._name = props.name;
    this._phoneNumber = props.phoneNumber;
    this._unreadCount = props.unreadCount;
    this._lastMessageTimestamp = props.lastMessageTimestamp;
    this._isArchived = props.isArchived;
    this._isMuted = props.isMuted;
    this._participantCount = props.participantCount;
    this._description = props.description;
    this._profilePictureUrl = props.profilePictureUrl;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  /**
   * Factory: creates a new chat from fresh data (e.g. from Baileys).
   */
  static create(props: IChatProps): ChatAggregate {
    const now = new Date();
    return new ChatAggregate({
      ...props,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  /**
   * Factory: restores an existing chat from persistence.
   */
  static restore(props: IRestoreChatProps): ChatAggregate {
    return new ChatAggregate(props);
  }

  // ─── Getters ──────────────────────────────────────────────────────────────

  get chatId(): string {
    return this._chatId.value;
  }

  get instanceId(): string {
    return this._instanceId;
  }

  get type(): ChatType {
    return this._type;
  }

  get name(): string {
    return this._name;
  }

  get phoneNumber(): string | undefined {
    return this._phoneNumber;
  }

  get unreadCount(): number {
    return this._unreadCount;
  }

  get lastMessageTimestamp(): Date | undefined {
    return this._lastMessageTimestamp;
  }

  get isArchived(): boolean {
    return this._isArchived;
  }

  get isMuted(): boolean {
    return this._isMuted;
  }

  get participantCount(): number | undefined {
    return this._participantCount;
  }

  get description(): string | undefined {
    return this._description;
  }

  get profilePictureUrl(): string | undefined {
    return this._profilePictureUrl;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // ─── Domain behaviours ────────────────────────────────────────────────────

  isGroup(): boolean {
    return this._type.isGroup();
  }

  isIndividual(): boolean {
    return this._type.isIndividual();
  }

  updateFromBaileys(props: Partial<Omit<IChatProps, 'chatId' | 'instanceId'>>): void {
    if (props.name !== undefined) this._name = props.name;
    if (props.unreadCount !== undefined) this._unreadCount = props.unreadCount;
    if (props.lastMessageTimestamp !== undefined)
      this._lastMessageTimestamp = props.lastMessageTimestamp;
    if (props.isArchived !== undefined) this._isArchived = props.isArchived;
    if (props.isMuted !== undefined) this._isMuted = props.isMuted;
    if (props.participantCount !== undefined) this._participantCount = props.participantCount;
    if (props.description !== undefined) this._description = props.description;
    if (props.profilePictureUrl !== undefined) this._profilePictureUrl = props.profilePictureUrl;
    this._updatedAt = new Date();
  }
}
