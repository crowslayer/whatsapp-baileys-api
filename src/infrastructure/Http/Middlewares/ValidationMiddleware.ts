import { Request, Response, NextFunction } from 'express';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';
import { validationResult, ValidationChain } from 'express-validator';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const errorMessages: Record<string, string[]> = {};
    errors.array().forEach(error => {
      if (error.type === 'field') {
        if (!errorMessages[error.path]) {
          errorMessages[error.path] = [];
        }
        errorMessages[error.path].push(error.msg);
      }
    });

    return ResponseHandler.badRequest(res, 'Validation failed', errorMessages);
  };
};