export class MockPhoneNormalizer {
  toJid(phone: string) {
    if (phone === 'explode') {
      throw new Error('normalizer error');
    }

    if (phone === 'invalid') {
      return null;
    }

    return `${phone}@s.whatsapp.net`;
  }
}
