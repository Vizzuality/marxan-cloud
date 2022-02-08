import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ImportComponentEntity } from './import-components.api.entity';
import { ComponentLocation } from '@marxan/cloning/domain';

@Entity('component_locations')
export class ImportComponentLocationEntity {
  @Column({ type: 'text', name: 'uri', primary: true })
  uri!: string;

  @Column({ type: 'text', name: 'relative_path', primary: true })
  relativePath!: string;

  @Column({ type: 'uuid', name: 'import_component_id' })
  importComponentId!: string;

  @ManyToOne(() => ImportComponentEntity, (component) => component.uris)
  @JoinColumn({
    name: 'import_component_id',
    referencedColumnName: 'id',
  })
  component!: ImportComponentEntity;

  static fromSnapshot(
    locationSnapshot: ComponentLocation,
  ): ImportComponentLocationEntity {
    const componentLocationEntity = new ImportComponentLocationEntity();
    componentLocationEntity.uri = locationSnapshot.uri;
    componentLocationEntity.relativePath = locationSnapshot.relativePath;

    return componentLocationEntity;
  }

  toComponentLocationClass(): ComponentLocation {
    return new ComponentLocation(this.uri, this.relativePath);
  }
}
