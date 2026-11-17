import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BootstrapConsole } from '@shared/application/console/BootstrapConsole';

describe('BootstrapConsole', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the app name in uppercase inside the banner', () => {
    const banner = BootstrapConsole.banner('my-app');

    expect(banner).toContain('MY-APP');
  });

  it('does not render the original lowercase app name', () => {
    const banner = BootstrapConsole.banner('my-app');

    expect(banner).not.toContain('my-app');
  });

  it('wraps the app name with two separator lines of 70 equals signs', () => {
    const banner = BootstrapConsole.banner('app');
    const separator = '='.repeat(70);
    const separatorLines = banner.split('\n').filter((line) => line.includes(separator));

    expect(separatorLines).toHaveLength(2);
  });

  it('renders a banner even when the app name is empty', () => {
    const banner = BootstrapConsole.banner('');

    expect(banner).toContain('='.repeat(70));
  });

  it('formats a section title with equals signs and uppercase', () => {
    const section = BootstrapConsole.section('Chats');

    expect(section).toBe('========== CHATS ==========');
  });

  it('formats a section title with an empty title', () => {
    const section = BootstrapConsole.section('');

    expect(section).toBe('==========  ==========');
  });
});
