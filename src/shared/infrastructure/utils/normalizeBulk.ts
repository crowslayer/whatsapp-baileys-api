import { CountryCode } from 'libphonenumber-js';

import { PhoneNormalizer } from '@shared/infrastructure/utils/PhoneNormalizer';

export function normalizeBulk(
  numbers: string[],
  defaultCountry: CountryCode = 'MX'
): {
  valid: string[];
  invalid: string[];
} {
  const normalizer = new PhoneNormalizer(defaultCountry);

  const validSet = new Set<string>();
  const invalid: string[] = [];

  for (const raw of numbers) {
    const jid = normalizer.toJid(raw);

    if (!jid) {
      invalid.push(raw);
      continue;
    }

    validSet.add(jid);
  }

  return {
    valid: Array.from(validSet),
    invalid,
  };
}
