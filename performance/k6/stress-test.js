import { check } from 'k6';
import http from 'k6/http';
import { Counter, Rate, Trend } from 'k6/metrics';
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const ENDPOINT = __ENV.ENDPOINT || '/api/v1/instances/';
const TOKEN = __ENV.TOKEN || '';

const acceptedRequests = new Counter('accepted_requests');
const rejected429 = new Counter('rejected_429');
const unexpectedResponses = new Counter('unexpected_responses');
const acceptedLatency = new Trend('accepted_latency', true);
const controlledResponses = new Rate('controlled_responses');

export const options = {
  discardResponseBodies: true,

  scenarios: {
    stress_test: {
      executor: 'ramping-arrival-rate',
      startRate: 5,
      timeUnit: '1s',
      preAllocatedVUs: 30,
      maxVUs: 200,

      stages: [
        { target: 10, duration: '1m' },
        { target: 20, duration: '2m' },
        { target: 40, duration: '2m' },
        { target: 60, duration: '2m' },
        { target: 80, duration: '2m' },
        { target: 100, duration: '2m' },
        { target: 10, duration: '2m' }, // Recuperación
      ],
    },
  },

  thresholds: {
    unexpected_responses: ['count<1'],
    controlled_responses: ['rate>0.99'],
    dropped_iterations: ['count==0'],
  },
};

// En este test, 429 es un resultado esperado.
http.setResponseCallback(http.expectedStatuses(200, 201, 202, 204, 429));

export default function () {
  const headers = { Accept: 'application/json' };

  if (TOKEN) {
    headers.Authorization = `Bearer ${TOKEN}`;
  }

  const res = http.get(`${BASE_URL}${ENDPOINT}`, {
    headers,
    timeout: '5s',
  });

  const accepted = res.status >= 200 && res.status < 300;
  const rejected = res.status === 429;
  const controlled = accepted || rejected;

  if (accepted) {
    acceptedRequests.add(1);
    acceptedLatency.add(res.timings.duration);
  } else if (rejected) {
    rejected429.add(1);
  } else {
    unexpectedResponses.add(1);
  }

  controlledResponses.add(
    check(res, {
      'respuesta 2xx o rechazo 429': () => controlled,
    })
  );
}
