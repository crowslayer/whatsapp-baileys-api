import { AuditData } from '@shared/infrastructure/http/response/HttpResponse';

import type { Request } from 'express';

export class ExpressAuditDataFactory {
  static create(req: Request): AuditData {
    const { ip, ips, hostname, headers, path, originalUrl } = req;

    return {
      ...(path ? { path } : {}),
      ...(originalUrl ? { url: originalUrl } : {}),
      ...(ip ? { clientIp: ip } : {}),
      ...(ips.length > 0 ? { proxyChain: [...ips] } : {}),
      ...(hostname ? { hostname } : {}),
      ...(headers['user-agent'] ? { userAgent: headers['user-agent'] } : {}),
      timestamp: new Date().toISOString(),
    };
  }
}
