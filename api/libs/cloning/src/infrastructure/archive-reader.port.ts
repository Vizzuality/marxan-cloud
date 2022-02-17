import { fileNotFound } from '@marxan/files-repository/file.repository';
import { Either } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { ArchiveLocation } from '../domain/archive-location';

export const archiveCorrupted = Symbol(`archive couldn't be extracted`);
export const invalidFiles = Symbol(`archive files structure is not recognized`);

export type Failure =
  | typeof archiveCorrupted
  | typeof invalidFiles
  | typeof fileNotFound;

export abstract class ArchiveReader {
  abstract get(archive: ArchiveLocation): Promise<Either<Failure, Readable>>;
}
