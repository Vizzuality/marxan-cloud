import { ArchiveLocation } from '@marxan/cloning/domain';

export abstract class ArchiveCreator {
  abstract zip(
    files: {
      uri: string;
      relativeDestination: string;
    }[],
  ): Promise<ArchiveLocation>;
}
