import { CountryCode, parsePhoneNumberFromString } from 'libphonenumber-js';

export class PhoneNormalizer {
  constructor(private defaultCountry: CountryCode = 'MX') {}

  normalize(raw: string): string | null {
    try {
      const phone = parsePhoneNumberFromString(raw, 'MX');

      if (!phone || !phone.isValid()) return null;

      let number = phone.number.replace('+', '');

      // FIX México (WA legacy)
      if (phone.country === 'MX') {
        if (number.startsWith('52') && !number.startsWith('521')) {
          number = `521${number.slice(2)}`;
        }
      }

      return number;
    } catch {
      return null;
    }
  }

  toJid(raw: string): string | null {
    if (this.iJid(raw)) return raw;

    const normalized = this.normalize(raw);

    if (!normalized) return null;

    return `${normalized}@s.whatsapp.net`;
  }

  private iJid(jid: string): boolean {
    return jid.endsWith('@s.whatsapp.net') || jid.endsWith('@g.us') || jid.endsWith('@lid');
  }
}
