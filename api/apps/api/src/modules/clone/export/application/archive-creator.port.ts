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

export abstract class ArchiveCreator {
  abstract zip(
    files: {
      uri: string;
      relativeDestination: string;
    }[],
  ): Promise<Either<ArchiveCreationError, ArchiveLocation>>;
}
