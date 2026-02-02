import { Request, Response, NextFunction } from 'express';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';
import { Logger } from '@infrastructure/Logger/Logger';
import { ApplicationError } from '@shared/infrastructure/Error/ApplicationError';
import { ErrorCode } from '@shared/infrastructure/Error/ErrorCodes';
import { ErrorType } from '@shared/infrastructure/Error/ErrorType';
import { ApiError } from '@shared/infrastructure/ErrorHandler';
import { StatusCode } from '../StatusCode';
import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { DomainError } from '@shared/infrastructure/Error/DomainError';
import { UnauthorizedError } from '@shared/infrastructure/Error/UnauthorizedError';
import { InfrastructureError } from '@shared/infrastructure/Error/InfrastructureError';
import { WhatsAppConnectionError } from '@shared/infrastructure/Error/WhatsAppConnectionError';
import { ValidationError } from '@shared/infrastructure/Error/ValidationError';


type ErrorHandler = {
  supports: (error: unknown) => boolean;
  handle: (error: any, req: Request, res: Response, logger?: Logger) => void;
}

const ERROR_HANDLERS: ErrorHandler[] = [
  {
    supports: (e): e is UnauthorizedError => e instanceof UnauthorizedError,
    handle: (error: UnauthorizedError, req: Request, res: Response, logger?: Logger) => {
      sendErrorResponse(res, req, StatusCode.ClientErrorUnauthorized, buildApplicationErrorPayload(error));
    },
    
  },
  {
    supports: (e): e is InfrastructureError => e instanceof InfrastructureError,
    handle: (error: InfrastructureError, req: Request, res: Response, logger?: Logger) => {
      sendErrorResponse(res, req, StatusCode.ClientErrorForbidden, buildApplicationErrorPayload(error));
    },
    
  },
  {
    supports: (e): e is WhatsAppConnectionError => e instanceof WhatsAppConnectionError,
    handle: (error: WhatsAppConnectionError, req: Request, res: Response, logger?: Logger) => {
      sendErrorResponse(res, req, StatusCode.ClientErrorBadRequest, buildApplicationErrorPayload(error));
    },
    
  },
  {
    supports: (e): e is ValidationError => e instanceof ValidationError,
    handle: (error: ValidationError, req: Request, res: Response, logger?: Logger) => {
      sendErrorResponse(res, req, StatusCode.ClientErrorBadRequest, buildValidationErrorPayload(error));
    },
    
  },
  {
    supports: (e): e is DomainError => e instanceof DomainError,
    handle: (error: DomainError, req: Request, res: Response, logger?: Logger) => {
      sendErrorResponse(res, req, StatusCode.ClientErrorUnprocessableEntity, buildApplicationErrorPayload(error));
    },

  },
  {
    supports: (e): e is ApplicationError => e instanceof ApplicationError,
    handle: (error: ApplicationError, req: Request, res: Response, logger?: Logger) => {
      sendErrorResponse(res, req, StatusCode.ClientErrorUnauthorized, buildApplicationErrorPayload(error));
    },

  },

];

export function errorMiddleware(logger: Logger) {
  return (error: Error, req: Request, res: Response, next: NextFunction): void => {

    logError(logger, req, error)
    // logger.error({
    //   error: error.message,
    //   stack: error.stack,
    //   path: req.path,
    //   method: req.method,
    // });

    const handler = ERROR_HANDLERS.find(h => h.supports(error));
    if (!handler) {
      return sendErrorResponse(res, req, StatusCode.ServerErrorInternal, buildUnknownErrorPayload());

    }

    return handler.handle(error, req, res, logger)

  };
}

function sendErrorResponse(res: Response, req: Request, statusCode: StatusCode, payload: ApiError[]): void {
  if (res.headersSent) {
    return; // Avoid sending multiple responses
  }
  
  const audit = new AuditDataBuilder('ERROR', 'INTERNAL')
    .withRequest(req.ip, req.get('user-agent'))
    // .withDetails({ errors: payload })
    .build();

  ResponseHandler.error(res, statusCode, payload, audit);
  return;
  
}

function logError(logger: Logger, req: Request, error: any): void {
  // const context = contextStore.getStore();
  const errorContext = {
    path: req.path,
    method: req.method,
    // requestId: context?.requestId,
    // correlationId: context?.correlationId,
    timestamp: new Date().toISOString(),
    code: error.code ?? ErrorCode.INTERNAL_ERROR,
    type: error.type,
    name: error.name,
    description: error.message,
    cuase: error.cause ?? undefined,
    stack: error.stack ?? undefined
  };

  logger.error('[Middleware] Captured Error', errorContext);
}

function buildApplicationErrorPayload(error: ApplicationError): ApiError[] {
  return [{
    code: error.code,
    type: error.type,
    name: error.name,
    description: error.message
  }]
    ;
}

function buildValidationErrorPayload(error: ValidationError): ApiError[] {
  return error.errors.map(e => ({
          code: error.code,
          type: error.type,
          name: e.field,
          description: e.message
      }));

}


function buildUnknownErrorPayload(): ApiError[] {
  return [{
    code: ErrorCode.INTERNAL_ERROR,
    type: ErrorType.INTERNAL,
    name: 'Unknown Error',
    description: 'Unexpected error occurred',
  }];

}

