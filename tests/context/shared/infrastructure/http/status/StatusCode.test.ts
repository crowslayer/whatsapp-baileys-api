import { beforeEach, describe, expect, it, vi } from 'vitest';

import { StatusCode } from '@shared/infrastructure/http/status/StatusCode';

describe('StatusCode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exposes the informational status codes', () => {
    expect(StatusCode.InfoContinue).toBe(100);
    expect(StatusCode.InfoSwitchingProtocols).toBe(101);
    expect(StatusCode.InfoProcessing).toBe(102);
    expect(StatusCode.InfoEarlyHints).toBe(103);
  });

  it('exposes the success status codes', () => {
    expect(StatusCode.SuccessOK).toBe(200);
    expect(StatusCode.SuccessCreated).toBe(201);
    expect(StatusCode.SuccessAccepted).toBe(202);
    expect(StatusCode.SuccessNoContent).toBe(204);
    expect(StatusCode.SuccessResetContent).toBe(205);
    expect(StatusCode.SuccessPartialContent).toBe(206);
    expect(StatusCode.SuccessMultiStatus).toBe(207);
    expect(StatusCode.SuccessAlreadyReported).toBe(208);
    expect(StatusCode.SuccessIMUsed).toBe(229);
  });

  it('exposes the redirection status codes', () => {
    expect(StatusCode.RedirectMultipleChoices).toBe(300);
    expect(StatusCode.RedirectMovedPermanently).toBe(301);
    expect(StatusCode.RedirectFound).toBe(302);
    expect(StatusCode.RedirectSeeOther).toBe(303);
    expect(StatusCode.RedirectNotModified).toBe(304);
    expect(StatusCode.RedirectUseProxy).toBe(305);
    expect(StatusCode.RedirectSwitchProxy).toBe(306);
    expect(StatusCode.RedirectTemp).toBe(307);
    expect(StatusCode.RedirectPermanent).toBe(308);
  });

  it('exposes the client error status codes', () => {
    expect(StatusCode.ClientErrorBadRequest).toBe(400);
    expect(StatusCode.ClientErrorUnauthorized).toBe(401);
    expect(StatusCode.ClientErrorPaymentRequired).toBe(402);
    expect(StatusCode.ClientErrorForbidden).toBe(403);
    expect(StatusCode.ClientErrorNotFound).toBe(404);
    expect(StatusCode.ClientErrorMethodNotAllowed).toBe(405);
    expect(StatusCode.ClientErrorNotAcceptable).toBe(406);
    expect(StatusCode.ClientErrorProxyAuthRequired).toBe(407);
    expect(StatusCode.ClientErrorRequestTimeout).toBe(408);
    expect(StatusCode.ClientErrorConflict).toBe(409);
    expect(StatusCode.ClientErrorGone).toBe(410);
    expect(StatusCode.ClientErrorLengthRequired).toBe(411);
    expect(StatusCode.ClientErrorPreconditionFailed).toBe(412);
    expect(StatusCode.ClientErrorPayloadTooLarge).toBe(413);
    expect(StatusCode.ClientErrorURITooLong).toBe(414);
    expect(StatusCode.ClientErrorUnsupportedMediaType).toBe(415);
    expect(StatusCode.ClientErrorRangeNotSatisfiable).toBe(416);
    expect(StatusCode.ClientErrorExpectationFailed).toBe(417);
    expect(StatusCode.ClientErrorImATeapot).toBe(418);
    expect(StatusCode.ClientErrorMisdirectedRequest).toBe(421);
    expect(StatusCode.ClientErrorUnprocessableEntity).toBe(422);
    expect(StatusCode.ClientErrorLocked).toBe(423);
    expect(StatusCode.ClientErrorFailedDependency).toBe(424);
    expect(StatusCode.ClientErrorUpgradeRequired).toBe(426);
    expect(StatusCode.ClientErrorPreconditionRequired).toBe(428);
    expect(StatusCode.ClientErrorTooManyRequests).toBe(429);
    expect(StatusCode.ClientErrorRequestHeaderFieldsTooLarge).toBe(431);
    expect(StatusCode.ClientErrorLoginTimeOut).toBe(440);
    expect(StatusCode.ClientErrorRetryWith).toBe(449);
    expect(StatusCode.ClientErrorUnavailableForLegalReasons).toBe(451);
  });

  it('exposes the server error status codes', () => {
    expect(StatusCode.ServerErrorInternal).toBe(500);
    expect(StatusCode.ServerErrorNotImplemented).toBe(501);
    expect(StatusCode.ServerErrorBadGateway).toBe(502);
    expect(StatusCode.ServerErrorServiceUnavailable).toBe(503);
    expect(StatusCode.ServerErrorGatewayTimeout).toBe(504);
    expect(StatusCode.ServerErrorHTTPVersionNotSupported).toBe(505);
    expect(StatusCode.ServerErrorVariantAlsoNegotiates).toBe(506);
    expect(StatusCode.ServerErrorInsufficientStorage).toBe(507);
    expect(StatusCode.ServerErrorLoopDetected).toBe(508);
    expect(StatusCode.ServerErrorBandwidthLimitExceeded).toBe(509);
    expect(StatusCode.ServerErrorNotExtended).toBe(510);
    expect(StatusCode.ServerErrorNetworkAuthRequired).toBe(511);
  });

  it('maps enum keys to numeric values through reverse lookup', () => {
    expect(StatusCode[200]).toBe('SuccessOK');
    expect(StatusCode[404]).toBe('ClientErrorNotFound');
    expect(StatusCode[500]).toBe('ServerErrorInternal');
  });

  it('keeps every member value inside the HTTP valid range', () => {
    const values = Object.values(StatusCode).filter((value): value is number => typeof value === 'number');

    expect(values.length).toBeGreaterThan(0);
    values.forEach((value) => {
      expect(value).toBeGreaterThanOrEqual(100);
      expect(value).toBeLessThanOrEqual(599);
    });
  });
});
