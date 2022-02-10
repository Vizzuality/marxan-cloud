import { ArchiveLocation } from '@marxan/cloning/domain';
import { Either } from 'fp-ts/Either';
import { Import } from '@marxan-api/modules/clone/import';

export const archiveCorrupted = Symbol(`archive couldn't be extracted`);
export const invalidFiles = Symbol(`archive files structure is not recognized`);

export type Failure = typeof archiveCorrupted | typeof invalidFiles;
export type Success = Import;

export abstract class ArchiveReader {
  abstract get(archive: ArchiveLocation): Promise<Either<Failure, Success>>;
}
