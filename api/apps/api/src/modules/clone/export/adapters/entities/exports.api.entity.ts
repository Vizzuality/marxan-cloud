import { ResourceKind } from '@marxan/cloning/domain';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Export } from '../../domain';
import { ComponentLocationEntity } from './component-locations.api.entity';
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
    exportEntity.components = snapshot.exportPieces.map((piece) => {
      const exportComponentEntity = new ExportComponentEntity();
      exportComponentEntity.id = piece.id.value;
      exportComponentEntity.piece = piece.piece;
      exportComponentEntity.resourceId = piece.resourceId;
      exportComponentEntity.finished = piece.finished;
      exportComponentEntity.uris = piece.uris.map((uri) => {
        const componentLocationEntity = new ComponentLocationEntity();
        componentLocationEntity.uri = uri.uri;
        componentLocationEntity.relativePath = uri.relativePath;

        return componentLocationEntity;
      });

      return exportComponentEntity;
    });

    return exportEntity;
  }
}
