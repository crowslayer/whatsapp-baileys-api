import { HttpResponse } from '@shared/infrastructure/http/response/HttpResponse';

export interface IHttpRequest {
  body: unknown;
  params: unknown;
  query: unknown;
  headers: Record<string, unknown>;
}

export interface IController {
  handle(request: IHttpRequest): Promise<HttpResponse<unknown>>;
}
