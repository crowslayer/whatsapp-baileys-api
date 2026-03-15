export interface IAuditData {
  userId?: string;
  userName?: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  details?: Record<string, any>;
}

export class AuditDataBuilder {
  private _audit: IAuditData;

  constructor(action: string, resource: string) {
    this._audit = {
      action,
      resource,
      timestamp: new Date(),
    };
  }

  withUser(userId: string, userName?: string): this {
    this._audit.userId = userId;
    this._audit.userName = userName;
    return this;
  }

  withResourceId(resourceId: string): this {
    this._audit.resourceId = resourceId;
    return this;
  }

  withRequest(ipAddress?: string, userAgent?: string): this {
    this._audit.ipAddress = ipAddress;
    this._audit.userAgent = userAgent;
    return this;
  }

  withDetails(details: Record<string, any>): this {
    this._audit.details = details;
    return this;
  }

  build(): IAuditData {
    return this._audit;
  }
}
