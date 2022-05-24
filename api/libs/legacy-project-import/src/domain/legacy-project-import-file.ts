import { ArchiveLocation } from '../../../cloning/src/domain';
import { LegacyProjectImportFileType } from './legacy-project-import-file-type';
import { LegacyProjectImportFileId } from './legacy-project-import-file.id';
import { LegacyProjectImportFileSnapshot } from './legacy-project-import-file.snapshot';

export class LegacyProjectImportFile {
  private constructor(
    readonly id: LegacyProjectImportFileId,
    readonly type: LegacyProjectImportFileType,
    readonly location: ArchiveLocation,
  ) {}

  toSnapshot(): LegacyProjectImportFileSnapshot {
    return {
      id: this.id.value,
      location: this.location.value,
      type: this.type,
    };
  }

  static newOne(
    type: LegacyProjectImportFileType,
    location: ArchiveLocation,
  ): LegacyProjectImportFile {
    return new LegacyProjectImportFile(
      LegacyProjectImportFileId.create(),
      type,
      location,
    );
  }

  static fromSnapshot(
    snapshot: LegacyProjectImportFileSnapshot,
  ): LegacyProjectImportFile {
    return new LegacyProjectImportFile(
      new LegacyProjectImportFileId(snapshot.id),
      snapshot.type,
      new ArchiveLocation(snapshot.location),
    );
  }
}
