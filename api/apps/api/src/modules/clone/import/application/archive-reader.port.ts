import { ArchiveLocation } from '@marxan/cloning/domain';
import { Either } from 'fp-ts/Either';
import { ImportSnapshot } from '../domain/import/import.snapshot';

export const archiveCorrupted = Symbol(`archive couldn't be extracted`);
export const invalidFiles = Symbol(`archive files structure is not recognized`);

export type Failure = typeof archiveCorrupted | typeof invalidFiles;
export type Success = Omit<ImportSnapshot, 'id'>;

export abstract class ArchiveReader {
  abstract get(archive: ArchiveLocation): Promise<Either<Failure, Success>>;
}
