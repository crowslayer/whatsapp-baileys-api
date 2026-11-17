import { ValidationError } from '@shared/domain/error/ValidationError';
import { UuidValueObject } from '@shared/domain/value-object/UuidValueObject';

export class CampaignId extends UuidValueObject {
  constructor(value: string) {
    super(value);
  }

  static create(): CampaignId {
    return this.random();
  }

  static fromString(value: string): CampaignId {
    return new CampaignId(value);
  }

  protected validate(): void {
    if (!this._value || this._value.trim().length === 0) {
      throw new ValidationError([{ field: 'campaignId', message: 'CampaignId cannot be empty' }]);
    }
  }
}
