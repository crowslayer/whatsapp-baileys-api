import { Response } from 'express';
import { AuditData } from './AuditData';

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: {
      code: string;
      message: string;
      details?: any;
    };
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
    ): Response {
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
  
      return res.status(statusCode).json(response);
    }
  
    static error(
      res: Response,
      message: string,
      errorCode: string = 'INTERNAL_ERROR',
      statusCode: number = 500,
      details?: any,
      audit?: AuditData
    ): Response {
      const response: ApiResponse = {
        success: false,
        message: 'Operation failed',
        error: {
          code: errorCode,
          message,
          details,
        },
        metadata: {
          timestamp: new Date(),
          requestId: res.locals.requestId || this.generateRequestId(),
          audit,
        },
      };
  
      return res.status(statusCode).json(response);
    }
  
    static created<T>(
      res: Response,
      data: T,
      message: string = 'Resource created successfully',
      audit?: AuditData
    ): Response {
      return this.success(res, data, message, 201, audit);
    }
  
    static noContent(res: Response, audit?: AuditData): Response {
      return res.status(204).send();
    }
  
    static badRequest(
      res: Response,
      message: string = 'Bad request',
      details?: any,
      audit?: AuditData
    ): Response {
      return this.error(res, message, 'BAD_REQUEST', 400, details, audit);
    }
  
    static unauthorized(
      res: Response,
      message: string = 'Unauthorized',
      audit?: AuditData
    ): Response {
      return this.error(res, message, 'UNAUTHORIZED', 401, undefined, audit);
    }
  
    static forbidden(
      res: Response,
      message: string = 'Forbidden',
      audit?: AuditData
    ): Response {
      return this.error(res, message, 'FORBIDDEN', 403, undefined, audit);
    }
  
    static notFound(
      res: Response,
      message: string = 'Resource not found',
      audit?: AuditData
    ): Response {
      return this.error(res, message, 'NOT_FOUND', 404, undefined, audit);
    }
  
    static conflict(
      res: Response,
      message: string = 'Resource conflict',
      details?: any,
      audit?: AuditData
    ): Response {
      return this.error(res, message, 'CONFLICT', 409, details, audit);
    }
  
    static internalError(
      res: Response,
      message: string = 'Internal server error',
      details?: any,
      audit?: AuditData
    ): Response {
      return this.error(res, message, 'INTERNAL_ERROR', 500, details, audit);
    }
  
    private static generateRequestId(): string {
      return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }