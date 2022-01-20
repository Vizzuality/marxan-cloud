import { ResourceKind } from '@marxan/cloning/domain';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
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
  })
  resourceKind!: ResourceKind;

  @Column({
    type: 'text',
    name: 'archive_location',
    nullable: true,
  })
  archiveLocation?: string;

  @OneToMany(() => ExportComponentEntity, (component) => component.export, {
    cascade: true,
  })
  components!: ExportComponentEntity[];

  static fromAggregate(exportAggregate: Export): ExportEntity {
    const snapshot = exportAggregate.toSnapshot();

    const exportEntity = new ExportEntity();

    exportEntity.id = snapshot.id;
    exportEntity.resourceId = snapshot.resourceId;
    exportEntity.resourceKind = snapshot.resourceKind;
    exportEntity.archiveLocation = snapshot.archiveLocation;
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
      archiveLocation: this.archiveLocation,
      exportPieces: this.components.map((component) => component.toSnapshot()),
    });
  }
}
