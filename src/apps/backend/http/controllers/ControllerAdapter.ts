import { IController } from '@apps/backend/http/controllers/IController';

import { ExpressResponseAdapter } from '@shared/infrastructure/http/express/ExpressResponseAdapter';

import type { NextFunction, Request, RequestHandler, Response } from 'express';

export const ControllerAdapter =
  (controller: IController): RequestHandler =>
  (req: Request, res: Response, next: NextFunction): void => {
    const httpRequest = {
      body: req.body,
      params: req.params,
      query: req.query,
      headers: req.headers as Record<string, unknown>,
    };

    controller
      .handle(httpRequest)
      .then((httpResponse) => {
        if (httpResponse.cookies) {
          for (const cookie of httpResponse.cookies) {
            res.cookie(cookie.name, cookie.value, cookie.options);
          }
        }

        if (httpResponse.headers) {
          res.set(httpResponse.headers);
        }

        // const statusCode = httpResponse.body.status;

        ExpressResponseAdapter.send(req, res, httpResponse);
        // res.status(statusCode).json(httpResponse.body);
      })

      .catch((error: unknown) => next(error));
  };
