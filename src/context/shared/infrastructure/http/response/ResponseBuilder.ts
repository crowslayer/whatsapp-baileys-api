import { StatusCode } from '../status/StatusCode.js';

import type { ErrorContent, HttpResponse } from './HttpResponse.js';

export class ResponseBuilder {
  static ok<T>(content: T): HttpResponse<T> {
    return {
      body: {
        success: true,
        status: StatusCode.SuccessOK,
        content,
      },
    };
  }

  static created<T>(content: T): HttpResponse<T> {
    return {
      body: {
        success: true,
        status: StatusCode.SuccessCreated,
        content,
      },
    };
  }

  static accepted<T>(content: T): HttpResponse<T> {
    return {
      body: {
        success: true,
        status: StatusCode.SuccessAccepted,
        content,
      },
    };
  }

  static noContent(): HttpResponse<null> {
    return {
      body: {
        success: true,
        status: StatusCode.SuccessNoContent,
        content: null,
      },
    };
  }

  static error(
    errors: ErrorContent[],
    status = StatusCode.ClientErrorBadRequest
  ): HttpResponse<null> {
    return {
      body: {
        success: false,
        status,
        errors,
        content: null,
      },
    };
  }
}
