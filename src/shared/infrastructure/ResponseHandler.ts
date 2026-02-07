import { Response } from 'express';

import { AuditData } from './AuditData';
import { ApiError } from './ErrorHandler';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ApiError[];
  metadata: {
    timestamp: Date;
    requestId: string;
    audit?: AuditData;
  };
}

export class ResponseHandler {
  static success<T>(
    res: Response,
    data: T,
    message: string = 'Operation successful',
    statusCode: number = 200,
    audit?: AuditData
  ): void {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      metadata: {
        timestamp: new Date(),
        requestId: res.locals.requestId || this.generateRequestId(),
        audit,
      },
    };

    res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    statusCode: number = 500,
    errors?: ApiError[],
    audit?: AuditData
  ): void {
    const response: ApiResponse = {
      success: false,
      message: 'Operation failed',
      errors,
      metadata: {
        timestamp: new Date(),
        requestId: res.locals.requestId || this.generateRequestId(),
        audit,
      },
    };

    res.status(statusCode).json(response);
  }

  static created<T>(
    res: Response,
    data: T,
    message: string = 'Resource created successfully',
    audit?: AuditData
  ): void {
    this.success(res, data, message, 201, audit);
  }

  static noContent(res: Response, audit?: AuditData): void {
    res.status(204).send();
  }

  static badRequest(
    res: Response,
    message: string = 'Bad request',
    errors?: ApiError[],
    audit?: AuditData
  ): void {
    this.error(res, 400, errors, audit);
  }

  static unauthorized(res: Response, message: string = 'Unauthorized', audit?: AuditData): void {
    this.error(res, 401, undefined, audit);
  }

  static forbidden(
    res: Response,
    statusCode: number = 403,
    errors = [
      {
        code: 1002,
        type: 'FORBIDDEN',
        name: 'Forbidden',
        description: 'Forbidden',
      },
    ],
    audit?: AuditData
  ): void {
    this.error(res, statusCode, errors, audit);
  }

  static notFound(
    res: Response,
    statusCode: number = 404,
    errors = [
      {
        code: 6001,
        type: 'NOT_FOUND',
        name: 'NotFoundError',
        description: 'Resource not found',
      },
    ],
    audit?: AuditData
  ): void {
    this.error(res, 404, errors, audit);
  }

  static conflict(
    res: Response,
    statusCode: number = 409,
    errors = [
      {
        code: 6002,
        type: 'INTERNAL',
        name: 'ConflictError',
        description: 'Resource conflict',
      },
    ],
    audit?: AuditData
  ): void {
    this.error(res, statusCode, errors, audit);
  }

  static internalError(
    res: Response,
    statusCode: number = 500,
    errors = [
      {
        code: 5000,
        type: 'INTERNAL',
        name: 'InternalError',
        description: 'Internal server error',
      },
    ],
    audit?: AuditData
  ): void {
    this.error(res, statusCode, errors, audit);
  }

  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
