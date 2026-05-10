import { PhoneNormalizer } from '../../../src/shared/infrastructure/utils/PhoneNormalizer'

describe('PhoneNormalizer', () => {
  const normalizer = new PhoneNormalizer()

  test('normalize with valid MX number returns normalized number with 521 prefix', () => {
    const result = normalizer.normalize('+525512345678')
    expect(result).toBe('5215512345678')
  })

  test('normalize with invalid number returns null', () => {
    const result = normalizer.normalize('not-a-phone')
    expect(result).toBeNull()
  })

  test('normalize with non-MX number keeps original format', () => {
    const result = normalizer.normalize('+12128675309')
    expect(result).toBe('12128675309')
  })

  test('normalize with empty string returns null', () => {
    const result = normalizer.normalize('')
    expect(result).toBeNull()
  })

  test('toJid with valid number returns jid format', () => {
    const result = normalizer.toJid('+525512345678')
    expect(result).toBe('5215512345678@s.whatsapp.net')
  })

  test('toJid with already-jid string returns as-is', () => {
    const jid = '5215512345678@s.whatsapp.net'
    const result = normalizer.toJid(jid)
    expect(result).toBe(jid)
  })

  test('toJid with g.us jid returns as-is', () => {
    const jid = '1234567890@g.us'
    const result = normalizer.toJid(jid)
    expect(result).toBe(jid)
  })

  test('toJid with invalid number returns null', () => {
    const result = normalizer.toJid('not-a-phone')
    expect(result).toBeNull()
  })
})
