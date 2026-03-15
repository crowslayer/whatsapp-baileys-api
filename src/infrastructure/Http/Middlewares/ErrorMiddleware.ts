import { NextFunction, Request, Response } from 'express';

import { ILogger } from '@infrastructure/loggers/Logger';

import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { ApiError } from '@shared/infrastructure/ErrorHandler';
import { ApplicationError } from '@shared/infrastructure/errors/ApplicationError';
import { DomainError } from '@shared/infrastructure/errors/DomainError';
import { ErrorCode } from '@shared/infrastructure/errors/ErrorCodes';
import { ErrorType } from '@shared/infrastructure/errors/ErrorType';
import { InfrastructureError } from '@shared/infrastructure/errors/InfrastructureError';
import { UnauthorizedError } from '@shared/infrastructure/errors/UnauthorizedError';
import { ValidationError } from '@shared/infrastructure/errors/ValidationError';
import { WhatsAppConnectionError } from '@shared/infrastructure/errors/WhatsAppConnectionError';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';

import { StatusCode } from '../StatusCode';

type ErrorHandler = {
  supports: (error: unknown) => boolean;
  handle: (error: Error, req: Request, res: Response, logger?: ILogger) => void;
};

type ErrorPayload = {
  code: number;
  type: string;
  name: string;
  message: string;
  description: string;
  cause?: unknown;
  stack: unknown;
};

const ERROR_HANDLERS: ErrorHandler[] = [
  {
    supports: (e): e is UnauthorizedError => e instanceof UnauthorizedError,
    handle: (error, req: Request, res: Response, _logger?: ILogger) => {
      if (!(error instanceof UnauthorizedError)) return;
      sendErrorResponse(
        res,
        req,
        StatusCode.ClientErrorUnauthorized,
        buildApplicationErrorPayload(error)
      );
    },
  },
  {
    supports: (e): e is InfrastructureError => e instanceof InfrastructureError,
    handle: (error, req: Request, res: Response, _logger?: ILogger) => {
      if (!(error instanceof InfrastructureError)) return;
      sendErrorResponse(
        res,
        req,
        StatusCode.ClientErrorForbidden,
        buildApplicationErrorPayload(error)
      );
    },
  },
  {
    supports: (e): e is WhatsAppConnectionError => e instanceof WhatsAppConnectionError,
    handle: (error, req: Request, res: Response, _logger?: ILogger) => {
      if (!(error instanceof WhatsAppConnectionError)) return;
      sendErrorResponse(
        res,
        req,
        StatusCode.ClientErrorBadRequest,
        buildApplicationErrorPayload(error)
      );
    },
  },
  {
    supports: (e): e is ValidationError => e instanceof ValidationError,
    handle: (error, req: Request, res: Response, _logger?: ILogger) => {
      if (!(error instanceof ValidationError)) return;
      sendErrorResponse(
        res,
        req,
        StatusCode.ClientErrorBadRequest,
        buildValidationErrorPayload(error)
      );
    },
  },
  {
    supports: (e): e is DomainError => e instanceof DomainError,
    handle: (error, req: Request, res: Response, _logger?: ILogger) => {
      if (!(error instanceof DomainError)) return;
      sendErrorResponse(
        res,
        req,
        StatusCode.ClientErrorUnprocessableEntity,
        buildApplicationErrorPayload(error)
      );
    },
  },
  {
    supports: (e): e is ApplicationError => e instanceof ApplicationError,
    handle: (error, req: Request, res: Response, _logger?: ILogger) => {
      if (!(error instanceof ApplicationError)) return;
      sendErrorResponse(
        res,
        req,
        StatusCode.ClientErrorUnauthorized,
        buildApplicationErrorPayload(error)
      );
    },
  },
];

export function errorMiddleware(logger: ILogger) {
  return (error: unknown, req: Request, res: Response, _next: NextFunction): void => {
    logError(logger, req, error);

    const handler = ERROR_HANDLERS.find((h) => h.supports(error));
    if (!handler) {
      return sendErrorResponse(
        res,
        req,
        StatusCode.ServerErrorInternal,
        buildUnknownErrorPayload()
      );
    }

    return handler.handle(error as Error, req, res, logger);
  };
}

function sendErrorResponse(
  res: Response,
  req: Request,
  statusCode: StatusCode,
  payload: ApiError[]
): void {
  if (res.headersSent) {
    return; // Avoid sending multiple responses
  }

  const audit = new AuditDataBuilder('ERROR', 'INTERNAL')
    .withRequest(req.ip, req.get('user-agent'))
    .build();

  return ResponseHandler.error(res, statusCode, payload, audit);
}

function normalizeError(error: unknown): ErrorPayload {
  if (error instanceof ApplicationError) {
    return {
      code: error.code,
      type: error.type,
      name: error.name,
      message: error.message,
      description: error.message,
      cause: error.cause,
      stack: error.stack,
    };
  }
  if (error instanceof Error) {
    return {
      code: ErrorCode.INTERNAL_ERROR,
      type: ErrorType.INTERNAL,
      name: error.name,
      message: error.message,
      description: error.message,
      stack: error.stack,
    };
  }
  return {
    code: ErrorCode.INTERNAL_ERROR,
    type: ErrorType.INTERNAL,
    name: 'UnknownError',
    message: 'Unknown error',
    description: 'Non-error thrown',
    stack: undefined,
  };
}

function logError(logger: ILogger, req: Request, error: unknown): void {
  const normalized = normalizeError(error);
  const errorContext = {
    path: req.path,
    method: req.method,
    // requestId: context?.requestId,
    // correlationId: context?.correlationId,
    timestamp: new Date().toISOString(),
    code: normalized.code ?? ErrorCode.INTERNAL_ERROR,
    type: normalized.type,
    name: normalized.name,
    description: normalized.message,
    cuase: normalized.cause ?? undefined,
    stack: normalized.stack ?? undefined,
  };

  logger.error('[Middleware] Captured Error', errorContext);
}

function buildApplicationErrorPayload(error: ApplicationError): ApiError[] {
  return [
    {
      code: error.code,
      type: error.type,
      name: error.name,
      description: error.message,
    },
  ];
}

function buildValidationErrorPayload(error: ValidationError): ApiError[] {
  return error.errors.map((e) => ({
    code: error.code,
    type: error.type,
    name: e.field,
    description: e.message,
  }));
}

function buildUnknownErrorPayload(): ApiError[] {
  return [
    {
      code: ErrorCode.INTERNAL_ERROR,
      type: ErrorType.INTERNAL,
      name: 'Unknown Error',
      description: 'Unexpected error occurred',
    },
  ];
}
