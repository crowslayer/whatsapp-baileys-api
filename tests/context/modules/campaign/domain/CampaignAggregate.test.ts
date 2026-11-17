import { describe, it, expect, vi, beforeEach } from 'vitest';

import { InstanceId } from '@modules/instances/domain/InstanceId';

import {
  CampaignAggregate,
  ICampaignRecipient,
  ICampaignProps,
} from '@modules/campaign/domain/CampaignAggregate';
import { CampaignError } from '@modules/campaign/domain/CampaignError';
import { CampaignId } from '@modules/campaign/domain/CampaignId';
import { CampaignName } from '@modules/campaign/domain/CampaignName';
import { CompletedAt } from '@modules/campaign/domain/CompletedAt';
import { Description } from '@modules/campaign/domain/Description';
import { LockedAt } from '@modules/campaign/domain/LockedAt';
import { LockExpiresAt } from '@modules/campaign/domain/LockExpiresAt';
import { Message } from '@modules/campaign/domain/Message';
import { ScheduledAt } from '@modules/campaign/domain/ScheduledAt';
import { StartedAt } from '@modules/campaign/domain/StartedAt';

const CAMPAIGN_UUID = '9c858901-8a57-4791-81fe-4c455b099bc9';
const INSTANCE_UUID = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';
const JID = '5215512345678@s.whatsapp.net';

const buildRecipients = (count: number): ICampaignRecipient[] =>
  Array.from({ length: count }, (_item, index) => ({
    jid: `52155123456${index % 10}@s.whatsapp.net`,
    status: 'pending',
    attempts: 0,
  }));

const buildRestoreProps = (overrides: Partial<ICampaignProps> = {}): ICampaignProps => ({
  campaignId: CampaignId.fromString(CAMPAIGN_UUID),
  instanceId: InstanceId.fromString(INSTANCE_UUID),
  name: CampaignName.create('Winter Campaign'),
  description: Description.create('Promotional campaign for the winter season'),
  message: Message.create('Hello, this is a promotional campaign'),
  recipients: buildRecipients(1),
  status: 'draft',
  lockedBy: null,
  lockedAt: null,
  lockExpiresAt: null,
  ...overrides,
});

