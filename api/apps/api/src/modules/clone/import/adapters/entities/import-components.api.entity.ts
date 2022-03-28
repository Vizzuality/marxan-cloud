import { ClonePiece } from '@marxan/cloning/domain';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { ImportComponentSnapshot } from '../../domain';
import { ImportComponentStatuses } from '../../domain/import/import-component-status';
import { ImportComponentLocationEntity } from './import-component-locations.api.entity';
import { ImportEntity } from './imports.api.entity';

@Entity('import_components')
export class ImportComponentEntity {
  @PrimaryColumn({ type: 'uuid', name: 'id' })
  id!: string;

  @Column({ type: 'uuid', name: 'resource_id' })
  resourceId!: string;

  @Column({
    type: 'enum',
    name: 'piece',
    enum: ClonePiece,
  })
  piece!: ClonePiece;

  @Column({
    type: 'enum',
    enum: ImportComponentStatuses,
    name: 'status',
  })
  status!: ImportComponentStatuses;

  @Column({
    type: 'int',
    name: 'order',
  })
  order!: number;

  @Column({ type: 'uuid', name: 'import_id' })
  importId!: string;

  @JoinColumn({
    name: 'import_id',
    referencedColumnName: 'id',
  })
  @ManyToOne(() => ImportEntity, (importInstance) => importInstance.components)
  import!: ImportEntity;

  @OneToMany(() => ImportComponentLocationEntity, (uri) => uri.component, {
    cascade: true,
  })
  uris!: ImportComponentLocationEntity[];

  static fromSnapshot(
    componentSnapshot: ImportComponentSnapshot,
  ): ImportComponentEntity {
    const entity = new ImportComponentEntity();
    entity.id = componentSnapshot.id;
    entity.piece = componentSnapshot.piece;
    entity.resourceId = componentSnapshot.resourceId;
    entity.status = componentSnapshot.status;
    entity.order = componentSnapshot.order;
    entity.uris = componentSnapshot.uris.map(
      ImportComponentLocationEntity.fromSnapshot,
    );

    return entity;
  }

  toSnapshot(): ImportComponentSnapshot {
    return {
      id: this.id,
      status: this.status,
      order: this.order,
      piece: this.piece,
      resourceId: this.resourceId,
      uris: this.uris.map((uri) => uri.toComponentLocationClass()),
    };
  }
}
