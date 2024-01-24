import { User } from '@marxan-api/modules/users/user.api.entity';
import { ResourceKind } from '@marxan/cloning/domain';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Export } from '../../domain';
import { ExportComponentEntity } from './export-components.api.entity';

@Entity('exports')
export class ExportEntity {
  @PrimaryColumn({ type: 'uuid', name: 'id' })
  id!: string;

  @Column({ type: 'uuid', name: 'resource_id' })
  resourceId!: string;

  @Column({
    type: 'enum',
    name: 'resource_kind',
    enum: ResourceKind,
    enumName: 'clone_resource_kind_enum',
  })
  resourceKind!: ResourceKind;

  @Column({ type: 'uuid', name: 'owner_id' })
  ownerId!: string;

  /*
    This column holds the resourceId of the new project/scenario
    created when cloning a project/scenario
   */
  @Column({ type: 'uuid', name: 'import_resource_id', nullable: true })
  importResourceId?: string;

  @Column({
    type: 'text',
    name: 'archive_location',
    nullable: true,
  })
  archiveLocation?: string;

  @Column({ type: 'bool', name: 'foreign_export' })
  foreignExport!: boolean;

  @ManyToOne(() => User, (user) => user.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'owner_id',
    referencedColumnName: 'id',
  })
  owner!: User;

  @OneToMany(() => ExportComponentEntity, (component) => component.export, {
    cascade: true,
  })
  components!: ExportComponentEntity[];

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
  })
  createdAt!: Date;

  static fromAggregate(exportAggregate: Export): ExportEntity {
    const snapshot = exportAggregate.toSnapshot();

    const exportEntity = new ExportEntity();

    exportEntity.id = snapshot.id;
    exportEntity.resourceId = snapshot.resourceId;
    exportEntity.resourceKind = snapshot.resourceKind;
    exportEntity.ownerId = snapshot.ownerId;
    exportEntity.importResourceId = snapshot.importResourceId;
    exportEntity.archiveLocation = snapshot.archiveLocation;
    exportEntity.foreignExport = snapshot.foreignExport;
    exportEntity.createdAt = snapshot.createdAt;
    exportEntity.components = snapshot.exportPieces.map(
      ExportComponentEntity.fromSnapshot,
    );

    return exportEntity;
  }

  toAggregate(): Export {
    return Export.fromSnapshot({
      id: this.id,
      resourceId: this.resourceId,
      resourceKind: this.resourceKind,
      ownerId: this.ownerId,
      importResourceId: this.importResourceId,
      archiveLocation: this.archiveLocation,
      foreignExport: this.foreignExport,
      createdAt: this.createdAt,
      exportPieces: this.components.map((component) => component.toSnapshot()),
    });
  }
}
