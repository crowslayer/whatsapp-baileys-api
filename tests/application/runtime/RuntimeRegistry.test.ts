import { RuntimeRegistry } from '../../../src/application/runtime/RuntimeRegistry';

describe('RuntimeRegistry', () => {
  test('should register and retrieve runtime', () => {
    const registry = new RuntimeRegistry();
    const mockRuntime = { start: vi.fn(), stop: vi.fn() };
    registry.register('inst-1', mockRuntime);
    expect(registry.get('inst-1')).toBe(mockRuntime);
  });

  test('should throw when runtime not found', () => {
    const registry = new RuntimeRegistry();
    expect(() => registry.get('nonexistent')).toThrow('not found');
  });

  test('should remove runtime', () => {
    const registry = new RuntimeRegistry();
    registry.register('inst-1', {});
    registry.remove('inst-1');
    expect(() => registry.get('inst-1')).toThrow();
  });

  test('should allow re-registration after removal', () => {
    const registry = new RuntimeRegistry();
    const r1 = { id: 'r1' };
    const r2 = { id: 'r2' };
    registry.register('inst-1', r1);
    registry.remove('inst-1');
    registry.register('inst-1', r2);
    expect(registry.get('inst-1')).toBe(r2);
  });
});
