import { Import } from '@marxan-api/modules/clone/import';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { ResourceKind } from '@marxan/cloning/domain';
import { ImportComponentEntity } from '@marxan-api/modules/clone/import/application/import-repository/entities/import-components.api.entity';

@Entity('imports')
export class ImportEntity {
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
  })
  archiveLocation!: string;

  @OneToMany(() => ImportComponentEntity, (component) => component.import, {
    cascade: true,
  })
  components!: ImportComponentEntity[];

  static fromAggregate(importAggregate: Import): ImportEntity {
    const snapshot = importAggregate.toSnapshot();

    const entity = new ImportEntity();

    entity.id = snapshot.id;
    entity.resourceId = snapshot.resourceId;
    entity.resourceKind = snapshot.resourceKind;
    entity.archiveLocation = snapshot.archiveLocation;
    entity.components = snapshot.importPieces.map(
      ImportComponentEntity.fromSnapshot,
    );

    return entity;
  }

  toAggregate(): Import {
    return Import.fromSnapshot({
      id: this.id,
      resourceId: this.resourceId,
      resourceKind: this.resourceKind,
      archiveLocation: this.archiveLocation,
      importPieces: this.components.map((component) => component.toSnapshot()),
    });
  }
}
