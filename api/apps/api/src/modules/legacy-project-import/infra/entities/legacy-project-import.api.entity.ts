import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Project } from '../../../projects/project.api.entity';
import { User } from '../../../users/user.api.entity';
import { LegacyProjectImport } from '../../domain/legacy-project-import/legacy-project-import';
import { LegacyProjectImportSnapshot } from '../../domain/legacy-project-import/legacy-project-import.snapshot';
import { LegacyProjectImportComponentEntity } from './legacy-project-import-component.api.entity';
import { LegacyProjectImportFileEntity } from './legacy-project-import-file.api.entity';

@Entity('legacy_project_imports')
export class LegacyProjectImportEntity {
  @PrimaryColumn({ type: 'uuid', name: 'id' })
  id!: string;

  @Column({ type: 'uuid', name: 'project_id' })
  projectId!: string;

  @Column({ type: 'uuid', name: 'scenario_id' })
  scenarioId!: string;

  @Column({ type: 'uuid', name: 'owner_id' })
  ownerId!: string;

  @Column({
    type: 'boolean',
    name: 'is_accepting_files',
  })
  isAcceptingFiles!: boolean;

  @OneToMany(
    () => LegacyProjectImportComponentEntity,
    (piece) => piece.legacyProjectImport,
    {
      cascade: true,
    },
  )
  pieces!: LegacyProjectImportComponentEntity[];

  @OneToMany(
    () => LegacyProjectImportFileEntity,
    (file) => file.legacyProjectImport,
    {
      cascade: true,
    },
  )
  files!: LegacyProjectImportFileEntity[];

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({
    name: 'owner_id',
    referencedColumnName: 'id',
  })
  owner!: User;

  @ManyToOne(() => Project, (project) => project.id)
  @JoinColumn({
    name: 'project_id',
    referencedColumnName: 'id',
  })
  project!: Project;

  static fromSnapshot(
    snapshot: LegacyProjectImportSnapshot,
  ): LegacyProjectImportEntity {
    const legacyProjectImport = new LegacyProjectImportEntity();
    legacyProjectImport.files = snapshot.files.map(
      LegacyProjectImportFileEntity.fromSnapshot,
    );
    legacyProjectImport.id = snapshot.id;
    legacyProjectImport.isAcceptingFiles = snapshot.isAcceptingFiles;
    legacyProjectImport.ownerId = snapshot.ownerId;
    legacyProjectImport.pieces = snapshot.pieces.map(
      LegacyProjectImportComponentEntity.fromSnapshot,
    );
    legacyProjectImport.projectId = snapshot.projectId;
    legacyProjectImport.scenarioId = snapshot.scenarioId;

    return legacyProjectImport;
  }

  toDomain(): LegacyProjectImport {
    return LegacyProjectImport.fromSnapshot({
      id: this.id,
      files: this.files.map((file) => file.toDomain().toSnapshot()),
      isAcceptingFiles: this.isAcceptingFiles,
      ownerId: this.ownerId,
      pieces: this.pieces.map((piece) => piece.toDomain().toSnapshot()),
      projectId: this.projectId,
      scenarioId: this.scenarioId,
    });
  }
}
