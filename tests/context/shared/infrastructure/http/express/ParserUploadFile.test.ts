import { beforeEach, describe, expect, it, vi } from 'vitest';

import { parseUploadedFile } from '@shared/infrastructure/http/express/ParserUploadFile';

import type { NextFunction, Request, Response } from 'express';
import type { RequestFile } from '@shared/domain/RequestFile';

type MockRequest = {
  body: Record<string, unknown>;
  files?: unknown;
  file?: unknown;
};

const buildRequest = (overrides: Partial<MockRequest> = {}): Request => {
  const req: MockRequest = {
    body: {},
    ...overrides,
  };

  return req as unknown as Request;
};

const buildResponse = (): Response => ({}) as unknown as Response;

describe('parseUploadedFile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps an array of uploaded files into the target field', () => {
    const buffer = Buffer.from('hello');
    const req = buildRequest({
      files: [
        {
          buffer,
          mimetype: 'text/plain',
          filename: 'stored.txt',
          originalname: 'original.txt',
          path: 'tmp/stored.txt',
        },
      ],
    });
    const next = vi.fn();

    parseUploadedFile('attachment')(req, buildResponse(), next as unknown as NextFunction);

    const files = req.body.attachment as RequestFile[];

    expect(next).toHaveBeenCalledTimes(1);
    expect(files).toHaveLength(1);
    expect(files[0]).toEqual({
      source: 'local',
      buffer,
      mimetype: 'text/plain',
      filename: 'stored.txt',
      originalname: 'original.txt',
      path: 'tmp/stored.txt',
    });
  });

  it('falls back to the original name when the stored filename is empty', () => {
    const req = buildRequest({
      files: [
        {
          buffer: Buffer.from('x'),
          mimetype: 'image/png',
          filename: '',
          originalname: 'photo.png',
          path: '',
        },
      ],
    });
    const next = vi.fn();

    parseUploadedFile('attachment')(req, buildResponse(), next as unknown as NextFunction);

    const files = req.body.attachment as RequestFile[];

    expect(files[0].source === 'local' && files[0].filename).toBe('photo.png');
    expect(files[0].source === 'local' && files[0].path).toBe('');
  });

  it('maps a single uploaded file into the target field', () => {
    const buffer = Buffer.from('single');
    const req = buildRequest({
      file: {
        buffer,
        mimetype: 'application/pdf',
        filename: 'doc.pdf',
        originalname: 'doc.pdf',
        path: 'tmp/doc.pdf',
      },
    });
    const next = vi.fn();

    parseUploadedFile('attachment')(req, buildResponse(), next as unknown as NextFunction);

    const file = req.body.attachment as RequestFile;

    expect(next).toHaveBeenCalledTimes(1);
    expect(file).toEqual({
      source: 'local',
      buffer,
      mimetype: 'application/pdf',
      filename: 'doc.pdf',
      originalname: 'doc.pdf',
      path: 'tmp/doc.pdf',
    });
  });

  it('ignores a files collection that is not an array', () => {
    const req = buildRequest({
      files: { attachment: { buffer: Buffer.from('x') } },
      body: { url: 'https://cdn.local/file.png' },
    });
    const next = vi.fn();

    parseUploadedFile('attachment')(req, buildResponse(), next as unknown as NextFunction);

    expect(req.body.attachment).toEqual({ source: 'remote', url: 'https://cdn.local/file.png' });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('maps a single remote url into the target field', () => {
    const req = buildRequest({ body: { url: 'https://cdn.local/file.png' } });
    const next = vi.fn();

    parseUploadedFile('attachment')(req, buildResponse(), next as unknown as NextFunction);

    expect(req.body.attachment).toEqual({ source: 'remote', url: 'https://cdn.local/file.png' });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('maps a list of remote urls into the target field', () => {
    const req = buildRequest({
      body: { url: ['https://cdn.local/a.png', 'https://cdn.local/b.png'] },
    });
    const next = vi.fn();

    parseUploadedFile('attachment')(req, buildResponse(), next as unknown as NextFunction);

    expect(req.body.attachment).toEqual([
      { source: 'remote', url: 'https://cdn.local/a.png' },
      { source: 'remote', url: 'https://cdn.local/b.png' },
    ]);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('prefers the uploaded files over the remote url', () => {
    const req = buildRequest({
      files: [
        {
          buffer: Buffer.from('x'),
          mimetype: 'text/plain',
          filename: 'a.txt',
          originalname: 'a.txt',
          path: 'tmp/a.txt',
        },
      ],
      body: { url: 'https://cdn.local/file.png' },
    });
    const next = vi.fn();

    parseUploadedFile('attachment')(req, buildResponse(), next as unknown as NextFunction);

    expect(Array.isArray(req.body.attachment)).toBe(true);
  });

  it('calls next without mutating the body when there is nothing to parse', () => {
    const req = buildRequest();
    const next = vi.fn();

    parseUploadedFile('attachment')(req, buildResponse(), next as unknown as NextFunction);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.body.attachment).toBeUndefined();
  });

  it('uses the given target field name', () => {
    const req = buildRequest({ body: { url: 'https://cdn.local/file.png' } });
    const next = vi.fn();

    parseUploadedFile('media')(req, buildResponse(), next as unknown as NextFunction);

    expect(req.body.media).toEqual({ source: 'remote', url: 'https://cdn.local/file.png' });
    expect(req.body.attachment).toBeUndefined();
  });

  it('falls back to the remote url when the single file has no filename', () => {
    const req = buildRequest({
      file: {
        buffer: Buffer.from('x'),
        mimetype: 'text/plain',
        filename: undefined,
        originalname: 'fallback.txt',
        path: undefined,
      },
    });
    const next = vi.fn();

    parseUploadedFile('attachment')(req, buildResponse(), next as unknown as NextFunction);

    const file = req.body.attachment as RequestFile;

    expect(file.source === 'local' && file.filename).toBe('fallback.txt');
    expect(file.source === 'local' && file.path).toBe('');
  });
});
