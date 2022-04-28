import { Either } from 'fp-ts/Either';
import { Readable } from 'stream';

export const CloningStoragePath = Symbol('cloning storage path');

export const unknownError = Symbol(`unknown error`);
export const storageNotReachable = Symbol(`storage not reachable`);
export const fileNotFound = Symbol(`file not found`);
export const hackerFound = Symbol(`please hands off`);
export const fileAlreadyExists = Symbol(`file already exists`);

export type SaveFileError =
  | typeof unknownError
  | typeof storageNotReachable
  | typeof hackerFound
  | typeof fileAlreadyExists;

export type GetFileError =
  | typeof storageNotReachable
  | typeof fileNotFound
  | typeof hackerFound;

export abstract class CloningFilesRepository {
  abstract get(uri: string): Promise<Either<GetFileError, Readable>>;

  abstract saveZipFile(
    exportId: string,
    stream: Readable,
  ): Promise<Either<SaveFileError, string>>;

  abstract saveCloningFile(
    exportId: string,
    stream: Readable,
    relativePath: string,
  ): Promise<Either<SaveFileError, string>>;

  abstract deleteExportFolder(exportId: string): Promise<void>;

  abstract getFilesFolderFor(exportId: string): string;
}
