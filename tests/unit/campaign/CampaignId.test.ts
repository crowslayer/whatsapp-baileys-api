import { CampaignId } from '../../../src/domain/campaign/CampaignId'
import { ValidationError } from '../../../src/shared/infrastructure/errors/ValidationError'

describe('CampaignId', () => {
  test('should create from string', () => {
    const id = CampaignId.fromString('camp-123')
    expect(id.value).toBe('camp-123')
  })

  test('should generate unique id with create()', () => {
    const id1 = CampaignId.create()
    const id2 = CampaignId.create()
    expect(id1.value).toBeTruthy()
    expect(id1.value).not.toBe(id2.value)
  })

  test('should throw ValidationError for empty string', () => {
    expect(() => CampaignId.fromString('')).toThrow(ValidationError)
  })

  test('equals returns true for same value', () => {
    expect(CampaignId.fromString('same').equals(CampaignId.fromString('same'))).toBe(true)
  })

  test('equals returns false for different values', () => {
    expect(CampaignId.fromString('a').equals(CampaignId.fromString('b'))).toBe(false)
  })
})
