import { ArchiveLocation } from '../../../cloning/src/domain';
import { LegacyProjectImportFileType } from './legacy-project-import-file-type';
import { LegacyProjectImportFileSnapshot } from './legacy-project-import-file.snapshot';

export class LegacyProjectImportFile {
  constructor(
    readonly type: LegacyProjectImportFileType,
    readonly location: ArchiveLocation,
  ) {}

  toSnapshot(): LegacyProjectImportFileSnapshot {
    return {
      location: this.location.value,
      type: this.type,
    };
  }

  static fromSnapshot(
    snapshot: LegacyProjectImportFileSnapshot,
  ): LegacyProjectImportFile {
    return new LegacyProjectImportFile(
      snapshot.type,
      new ArchiveLocation(snapshot.location),
    );
  }
}
