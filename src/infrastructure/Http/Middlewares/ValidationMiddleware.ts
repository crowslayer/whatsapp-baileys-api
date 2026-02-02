import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';
import { ApiError } from '@shared/infrastructure/ErrorHandler';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // const errorMessages: Record<string, string[]> = {};
    const errorMessages: ApiError[] = [];
    errors.array().forEach(error => {
      if (error.type === 'field') {
        // if (!errorMessages[error.path]) {
        //   errorMessages[error.path] = [];
        // }
        const errorParse = {
          type: 'field',
          code: 2001,
          name: error.path,
          description: error.msg
        }
        errorMessages.push(errorParse);
      }
    });

    return ResponseHandler.badRequest(res, 'Validation failed', errorMessages);
  };
};