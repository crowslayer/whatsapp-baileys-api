export interface AuditData {
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
  private audit: AuditData;

  constructor(action: string, resource: string) {
    this.audit = {
      action,
      resource,
      timestamp: new Date(),
    };
  }

  withUser(userId: string, userName?: string): this {
    this.audit.userId = userId;
    this.audit.userName = userName;
    return this;
  }

  withResourceId(resourceId: string): this {
    this.audit.resourceId = resourceId;
    return this;
  }

  withRequest(ipAddress?: string, userAgent?: string): this {
    this.audit.ipAddress = ipAddress;
    this.audit.userAgent = userAgent;
    return this;
  }

  withDetails(details: Record<string, any>): this {
    this.audit.details = details;
    return this;
  }

  build(): AuditData {
    return this.audit;
  }
}
