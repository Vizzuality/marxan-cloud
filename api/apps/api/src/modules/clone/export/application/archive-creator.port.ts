import { Either } from 'fp-ts/Either';
import { ArchiveLocation } from '@marxan/cloning/domain';

export const unknownError = Symbol(`unknown error`);

export type ArchiveCreationError = typeof unknownError;

export abstract class ArchiveCreator {
  abstract zip(
    files: {
      uri: string;
      relativeDestination: string;
    }[],
  ): Promise<Either<ArchiveCreationError, ArchiveLocation>>;
}
