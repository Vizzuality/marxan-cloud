import { ClonePiece } from '@marxan/cloning/domain';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { ExportComponentSnapshot } from '../../domain';
import { ComponentLocationEntity } from './component-locations.api.entity';
import { ExportEntity } from './exports.api.entity';

@Entity('export_components')
export class ExportComponentEntity {
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
    type: 'boolean',
    name: 'finished',
  })
  finished!: boolean;

  @Column({ type: 'uuid', name: 'export_id' })
  exportId!: string;

  @JoinColumn({
    name: 'export_id',
    referencedColumnName: 'id',
  })
  @ManyToOne(() => ExportEntity, (exportInstance) => exportInstance.components)
  export!: ExportEntity;

  @OneToMany(() => ComponentLocationEntity, (uri) => uri.component, {
    cascade: true,
  })
  uris!: ComponentLocationEntity[];

  static fromSnapshot(
    componentSnapshot: ExportComponentSnapshot,
  ): ExportComponentEntity {
    const exportComponentEntity = new ExportComponentEntity();
    exportComponentEntity.id = componentSnapshot.id;
    exportComponentEntity.piece = componentSnapshot.piece;
    exportComponentEntity.resourceId = componentSnapshot.resourceId;
    exportComponentEntity.finished = componentSnapshot.finished;
    exportComponentEntity.uris = componentSnapshot.uris.map(
      ComponentLocationEntity.fromSnapshot,
    );

    return exportComponentEntity;
  }

  toSnapshot(): ExportComponentSnapshot {
    return {
      id: this.id,
      finished: this.finished,
      piece: this.piece,
      resourceId: this.resourceId,
      uris: this.uris.map((uri) => uri.toComponentLocationClass()),
    };
  }
}
