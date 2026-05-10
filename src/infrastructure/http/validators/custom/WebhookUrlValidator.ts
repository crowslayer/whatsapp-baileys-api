import { URL } from 'url';

import { body } from 'express-validator';

export function webhookUrlValidator(): ReturnType<typeof body> {
  const requireHttps = process.env.NODE_ENV === 'production';

  return body('webhookUrl')
    .optional()
    .isURL({
      protocols: requireHttps ? ['https'] : ['http', 'https'],
      require_protocol: true,
      require_tld: true,
    })
    .withMessage(
      requireHttps ? 'Webhook URL must use HTTPS protocol in production' : 'Invalid webhook URL'
    )
    .custom((value: unknown) => {
      if (!value) return true;

      try {
        const url = new URL(value as string);

        if (requireHttps && url.protocol !== 'https:') {
          throw new Error('Webhook URL must use HTTPS protocol in production');
        }

        return true;
      } catch {
        throw new Error('Invalid webhook URL');
      }
    });
}
