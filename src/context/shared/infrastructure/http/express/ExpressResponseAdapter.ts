import { ExpressAuditDataFactory } from '@shared/infrastructure/http/express/ExpressAuditDataFactory';
import { HttpResponse } from '@shared/infrastructure/http/response/HttpResponse';

import type { Request, Response } from 'express';

export class ExpressResponseAdapter {
  static send<T>(req: Request, res: Response, response: HttpResponse<T>): void {
    const { headers, cookies, body } = response;
    const { status } = body;

    if (headers) {
      for (const [name, value] of Object.entries(headers)) {
        if (value !== undefined) {
          res.setHeader(name, String(value));
        }
      }
    }

    if (cookies) {
      for (const cookie of cookies) {
        res.cookie(
          cookie.name,
          cookie.value,
          cookie.options ?? {
            sameSite: 'strict',
            secure: true,
            httpOnly: true,
          }
        );
      }
    }

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    res.status(status);

    if (status === 204) {
      res.end();
      return;
    }

    const isErrorResponse = status >= 400;

    const responseBody = {
      ...body,
      ...(!isErrorResponse && { auditData: ExpressAuditDataFactory.create(req) }),
    };

    res.json(responseBody);
  }
}
