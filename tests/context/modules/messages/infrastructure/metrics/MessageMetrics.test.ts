import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MessageMetrics } from '@modules/messages/infrastructure/metrics/MessageMetrics';

describe('MessageMetrics', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('tracks attempts, successes, failures, and average latency per instance', () => {
    // Arrange
    const metrics = new MessageMetrics();

    // Act
    metrics.recordAttempt('instance-1');
    metrics.recordAttempt('instance-1');
    metrics.recordSent('instance-1', 20);
    metrics.recordSent('instance-1', 40);
    metrics.recordFailed('instance-1', new Error('network'));

    // Assert
    expect(metrics.getStats('instance-1')).toEqual({ attempts: 2, sent: 2, failed: 1, totalLatency: 60, avgLatency: 30 });
    expect(metrics.getStats('instance-2')).toEqual({ attempts: 0, sent: 0, failed: 0, totalLatency: 0, avgLatency: 0 });
  });
});
