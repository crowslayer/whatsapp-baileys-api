import { NextFunction, Request, Response } from 'express';

import { StatusCode } from '@apps/backend/http/StatusCode';

import { DomainError } from '@shared/domain/error/DomainError';
import { ErrorCode } from '@shared/domain/error/ErrorCode';
import { ErrorType } from '@shared/domain/error/ErrorType';
import { InfrastructureError } from '@shared/domain/error/InfrastructureError';
import { ValidationError } from '@shared/domain/error/ValidationError';
import { ILogger } from '@shared/domain/Logger';
import { ServiceOverloadedError } from '@shared/infrastructure/errors/ServiceOverloadError';
import { UnauthorizedError } from '@shared/infrastructure/errors/UnauthorizedError';
import { WhatsAppConnectionError } from '@shared/infrastructure/errors/WhatsAppConnectionError';
import { ExpressResponseAdapter } from '@shared/infrastructure/http/express/ExpressResponseAdapter';
import { ErrorContent } from '@shared/infrastructure/http/response/HttpResponse';
import { ResponseBuilder } from '@shared/infrastructure/http/response/ResponseBuilder';

type ErrorHandler = {
  supports: (error: unknown) => boolean;
  handle: (error: unknown, req: Request, res: Response, logger?: ILogger) => void;
};

interface IRequestContext extends Request {
  requestId?: string;
  correlationId?: string;
}

const ERROR_HANDLERS: ErrorHandler[] = [
  {
    supports: (e): e is UnauthorizedError => e instanceof UnauthorizedError,
    handle: (error, req: Request, res: Response, _logger?: ILogger) => {
      if (!(error instanceof UnauthorizedError)) return;
      sendErrorResponse(
        res,
        req,
        StatusCode.ClientErrorUnauthorized,
        buildInfrastructureErrorPayload(error)
      );
    },
  },
  {
    supports: (e): e is ServiceOverloadedError => e instanceof ServiceOverloadedError,
    handle: (error, req: Request, res: Response, _logger?: ILogger) => {
      if (!(error instanceof ServiceOverloadedError)) return;
      sendErrorResponse(
        res,
        req,
        StatusCode.ServerErrorServiceUnavailable,
        buildInfrastructureErrorPayload(error)
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
        buildInfrastructureErrorPayload(error)
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
        buildInfrastructureErrorPayload(error)
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
        buildDomainErrorPayload(error)
      );
    },
  },
];

export function errorMiddleware(logger: ILogger) {
  return (error: unknown, req: IRequestContext, res: Response, next: NextFunction): void => {
    if (res.headersSent) {
      next(error);
      return;
    }

    logError(logger, req, error);

    if (isMalformedJsonError(error)) {
      sendErrorResponse(res, req, StatusCode.ClientErrorBadRequest, [
        {
          code: ErrorCode.INTERNAL_ERROR,
          type: ErrorType.INTERNAL,
          name: 'Invalid JSON',
          description: 'Request body contains invalid JSON',
        },
      ]);
      return;
    }

    if (isPayloadTooLargeError(error)) {
      sendErrorResponse(res, req, StatusCode.ClientErrorPayloadTooLarge, [
        {
          code: ErrorCode.INTERNAL_ERROR,
          type: ErrorType.INTERNAL,
          name: 'Payload Too Large',
          description: 'Request body exceeds the allowed size',
        },
      ]);
      return;
    }

    // const handler = ERROR_HANDLERS.find((h) => h.supports(error));
    // if (handler) {
    //   handler.handle(error, req, res, logger);
    //   return;
    // }
    const statusCode = getStatusCodeForError(error);
    let payload: ErrorContent[];

    if (error instanceof ValidationError) {
      payload = buildValidationErrorPayload(error);
    } else {
      // Reutilizamos tu lógica de normalización para asegurar consistencia
      const normalized = normalizeError(error);
      payload = [
        {
          code: normalized.code,
          type: normalized.type,
          name: statusCode === StatusCode.ServerErrorInternal ? 'Unknown Error' : normalized.name,
          description:
            statusCode === StatusCode.ServerErrorInternal
              ? 'Unexpected error occurred'
              : normalized.description,
        },
      ];
    }
    sendErrorResponse(res, req, statusCode, payload);
  };
}

function sendErrorResponse(
  res: Response,
  req: Request,
  statusCode: StatusCode,
  payload: ErrorContent[]
): void {
  if (res.headersSent) return;

  const errorResponse = ResponseBuilder.error(payload, statusCode);

  ExpressResponseAdapter.send(req, res, errorResponse);
}

function normalizeError(error: unknown): ErrorContent {
  if (error instanceof DomainError || error instanceof InfrastructureError) {
    return {
      code: error.code,
      type: error.type,
      name: error.name,
      description: error.message,
      cause: 'cause' in error ? error.cause : undefined,
      stack: error.stack,
    };
  }

  if (error instanceof Error) {
    return {
      code: ErrorCode.INTERNAL_ERROR,
      type: ErrorType.INTERNAL,
      name: error.name,
      description: error.message,
      cause: error.cause,
      stack: error.stack,
    };
  }

  return {
    code: ErrorCode.INTERNAL_ERROR,
    type: ErrorType.INTERNAL,
    name: 'UnknownError',
    description: 'Non-error thrown',
    stack: undefined,
  };
}

function logError(logger: ILogger, req: IRequestContext, error: unknown): void {
  const normalized = normalizeError(error);
  const errorContext = {
    path: req.path,
    method: req.method,
    requestId: req.requestId,
    correlationId: req?.correlationId,
    timestamp: new Date().toISOString(),
    ...normalized,
  };

  logger.error('[Middleware] Captured Error', errorContext);
}

function buildInfrastructureErrorPayload(error: InfrastructureError): ErrorContent[] {
  return [
    {
      code: error.code,
      type: error.type,
      name: error.name,
      description: error.message,
    },
  ];
}

function buildDomainErrorPayload(error: DomainError): ErrorContent[] {
  return [
    {
      code: error.code,
      type: error.type,
      name: error.name,
      description: error.message,
    },
  ];
}

function buildValidationErrorPayload(error: ValidationError): ErrorContent[] {
  return error.errors.map((e) => ({
    code: error.code,
    type: error.type,
    name: e.field,
    description: e.message,
  }));
}

function buildUnknownErrorPayload(): ErrorContent[] {
  return [
    {
      code: ErrorCode.INTERNAL_ERROR,
      type: ErrorType.INTERNAL,
      name: 'Unknown Error',
      description: 'Unexpected error occurred',
    },
  ];
}

function isMalformedJsonError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    error.type === 'entity.parse.failed'
  );
}

function isPayloadTooLargeError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    error.type === 'entity.too.large'
  );
}

const getStatusCodeForError = (error: unknown): StatusCode => {
  if (error instanceof UnauthorizedError) return StatusCode.ClientErrorUnauthorized;
  if (error instanceof ServiceOverloadedError) return StatusCode.ServerErrorServiceUnavailable;
  if (error instanceof WhatsAppConnectionError) return StatusCode.ClientErrorBadRequest;
  if (error instanceof InfrastructureError) return StatusCode.ClientErrorForbidden;
  if (error instanceof ValidationError) return StatusCode.ClientErrorBadRequest;
  if (error instanceof DomainError) return StatusCode.ClientErrorUnprocessableEntity;

  return StatusCode.ServerErrorInternal;
};
