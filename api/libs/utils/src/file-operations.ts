import { Either, left, right } from 'fp-ts/lib/Either';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

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

export type StoreFileOptions = {
  override: boolean;
};

/**
 * Stores the given file in the given path
 *
 * @param path
 * @param stream
 */
export async function storeFile(
  path: string,
  stream: Readable,
  opts: StoreFileOptions = { override: false },
): Promise<Either<StoreFileError, string>> {
  if (existsSync(path) && !opts.override) {
    return left(fileAlreadyExists);
  }

  try {
    // pipeline (not raw .pipe()) so a source-side error doesn't escape as
    // an unhandled 'error' event.
    await pipeline(stream, createWriteStream(path));
    return right(path);
  } catch (error) {
    console.error(error);
    return left(unknownError);
  }
}
