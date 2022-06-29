import { Either } from 'fp-ts/Either';
import { Readable } from 'stream';
import { StoreFileError } from '../../utils/src/file-operations';

export const CloningStoragePath = Symbol('cloning storage path');

export const storageNotReachable = Symbol(`storage not reachable`);
export const fileNotFound = Symbol(`file not found`);
export const hackerFound = Symbol(`please hands off`);

export type SaveFileError =
  | typeof storageNotReachable
  | typeof hackerFound
  | StoreFileError;

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
