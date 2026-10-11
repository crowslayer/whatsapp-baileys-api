import { check } from 'k6';
import http from 'k6/http';
import { Counter, Rate, Trend } from 'k6/metrics';
// Métricas de negocio para el rate limiter.
const acceptedRequests = new Counter('accepted_requests');
const rejected429 = new Counter('rejected_429');
const unexpectedResponses = new Counter('unexpected_responses');
const rateLimitTriggered = new Rate('rate_limit_triggered');
// const rateLimitSuccess = new Rate('rate_limit_success');
const acceptedLatency = new Trend('accepted_latency', true);
const missingRetryAfter = new Rate('missing_retry_after');

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const ENDPOINT = __ENV.ENDPOINT || '/api/v1/instances/';
const TOKEN = __ENV.TOKEN || '';
const REQUIRE_RETRY_AFTER = __ENV.REQUIRE_RETRY_AFTER === 'true';

const URL = `${BASE_URL}${ENDPOINT}`;

export const options = {
  discardResponseBodies: true,

  scenarios: {
    rate_limit_test: {
      executor: 'ramping-arrival-rate',

      // Las tasas se expresan por minuto.
      startRate: 30,
      timeUnit: '1m',

      preAllocatedVUs: 20,
      maxVUs: 100,

      stages: [
        { target: 30, duration: '1m' }, // Baseline
        { target: 60, duration: '1m' }, // Incremento
        { target: 120, duration: '1m' }, // Supera 100/min
        { target: 240, duration: '1m' }, // Sobrecarga
        { target: 360, duration: '1m' }, // Sobrecarga alta
        { target: 30, duration: '1m' }, // Recuperación
      ],
    },
  },

  // Hace que los 429 intencionales no se contabilicen
  // como fallos HTTP de transporte en http_req_failed.
  thresholds: {
    http_req_failed: ['rate<0.01'],
    unexpected_responses: ['count<1'],
    accepted_latency: ['p(95)<500', 'p(99)<1000'],
    // rate_limit_success: ['rate>0.05'],
    rate_limit_triggered: ['rate>0.05'],
    dropped_iterations: ['count==0'],
    ...(REQUIRE_RETRY_AFTER ? { missing_retry_after: ['rate==0'] } : {}),
  },
};

// Considera 429 una respuesta esperada del protocolo.
// Los demás códigos no exitosos siguen contando como fallos HTTP.
http.setResponseCallback(http.expectedStatuses(200, 201, 202, 204, 429));

export default function () {
  const headers = {
    Accept: 'application/json',
  };

  if (TOKEN) {
    headers.Authorization = `Bearer ${TOKEN}`;
  }

  const response = http.get(URL, {
    headers,
    timeout: '5s',
    tags: { endpoint: ENDPOINT },
  });

  const isAccepted = response.status >= 200 && response.status < 300;
  const isRejected = response.status === 429;

  if (isAccepted) {
    acceptedRequests.add(1);
    acceptedLatency.add(response.timings.duration);
  } else if (isRejected) {
    rejected429.add(1);
  } else {
    unexpectedResponses.add(1);
  }

  // Verifica que la respuesta corresponda al contrato esperado.
  const validResponse = check(response, {
    'respuesta 2xx o 429': (r) => (r.status >= 200 && r.status < 300) || r.status === 429,
  });

  // rateLimitSuccess.add(validResponse);
  rateLimitTriggered.add(isRejected);

  if (isRejected) {
    const hasRetryAfter = response.headers['Retry-After'] !== undefined;

    missingRetryAfter.add(!hasRetryAfter);
  }
}
