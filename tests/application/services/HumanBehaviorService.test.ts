import { describe, expect } from 'vitest';
import { HumanBehaviorService } from '../../../src/application/services/HumanBehaviorService';

describe('HumanBehaviorService', () => {
  const service = new HumanBehaviorService();

  test('getTypingDelay returns short delay for short text', () => {
    const delay = service.getTypingDelay('Hi');
    expect(delay).toBeGreaterThanOrEqual(200);
    expect(delay).toBeLessThanOrEqual(400);
  });

  test('getTypingDelay returns medium delay for medium text', () => {
    const delay = service.getTypingDelay('A'.repeat(60));
    expect(delay).toBeGreaterThanOrEqual(1000);
    expect(delay).toBeLessThanOrEqual(2500);
  });

  test('getTypingDelay returns long delay for long text', () => {
    const delay = service.getTypingDelay('A'.repeat(150));
    expect(delay).toBeGreaterThanOrEqual(2000);
    expect(delay).toBeLessThanOrEqual(5000);
  });

  test('getPostDelay returns value in expected range', () => {
    for (let i = 0; i < 50; i++) {
      const delay = service.getPostDelay();
      expect(delay).toBeGreaterThanOrEqual(300);
      expect(delay).toBeLessThanOrEqual(800);
    }
  });

  test('shouldGoOffline returns boolean', () => {
    const results = new Set<boolean>();
    for (let i = 0; i < 100; i++) {
      results.add(service.shouldGoOffline());
    }
    expect(results.has(true)).toBe(true);
    expect(results.has(false)).toBe(true);
  });
});
