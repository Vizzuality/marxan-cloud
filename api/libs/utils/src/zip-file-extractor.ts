import { Either, left, right } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { Open } from 'unzipper';
import { readableToBuffer } from './readable-to-buffer';

export const extractFileFailed = Symbol('Extract file failed');
export const fileNotFound = Symbol('File not found');

export async function extractFile(
  readable: Readable,
  fileRelativePath: string,
): Promise<Either<typeof extractFileFailed | typeof fileNotFound, string>> {
  // Open.buffer (central-directory mode) instead of Parse() (streaming):
  // Parse's underlying zlib stalls/errors unpredictably on entries with
  // nested zip payloads.
  try {
    const buffer = await readableToBuffer(readable);
    const dir = await Open.buffer(buffer);
    const file = dir.files.find((f) => f.path === fileRelativePath);
    if (!file) return left(fileNotFound);
    const content = await file.buffer();
    return right(content.toString());
  } catch (err) {
    return left(extractFileFailed);
  }
}