describe('CampaignAggregate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should build a draft campaign with a generated identifier', () => {
      const campaign = CampaignAggregate.create({
        instanceId: InstanceId.fromString(INSTANCE_UUID),
        name: CampaignName.create('Winter Campaign'),
        description: Description.create('Promotional campaign for the winter season'),
        message: Message.create('Hello, this is a promotional campaign'),
        recipients: buildRecipients(3),
      });

      expect(campaign.status).toBe('draft');
      expect(campaign.id).toBe(campaign.campaignId.value);
      expect(campaign.recipients).toHaveLength(3);
    });

    it('should initialize the lock fields as null', () => {
      const campaign = CampaignAggregate.create({
        instanceId: InstanceId.fromString(INSTANCE_UUID),
        name: CampaignName.create('Winter Campaign'),
        description: Description.create('Promotional campaign for the winter season'),
        message: Message.create('Hello, this is a promotional campaign'),
        recipients: buildRecipients(1),
      });

      expect(campaign.lockedBy).toBeNull();
      expect(campaign.lockedAt).toBeNull();
      expect(campaign.lockExpiresAt).toBeNull();
    });

    it('should leave the optional timestamps undefined', () => {
      const campaign = CampaignAggregate.create({
        instanceId: InstanceId.fromString(INSTANCE_UUID),
        name: CampaignName.create('Winter Campaign'),
        description: Description.create('Promotional campaign for the winter season'),
        message: Message.create('Hello, this is a promotional campaign'),
        recipients: buildRecipients(1),
      });

      expect(campaign.scheduledAt).toBeUndefined();
      expect(campaign.startedAt).toBeUndefined();
      expect(campaign.completedAt).toBeUndefined();
      expect(campaign.cronExpression).toBeUndefined();
    });

    it('should throw a CampaignError when the recipients reach the limit', () => {
      expect(() =>
        CampaignAggregate.create({
          instanceId: InstanceId.fromString(INSTANCE_UUID),
          name: CampaignName.create('Winter Campaign'),
          description: Description.create('Promotional campaign for the winter season'),
          message: Message.create('Hello, this is a promotional campaign'),
          recipients: buildRecipients(5000),
        })
      ).toThrow(CampaignError);
    });

    it('should accept a campaign with 4999 recipients', () => {
      const campaign = CampaignAggregate.create({
        instanceId: InstanceId.fromString(INSTANCE_UUID),
        name: CampaignName.create('Winter Campaign'),
        description: Description.create('Promotional campaign for the winter season'),
        message: Message.create('Hello, this is a promotional campaign'),
        recipients: buildRecipients(4999),
      });

      expect(campaign.recipients).toHaveLength(4999);
    });

    it('should accept a campaign without recipients', () => {
      const campaign = CampaignAggregate.create({
        instanceId: InstanceId.fromString(INSTANCE_UUID),
        name: CampaignName.create('Winter Campaign'),
        description: Description.create('Promotional campaign for the winter season'),
        message: Message.create('Hello, this is a promotional campaign'),
        recipients: [],
      });

      expect(campaign.recipients).toHaveLength(0);
    });
  });

  describe('restore', () => {
    it('should restore a campaign keeping all its state', () => {
      const lockedAt = LockedAt.create(new Date('2024-05-10T12:00:00.000Z'));
      const lockExpiresAt = LockExpiresAt.create(new Date('2024-05-10T12:01:00.000Z'));
      const scheduledAt = ScheduledAt.create(new Date('2024-05-11T09:00:00.000Z'));
      const startedAt = StartedAt.create(new Date('2024-05-11T10:00:00.000Z'));
      const completedAt = CompletedAt.create(new Date('2024-05-11T11:00:00.000Z'));

      const campaign = CampaignAggregate.restore(
        buildRestoreProps({
          status: 'completed',
          lockedBy: 'worker-1',
          lockedAt,
          lockExpiresAt,
          scheduledAt,
          startedAt,
          completedAt,
          cronExpression: '0 * * * *',
        })
      );

      expect(campaign.status).toBe('completed');
      expect(campaign.lockedBy).toBe('worker-1');
      expect(campaign.lockedAt).toBe(lockedAt);
      expect(campaign.lockExpiresAt).toBe(lockExpiresAt);
      expect(campaign.scheduledAt).toBe(scheduledAt);
      expect(campaign.startedAt).toBe(startedAt);
      expect(campaign.completedAt).toBe(completedAt);
      expect(campaign.cronExpression).toBe('0 * * * *');
    });

    it('should not validate the recipients limit when restoring', () => {
      const campaign = CampaignAggregate.restore(buildRestoreProps({ recipients: buildRecipients(5000) }));

      expect(campaign.recipients).toHaveLength(5000);
    });
  });

  describe('start', () => {
    it('should move a draft campaign to running', () => {
      const campaign = CampaignAggregate.restore(buildRestoreProps({ status: 'draft' }));

      campaign.start();

      expect(campaign.status).toBe('running');
    });

    it('should move a paused campaign to running', () => {
      const campaign = CampaignAggregate.restore(buildRestoreProps({ status: 'paused' }));

      campaign.start();

      expect(campaign.status).toBe('running');
    });

    it('should throw a CampaignError when the campaign is already running', () => {
      const campaign = CampaignAggregate.restore(buildRestoreProps({ status: 'running' }));

      expect(() => campaign.start()).toThrow(CampaignError);
    });

    it('should throw a CampaignError when the campaign is completed', () => {
      const campaign = CampaignAggregate.restore(buildRestoreProps({ status: 'completed' }));

      expect(() => campaign.start()).toThrow('Invalid state transition');
    });
  });

  describe('pause', () => {
    it('should move a running campaign to paused', () => {
      const campaign = CampaignAggregate.restore(buildRestoreProps({ status: 'running' }));

      campaign.pause();

      expect(campaign.status).toBe('paused');
    });

    it('should keep a draft campaign as draft', () => {
      const campaign = CampaignAggregate.restore(buildRestoreProps({ status: 'draft' }));

      campaign.pause();

      expect(campaign.status).toBe('draft');
    });

    it('should keep a paused campaign as paused', () => {
      const campaign = CampaignAggregate.restore(buildRestoreProps({ status: 'paused' }));

      campaign.pause();

      expect(campaign.status).toBe('paused');
    });
  });

  describe('complete', () => {
    it('should move a running campaign to completed', () => {
      const campaign = CampaignAggregate.restore(buildRestoreProps({ status: 'running' }));

      campaign.complete();

      expect(campaign.status).toBe('completed');
    });

    it('should keep a draft campaign as draft', () => {
      const campaign = CampaignAggregate.restore(buildRestoreProps({ status: 'draft' }));

      campaign.complete();

      expect(campaign.status).toBe('draft');
    });

    it('should keep a scheduled campaign as scheduled', () => {
      const campaign = CampaignAggregate.restore(buildRestoreProps({ status: 'scheduled' }));

      campaign.complete();

      expect(campaign.status).toBe('scheduled');
    });
  });

  describe('schedule', () => {
    it('should schedule a draft campaign', () => {
      const campaign = CampaignAggregate.restore(buildRestoreProps({ status: 'draft' }));
      const schedule = ScheduledAt.create(new Date('2024-05-11T09:00:00.000Z'));

      campaign.schedule(schedule);

      expect(campaign.status).toBe('scheduled');
      expect(campaign.scheduledAt).toBe(schedule);
    });

    it('should throw a CampaignError when the campaign is not a draft', () => {
      const campaign = CampaignAggregate.restore(buildRestoreProps({ status: 'running' }));
      const schedule = ScheduledAt.create(new Date('2024-05-11T09:00:00.000Z'));

      expect(() => campaign.schedule(schedule)).toThrow('Only draft campaigns can be scheduled');
    });

    it('should keep the previous schedule when the new one is equal', () => {
      const schedule = ScheduledAt.create(new Date('2024-05-11T09:00:00.000Z'));
      const campaign = CampaignAggregate.restore(
        buildRestoreProps({ status: 'draft', scheduledAt: schedule })
      );

      campaign.schedule(ScheduledAt.create(new Date('2024-05-11T09:00:00.000Z')));

      expect(campaign.status).toBe('scheduled');
      expect(campaign.scheduledAt).toBe(schedule);
    });

    it('should replace the previous schedule when the new one differs', () => {
      const campaign = CampaignAggregate.restore(
        buildRestoreProps({
          status: 'draft',
          scheduledAt: ScheduledAt.create(new Date('2024-05-11T09:00:00.000Z')),
        })
      );
      const next = ScheduledAt.create(new Date('2024-05-12T09:00:00.000Z'));

      campaign.schedule(next);

      expect(campaign.scheduledAt).toBe(next);
    });
  });

  describe('updated', () => {
    it('should update the name when it differs', () => {
      const campaign = CampaignAggregate.restore(buildRestoreProps({ status: 'draft' }));
      const name = CampaignName.create('Summer Campaign');

      campaign.updated({ name });

      expect(campaign.name).toBe(name);
    });

    it('should keep the name when it is equal', () => {
      const campaign = CampaignAggregate.restore(buildRestoreProps({ status: 'draft' }));
      const previous = campaign.name;

      campaign.updated({ name: CampaignName.create('Winter Campaign') });

      expect(campaign.name).toBe(previous);
    });

    it('should update the description and the message', () => {
      const campaign = CampaignAggregate.restore(buildRestoreProps({ status: 'draft' }));
      const description = Description.create('A brand new description');
      const message = Message.create('A brand new message');

      campaign.updated({ description, message });

      expect(campaign.description).toBe(description);
      expect(campaign.message).toBe(message);
    });

    it('should update the instance identifier', () => {
      const campaign = CampaignAggregate.restore(buildRestoreProps({ status: 'draft' }));
      const instanceId = InstanceId.fromString('11111111-2222-4333-8444-555555555555');

      campaign.updated({ instanceId });

      expect(campaign.instanceId).toBe(instanceId);
    });

    it('should replace the recipients when an array is provided', () => {
      const campaign = CampaignAggregate.restore(buildRestoreProps({ status: 'draft' }));

      campaign.updated({ recipients: buildRecipients(5) });

      expect(campaign.recipients).toHaveLength(5);
    });

    it('should keep the recipients when no array is provided', () => {
      const campaign = CampaignAggregate.restore(buildRestoreProps({ status: 'draft' }));

      campaign.updated({ recipients: undefined });

      expect(campaign.recipients).toHaveLength(1);
    });

    it('should keep the status untouched', () => {
      const campaign = CampaignAggregate.restore(buildRestoreProps({ status: 'running' }));

      campaign.updated({ name: CampaignName.create('Summer Campaign') });

      expect(campaign.status).toBe('running');
    });
  });

  it('should expose the aggregate identity through the id getter', () => {
    const campaign = CampaignAggregate.restore(buildRestoreProps());

    expect(campaign.id).toBe(CAMPAIGN_UUID);
  });

  it('should expose the recipients of the campaign', () => {
    const campaign = CampaignAggregate.restore(
      buildRestoreProps({
        recipients: [{ jid: JID, status: 'failed', attempts: 3, lastError: 'boom' }],
      })
    );

    expect(campaign.recipients[0]).toEqual({
      jid: JID,
      status: 'failed',
      attempts: 3,
      lastError: 'boom',
    });
  });
});
