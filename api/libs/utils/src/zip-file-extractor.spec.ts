import * as archiver from 'archiver';
import { isLeft, isRight } from 'fp-ts/lib/Either';
import { Readable } from 'stream';

import { readableToBuffer } from './readable-to-buffer';
import {
  extractFile,
  extractFileFailed,
  fileNotFound,
} from './zip-file-extractor';

async function buildZip(entries: Record<string, string>): Promise<Buffer> {
  const archive = archiver('zip', { zlib: { level: 9 } });
  for (const [name, content] of Object.entries(entries)) {
    archive.append(content, { name });
  }
  await archive.finalize();
  return readableToBuffer(archive);
}

describe('extractFile', () => {
  it('returns Right with file content when the target file exists', async () => {
    const zip = await buildZip({
      'config.json': '{"hello":"world"}',
      'other.txt': 'lorem ipsum',
    });

    const result = await extractFile(Readable.from(zip), 'config.json');

    expect(isRight(result)).toBe(true);
    if (isRight(result)) expect(result.right).toBe('{"hello":"world"}');
  });

  it('returns Left(fileNotFound) when the target file is not in the zip', async () => {
    const zip = await buildZip({ 'other.txt': 'lorem ipsum' });

    const result = await extractFile(Readable.from(zip), 'missing.json');

    expect(isLeft(result)).toBe(true);
    if (isLeft(result)) expect(result.left).toBe(fileNotFound);
  });

  it('returns Left(extractFileFailed) for a truncated zip', async () => {
    const zip = await buildZip({
      'config.json': '{"hello":"world"}',
      'big.txt': 'x'.repeat(4096),
    });
    const truncated = zip.subarray(0, Math.floor(zip.length / 2));

    const result = await extractFile(Readable.from(truncated), 'config.json');

    expect(isLeft(result)).toBe(true);
    if (isLeft(result)) expect(result.left).toBe(extractFileFailed);
  });

  // Regression: the previous implementation used `new Promise(async resolve => …)`
  // with a for-await loop that kept iterating after `resolve(right(...))`.
  // A late stream error on the abandoned iterator surfaced as an unhandled
  // rejection that crashed the api pod. This guards against re-introducing
  // that escape path.
  it('does not leak unhandled rejections after returning Right on an early entry', async () => {
    const zip = await buildZip({
      'early.json': '{"first":true}',
      ...Object.fromEntries(
        Array.from({ length: 20 }, (_, i) => [`trail-${i}.txt`, `entry ${i}`]),
      ),
    });

    const rejections: unknown[] = [];
    const handler = (reason: unknown) => rejections.push(reason);
    process.on('unhandledRejection', handler);
    try {
      const result = await extractFile(Readable.from(zip), 'early.json');
      expect(isRight(result)).toBe(true);
      // Let any rogue background work surface before we assert.
      await new Promise((r) => setTimeout(r, 50));
    } finally {
      process.off('unhandledRejection', handler);
    }
    expect(rejections).toEqual([]);
  });

  it('does not leak unhandled rejections when the zip is truncated', async () => {
    const zip = await buildZip({
      'config.json': '{"hello":"world"}',
      'big.txt': 'x'.repeat(4096),
    });
    const truncated = zip.subarray(0, Math.floor(zip.length / 2));

    const rejections: unknown[] = [];
    const handler = (reason: unknown) => rejections.push(reason);
    process.on('unhandledRejection', handler);
    try {
      const result = await extractFile(Readable.from(truncated), 'config.json');
      expect(isLeft(result)).toBe(true);
      await new Promise((r) => setTimeout(r, 50));
    } finally {
      process.off('unhandledRejection', handler);
    }
    expect(rejections).toEqual([]);
  });
});
