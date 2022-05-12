import { Either, left, right } from 'fp-ts/lib/Either';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { Readable } from 'stream';

export const fileAlreadyExists = Symbol(`file already exists`);
export const unknownError = Symbol(`unknown error`);

export type StoreFileError = typeof fileAlreadyExists | typeof unknownError;

/**
 * Checks wether a folder exists or not. If not exists it is created
 *
 * @param path
 */
export function ensureFolderExists(path: string): void {
  const directory = dirname(path);
  const directoryExists = existsSync(directory);

  if (!directoryExists) {
    mkdirSync(directory, { recursive: true });
  }
}

/**
 * Stores the given file in the given path
 *
 * @param path
 * @param stream
 */
export async function storeFile(
  path: string,
  stream: Readable,
): Promise<Either<StoreFileError, string>> {
  const fileExists = existsSync(path);

  if (fileExists) {
    return left(fileAlreadyExists);
  }

  const writer = createWriteStream(path);

  return new Promise((resolve) => {
    writer.on('close', () => {});
    writer.on(`finish`, () => {
      resolve(right(path));
    });
    writer.on('error', (error) => {
      console.error(error);
      resolve(left(unknownError));
    });

    stream.pipe(writer);
  });
}
