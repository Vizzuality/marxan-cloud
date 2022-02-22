import {
  ComponentLocation,
  ComponentLocationSnapshot,
} from '@marxan/cloning/domain';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ExportComponentEntity } from './export-components.api.entity';

@Entity('export_component_locations')
export class ExportComponentLocationEntity {
  @Column({ type: 'text', name: 'uri', primary: true })
  uri!: string;

  @Column({ type: 'text', name: 'relative_path', primary: true })
  relativePath!: string;

  @Column({ type: 'uuid', name: 'export_component_id' })
  exportComponentId!: string;

  @ManyToOne(() => ExportComponentEntity, (component) => component.uris)
  @JoinColumn({
    name: 'export_component_id',
    referencedColumnName: 'id',
  })
  component!: ExportComponentEntity;

  static fromSnapshot(
    locationSnapshot: ComponentLocationSnapshot,
  ): ExportComponentLocationEntity {
    const componentLocationEntity = new ExportComponentLocationEntity();
    componentLocationEntity.uri = locationSnapshot.uri;
    componentLocationEntity.relativePath = locationSnapshot.relativePath;

    return componentLocationEntity;
  }

  toComponentLocationClass(): ComponentLocation {
    return new ComponentLocation(this.uri, this.relativePath);
  }
}
