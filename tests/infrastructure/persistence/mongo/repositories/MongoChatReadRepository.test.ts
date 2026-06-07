import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ChatModel } from '../../../../../src/infrastructure/persistence/mongo/models/ChatModel';
import { MongoChatReadRepository } from '../../../../../src/infrastructure/persistence/mongo/repositories/MongoChatReadRepository';
import { InfrastructureError } from '../../../../../src/shared/infrastructure/errors/InfrastructureError';

vi.mock('../../../../../src/infrastructure/persistence/mongo/models/ChatModel', () => ({
  ChatModel: {
    findOne: vi.fn(),
    find: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

describe('MongoChatReadRepository', () => {
  let repository: MongoChatReadRepository;

  beforeEach(() => {
    repository = new MongoChatReadRepository();
    vi.clearAllMocks();
  });

  const chatDoc = {
    chatId: 'chat-1',
    instanceId: 'instance-1',
    type: 'chat',
    name: 'John Doe',
    phoneNumber: '5219999999999',
    unreadCount: 5,
    lastMessageTimestamp: new Date(),
    isArchived: false,
    isMuted: false,
    participantCount: 2,
    description: 'test group',
    profilePictureUrl: 'https://image.test',
  };

  describe('findById', () => {
    it('should return chat projection', async () => {
      vi.mocked(ChatModel.findOne).mockResolvedValue(chatDoc as any);

      const result = await repository.findById('chat-1', 'instance-1');

      expect(result).toEqual({
        chatId: chatDoc.chatId,
        instanceId: chatDoc.instanceId,
        type: chatDoc.type,
        name: chatDoc.name,
        phoneNumber: chatDoc.phoneNumber,
        unreadCount: chatDoc.unreadCount,
        lastMessageTimestamp: chatDoc.lastMessageTimestamp,
        isArchived: chatDoc.isArchived,
        isMuted: chatDoc.isMuted,
        participantCount: chatDoc.participantCount,
        description: chatDoc.description,
        profilePictureUrl: chatDoc.profilePictureUrl,
      });

      expect(ChatModel.findOne).toHaveBeenCalledWith({
        chatId: 'chat-1',
        instanceId: 'instance-1',
      });
    });

    it('should return null when chat does not exist', async () => {
      vi.mocked(ChatModel.findOne).mockResolvedValue(null);

      const result = await repository.findById('chat-1', 'instance-1');

      expect(result).toBeNull();
    });

    it('should preserve undefined optional fields', async () => {
      vi.mocked(ChatModel.findOne).mockResolvedValue({
        ...chatDoc,
        phoneNumber: undefined,
        participantCount: undefined,
        description: undefined,
        profilePictureUrl: undefined,
      } as any);

      const result = await repository.findById('chat-1', 'instance-1');

      expect(result).toMatchObject({
        phoneNumber: undefined,
        participantCount: undefined,
        description: undefined,
        profilePictureUrl: undefined,
      });
    });

    it('should wrap mongo errors', async () => {
      vi.mocked(ChatModel.findOne).mockRejectedValue(new Error('mongo'));

      await expect(repository.findById('chat-1', 'instance-1')).rejects.toBeInstanceOf(
        InfrastructureError
      );
    });
  });

  describe('findByInstance', () => {
    it('should return mapped chats', async () => {
      vi.mocked(ChatModel.find).mockReturnValue({
        sort: vi.fn().mockResolvedValue([chatDoc, chatDoc]),
      } as any);

      const result = await repository.findByInstance('instance-1');

      expect(result).toHaveLength(2);

      expect(ChatModel.find).toHaveBeenCalledWith({
        instanceId: 'instance-1',
      });
    });

    it('should return empty array', async () => {
      vi.mocked(ChatModel.find).mockReturnValue({
        sort: vi.fn().mockResolvedValue([]),
      } as any);

      const result = await repository.findByInstance('instance-1');

      expect(result).toEqual([]);
    });

    it('should sort by lastMessageTimestamp desc', async () => {
      const sortMock = vi.fn().mockResolvedValue([]);

      vi.mocked(ChatModel.find).mockReturnValue({
        sort: sortMock,
      } as any);

      await repository.findByInstance('instance-1');

      expect(sortMock).toHaveBeenCalledWith({
        lastMessageTimestamp: -1,
      });
    });

    it('should wrap mongo errors', async () => {
      vi.mocked(ChatModel.find).mockReturnValue({
        sort: vi.fn().mockRejectedValue(new Error('mongo')),
      } as any);

      await expect(repository.findByInstance('instance-1')).rejects.toBeInstanceOf(
        InfrastructureError
      );
    });
  });

  describe('findChatsByInstance', () => {
    it('should query only chats', async () => {
      vi.mocked(ChatModel.find).mockReturnValue({
        sort: vi.fn().mockResolvedValue([]),
      } as any);

      await repository.findChatsByInstance('instance-1');

      expect(ChatModel.find).toHaveBeenCalledWith({
        instanceId: 'instance-1',
        type: 'chat',
      });
    });

    it('should wrap mongo errors', async () => {
      vi.mocked(ChatModel.find).mockReturnValue({
        sort: vi.fn().mockRejectedValue(new Error('mongo')),
      } as any);

      await expect(repository.findChatsByInstance('instance-1')).rejects.toBeInstanceOf(
        InfrastructureError
      );
    });
  });

  describe('findGroupsByInstance', () => {
    it('should query only groups', async () => {
      vi.mocked(ChatModel.find).mockReturnValue({
        sort: vi.fn().mockResolvedValue([]),
      } as any);

      await repository.findGroupsByInstance('instance-1');

      expect(ChatModel.find).toHaveBeenCalledWith({
        instanceId: 'instance-1',
        type: 'group',
      });
    });

    it('should wrap mongo errors', async () => {
      vi.mocked(ChatModel.find).mockReturnValue({
        sort: vi.fn().mockRejectedValue(new Error('mongo')),
      } as any);

      await expect(repository.findGroupsByInstance('instance-1')).rejects.toBeInstanceOf(
        InfrastructureError
      );
    });
  });

  describe('exists', () => {
    it('should return true when exists', async () => {
      vi.mocked(ChatModel.countDocuments).mockResolvedValue(1);

      expect(await repository.exists('chat-1', 'instance-1')).toBe(true);
    });

    it('should return false when not exists', async () => {
      vi.mocked(ChatModel.countDocuments).mockResolvedValue(0);

      expect(await repository.exists('chat-1', 'instance-1')).toBe(false);
    });

    it('should wrap mongo errors', async () => {
      vi.mocked(ChatModel.countDocuments).mockRejectedValue(new Error('mongo'));

      await expect(repository.exists('chat-1', 'instance-1')).rejects.toBeInstanceOf(
        InfrastructureError
      );
    });
  });

  describe('countByInstance', () => {
    it('should return count', async () => {
      vi.mocked(ChatModel.countDocuments).mockResolvedValue(10);

      const result = await repository.countByInstance('instance-1');

      expect(result).toBe(10);
    });

    it('should return zero when no chats exist', async () => {
      vi.mocked(ChatModel.countDocuments).mockResolvedValue(0);

      const result = await repository.countByInstance('instance-1');

      expect(result).toBe(0);
    });

    it('should wrap mongo errors', async () => {
      vi.mocked(ChatModel.countDocuments).mockRejectedValue(new Error('mongo'));

      await expect(repository.countByInstance('instance-1')).rejects.toBeInstanceOf(
        InfrastructureError
      );
    });
  });

  describe('toReadProjection', () => {
    it('should map chat document correctly', () => {
      const result = (repository as any).toReadProjection(chatDoc);

      expect(result).toEqual(chatDoc);
    });

    it('should preserve undefined optional fields', () => {
      const result = (repository as any).toReadProjection({
        ...chatDoc,
        phoneNumber: undefined,
        participantCount: undefined,
        description: undefined,
        profilePictureUrl: undefined,
      });

      expect(result.phoneNumber).toBeUndefined();
      expect(result.participantCount).toBeUndefined();
      expect(result.description).toBeUndefined();
      expect(result.profilePictureUrl).toBeUndefined();
    });

    it('should preserve null optional fields', () => {
      const result = (repository as any).toReadProjection({
        ...chatDoc,
        phoneNumber: null,
        participantCount: null,
        description: null,
        profilePictureUrl: null,
      });

      expect(result.phoneNumber).toBeNull();
      expect(result.participantCount).toBeNull();
      expect(result.description).toBeNull();
      expect(result.profilePictureUrl).toBeNull();
    });

    it('should preserve empty string values', () => {
      const result = (repository as any).toReadProjection({
        ...chatDoc,
        name: '',
        phoneNumber: '',
        description: '',
        profilePictureUrl: '',
        participantCount: 0,
      });

      expect(result.name).toBe('');
      expect(result.phoneNumber).toBe('');
      expect(result.description).toBe('');
      expect(result.profilePictureUrl).toBe('');
      expect(result.participantCount).toBe(0);
    });

    it('should preserve large numeric values', () => {
      const timestamp = new Date('2030-01-01T00:00:00.000Z');

      const result = (repository as any).toReadProjection({
        ...chatDoc,
        unreadCount: Number.MAX_SAFE_INTEGER,
        participantCount: 100000,
        lastMessageTimestamp: timestamp,
      });

      expect(result.unreadCount).toBe(Number.MAX_SAFE_INTEGER);

      expect(result.participantCount).toBe(100000);

      expect(result.lastMessageTimestamp).toBe(timestamp);
    });
  });
});
