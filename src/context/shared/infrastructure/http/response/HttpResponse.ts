import type { CookieOptions } from 'express';

export type HttpResponse<T> = {
  body: HttpResponseBody<T>;
  headers?: Record<string, string>;
  cookies?: CookieDefinition[];
};

export type CookieDefinition = {
  name: string;
  value: string;
  options: CookieOptions;
};

export type AuditData = {
  path?: string;
  url?: string;
  clientIp?: string;
  proxyChain?: string | string[];
  hostname?: string;
  userAgent?: string;
  timestamp?: string;
};

export type ErrorContent = {
  code: number;
  type: string;
  name: string;
  description: string;
  cause?: unknown;
  stack?: unknown;
};

export interface ISuccessResponse<T> {
  success: true;
  status: number;
  content: T;
  auditData?: AuditData;
}

export interface IErrorResponse<T> {
  success: false;
  status: number;
  errors: ErrorContent[];
  content: T;
  auditData?: AuditData;
}

export type HttpResponseBody<T> = ISuccessResponse<T> | IErrorResponse<T>;
