import { check } from 'k6';
import http from 'k6/http';
import { Counter, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const ENDPOINT = __ENV.ENDPOINT || '/api/v1/instances/';
const TOKEN = __ENV.TOKEN || '';

const unexpectedResponses = new Counter('unexpected_responses');
const acceptedLatency = new Trend('accepted_latency', true);

export const options = {
  discardResponseBodies: true,

  scenarios: {
    load_test: {
      executor: 'ramping-arrival-rate',
      startRate: 5,
      timeUnit: '1s',
      preAllocatedVUs: 20,
      maxVUs: 100,

      stages: [
        { target: 5, duration: '1m' }, // Calentamiento
        { target: 10, duration: '2m' }, // Carga normal
        { target: 20, duration: '5m' }, // Carga pico sostenida
        { target: 5, duration: '2m' }, // Recuperación
      ],
    },
  },

  thresholds: {
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99'],
    unexpected_responses: ['count<1'],
    accepted_latency: ['p(95)<500', 'p(99)<1000'],
    dropped_iterations: ['count==0'],
  },
};

export default function () {
  const headers = { Accept: 'application/json' };

  if (TOKEN) {
    headers.Authorization = `Bearer ${TOKEN}`;
  }

  const res = http.get(`${BASE_URL}${ENDPOINT}`, {
    headers,
    timeout: '5s',
  });

  const success = check(res, {
    'respuesta HTTP 2xx': (r) => r.status >= 200 && r.status < 300,
  });

  if (success) {
    acceptedLatency.add(res.timings.duration);
  } else {
    unexpectedResponses.add(1);
  }
}
