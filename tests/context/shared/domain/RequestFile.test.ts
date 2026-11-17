import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RequestFile } from '@shared/domain/RequestFile';

describe('RequestFile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('describes a local file with its buffer and metadata', () => {
    const buffer = Buffer.from('file-content');
    const file: RequestFile = {
      source: 'local',
      buffer,
      mimetype: 'image/png',
      filename: 'upload.png',
      originalname: 'original.png',
      path: 'C:/tmp/upload.png',
    };

    expect(file.source).toBe('local');
    expect(file.buffer).toBe(buffer);
    expect(file.buffer.toString()).toBe('file-content');
    expect(file.mimetype).toBe('image/png');
    expect(file.filename).toBe('upload.png');
    expect(file.originalname).toBe('original.png');
    expect(file.path).toBe('C:/tmp/upload.png');
  });

  it('describes a remote file with its url', () => {
    const file: RequestFile = { source: 'remote', url: 'https://example.com/image.png' };

    expect(file.source).toBe('remote');
    expect(file.url).toBe('https://example.com/image.png');
  });

  it('accepts an empty buffer for a local file', () => {
    const file: RequestFile = {
      source: 'local',
      buffer: Buffer.alloc(0),
      mimetype: 'application/octet-stream',
      filename: 'empty.bin',
      originalname: 'empty.bin',
      path: 'C:/tmp/empty.bin',
    };

    expect(file.buffer).toHaveLength(0);
  });

  it('accepts a remote file with an empty url', () => {
    const file: RequestFile = { source: 'remote', url: '' };

    expect(file.url).toBe('');
  });
});
