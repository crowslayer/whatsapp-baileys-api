import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  campaignIdSchema,
  createCampaignSchema,
  updateCampaignSchema,
} from '@apps/backend/http/validators/express/schemas/campaignSchema';

const asRecord = (schema: unknown): Record<string, Record<string, unknown>> =>
  schema as Record<string, Record<string, unknown>>;

describe('campaignSchema', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('validates the campaign id coming from the params', () => {
    const schema = asRecord(campaignIdSchema);

    expect(schema.campaignId.in).toEqual(['params']);
    expect(schema.campaignId.isUUID).toEqual({ errorMessage: 'Invalid id' });
  });

  it('requires the instance id in the body', () => {
    const schema = asRecord(createCampaignSchema);

    expect(schema.instanceId.in).toEqual(['body']);
    expect(schema.instanceId.exists).toBe(true);
    expect(schema.instanceId.notEmpty).toBe(true);
    expect(schema.instanceId.isUUID).toEqual({ errorMessage: 'Invalid id' });
  });

  it('requires at least one and at most 5000 participants', () => {
    const schema = asRecord(createCampaignSchema);

    expect(schema.numbers.exists).toEqual({
      errorMessage: 'numbers is required for campaign',
    });
    expect(schema.numbers.isArray).toEqual({
      options: { min: 1, max: 5000 },
      errorMessage: 'At least one participant required and maximun 5000',
    });
  });

  it('validates the format of every participant', () => {
    const schema = asRecord(createCampaignSchema);

    expect(schema['numbers.*'].matches).toEqual({
      options: [/^\+?\d{10,15}$/],
      errorMessage: 'numbers not foud or malformed',
    });
  });

  it('limits the campaign name length', () => {
    const schema = asRecord(createCampaignSchema);

    expect(schema.name.isLength).toEqual({
      options: { min: 1, max: 100 },
      errorMessage: 'name must be between 1 and 100 characters',
    });
  });

  it('limits the campaign description length', () => {
    const schema = asRecord(createCampaignSchema);

    expect(schema.description.isLength).toEqual({
      options: { min: 1, max: 200 },
      errorMessage: 'description must be between 1 and 200 characters',
    });
  });

  it('limits the campaign message length', () => {
    const schema = asRecord(createCampaignSchema);

    expect(schema.message.isLength).toEqual({
      options: { min: 1, max: 1000 },
      errorMessage: 'the message must be between 1 and 1000 characters',
    });
  });

  it('exposes every create field', () => {
    const schema = asRecord(createCampaignSchema);

    expect(Object.keys(schema).sort()).toEqual(
      ['description', 'instanceId', 'message', 'name', 'numbers', 'numbers.*'].sort()
    );
  });

  it('adds the campaign id to the update schema', () => {
    const schema = asRecord(updateCampaignSchema);

    expect(Object.keys(schema).sort()).toEqual(
      [
        'campaignId',
        'description',
        'instanceId',
        'message',
        'name',
        'numbers',
        'numbers.*',
      ].sort()
    );
  });
});
