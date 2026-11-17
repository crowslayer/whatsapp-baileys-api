import { NextFunction, Request, Response } from 'express';
import { Schema, ValidationChain, checkSchema, validationResult } from 'express-validator';

import { ErrorContent } from '@shared/infrastructure/http/response/HttpResponse';
import { ResponseBuilder } from '@shared/infrastructure/http/response/ResponseBuilder';
import { StatusCode } from '@shared/infrastructure/http/status/StatusCode';

type ValidationInput = Schema | ValidationChain[];

export const validate = (validations: ValidationInput) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (Array.isArray(validations)) {
      await Promise.all(validations.map((validation) => validation.run(req)));
    } else {
      await checkSchema(validations).run(req);
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const errorMessages: ErrorContent[] = [];
    errors.array().forEach((error) => {
      if (error.type === 'field') {
        const errorParse = {
          type: 'field',
          code: 2001,
          name: error.path,
          description: error.msg,
        };
        errorMessages.push(errorParse);
      }
    });

    ResponseBuilder.error(errorMessages, StatusCode.ClientErrorBadRequest);
    // ExpressResponseAdapter.send(req, res, errorResponse);
  };
};
