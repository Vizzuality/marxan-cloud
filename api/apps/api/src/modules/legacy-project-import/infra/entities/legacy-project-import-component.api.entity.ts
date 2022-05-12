import { LegacyProjectImportPiece } from '@marxan/legacy-project-import';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { LegacyProjectImportComponent } from '../../domain/legacy-project-import/legacy-project-import-component';
import { LegacyProjectImportComponentStatuses } from '../../domain/legacy-project-import/legacy-project-import-component-status';
import { LegacyProjectImportComponentSnapshot } from '../../domain/legacy-project-import/legacy-project-import-component.snapshot';
import { LegacyProjectImportEntity } from './legacy-project-import.api.entity';

@Entity('legacy_project_import_components')
export class LegacyProjectImportComponentEntity {
  @PrimaryColumn({ type: 'uuid', name: 'id' })
  id!: string;

  @Column({ type: 'enum', name: 'kind', enum: LegacyProjectImportPiece })
  kind!: LegacyProjectImportPiece;

  @Column({
    type: 'int',
    name: 'order',
  })
  order!: number;

  @Column({
    type: 'enum',
    name: 'status',
    enum: LegacyProjectImportComponentStatuses,
  })
  status!: LegacyProjectImportComponentStatuses;

  @Column({
    type: 'text',
    name: 'errors',
    array: true,
  })
  errors!: string[];

  @Column({
    type: 'text',
    name: 'warnings',
    array: true,
  })
  warnings!: string[];

  @Column({ type: 'uuid', name: 'legacy_project_import_id' })
  legacyProjectImportId!: string;

  @ManyToOne(
    () => LegacyProjectImportEntity,
    (legacyProjectImport) => legacyProjectImport.pieces,
  )
  @JoinColumn({
    name: 'legacy_project_import_id',
    referencedColumnName: 'id',
  })
  legacyProjectImport!: LegacyProjectImportEntity;

  static fromSnapshot(
    snapshot: LegacyProjectImportComponentSnapshot,
  ): LegacyProjectImportComponentEntity {
    const legacyProjectImportComponent = new LegacyProjectImportComponentEntity();
    legacyProjectImportComponent.errors = snapshot.errors;
    legacyProjectImportComponent.id = snapshot.id;
    legacyProjectImportComponent.kind = snapshot.kind;
    legacyProjectImportComponent.order = snapshot.order;
    legacyProjectImportComponent.status = snapshot.status;
    legacyProjectImportComponent.warnings = snapshot.warnings;

    return legacyProjectImportComponent;
  }

  toDomain(): LegacyProjectImportComponent {
    return LegacyProjectImportComponent.fromSnapshot({
      id: this.id,
      kind: this.kind,
      order: this.order,
      status: this.status,
      errors: this.errors,
      warnings: this.warnings,
    });
  }
}
