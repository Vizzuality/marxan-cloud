import { Either } from 'fp-ts/Either';
import { ArchiveLocation } from '@marxan/cloning/domain';

export const unknownError = Symbol(`unknown error`);
export const cannotGetFile = Symbol(`cannot get a file`);
export const cannotCreateArchive = Symbol(`cannot create archive`);
export const cannotStoreArchive = Symbol(`cannot store archive`);

export type ArchiveCreationError =
  | typeof unknownError
  | typeof cannotGetFile
  | typeof cannotCreateArchive
  | typeof cannotStoreArchive;

export type FileDestination = {
  uri: string;
  relativeDestination: string;
};

export abstract class ArchiveCreator {
  abstract zip(
    exportId: string,
    files: FileDestination[],
  ): Promise<Either<ArchiveCreationError, ArchiveLocation>>;
}
