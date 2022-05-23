import { ArchiveLocation } from '@marxan/cloning/domain/archive-location';
import {
  LegacyProjectImportFile,
  LegacyProjectImportFileSnapshot,
  LegacyProjectImportFileType,
} from '@marxan/legacy-project-import';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { LegacyProjectImportEntity } from './legacy-project-import.api.entity';

@Entity('legacy_project_import_files')
export class LegacyProjectImportFileEntity {
  @PrimaryColumn({ type: 'text', name: 'location' })
  location!: string;

  @Column({ type: 'uuid', unique: true })
  id!: string;

  @Column({ type: 'enum', name: 'type', enum: LegacyProjectImportFileType })
  type!: LegacyProjectImportFileType;

  @Column({ type: 'uuid', name: 'legacy_project_import_id' })
  legacyProjectImportId!: string;

  @ManyToOne(
    () => LegacyProjectImportEntity,
    (legacyProjectImport) => legacyProjectImport.files,
  )
  @JoinColumn({
    name: 'legacy_project_import_id',
    referencedColumnName: 'id',
  })
  legacyProjectImport!: LegacyProjectImportEntity;

  static fromSnapshot(
    snapshot: LegacyProjectImportFileSnapshot,
  ): LegacyProjectImportFileEntity {
    const importComponentLocation = new LegacyProjectImportFileEntity();
    importComponentLocation.id = snapshot.id;
    importComponentLocation.location = snapshot.location;
    importComponentLocation.type = snapshot.type;

    return importComponentLocation;
  }

  toDomain(): LegacyProjectImportFile {
    return LegacyProjectImportFile.fromSnapshot({
      id: this.id,
      location: this.location,
      type: this.type,
    });
  }
}
