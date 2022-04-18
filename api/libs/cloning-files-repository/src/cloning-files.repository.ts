import { Either } from 'fp-ts/Either';
import { Readable } from 'stream';

export const CloningStoragePath = Symbol('cloning storage path');

export const unknownError = Symbol(`unknown error`);
export const storageNotReachable = Symbol(`storage not reachable`);
export const fileNotFound = Symbol(`file not found`);
export const hackerFound = Symbol(`please hands off`);

export type SaveFileError =
  | typeof unknownError
  | typeof storageNotReachable
  | typeof hackerFound;

export type GetFileError =
  | typeof storageNotReachable
  | typeof fileNotFound
  | typeof hackerFound;

export abstract class CloningFilesRepository {
  abstract save(
    stream: Readable,
    extension?: string,
  ): Promise<Either<SaveFileError, string>>;

  abstract get(uri: string): Promise<Either<GetFileError, Readable>>;
}
