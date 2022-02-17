import { ArchiveLocation } from '@marxan/cloning/domain';
import { Either } from 'fp-ts/Either';
import { fileNotFound } from '@marxan/files-repository/file.repository';
import { JSONValue } from '@marxan-api/utils/json.type';

export const archiveCorrupted = Symbol(`archive couldn't be extracted`);
export const invalidFiles = Symbol(`archive files structure is not recognized`);

export type Failure =
  | typeof archiveCorrupted
  | typeof invalidFiles
  | typeof fileNotFound;

export abstract class ArchiveReader {
  abstract get(archive: ArchiveLocation): Promise<Either<Failure, JSONValue>>;
}
