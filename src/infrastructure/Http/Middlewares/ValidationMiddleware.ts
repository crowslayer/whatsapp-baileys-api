import { NextFunction, Request, Response } from 'express';
import { Schema, checkSchema, validationResult } from 'express-validator';

import { ApiError } from '@shared/infrastructure/ErrorHandler';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';
export const validate = (validations: Schema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await checkSchema(validations).run(req);
    // Promise.all(validations.map((validation) => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const errorMessages: ApiError[] = [];
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
    return ResponseHandler.badRequest(res, 'Validation failed', errorMessages);
  };
};
