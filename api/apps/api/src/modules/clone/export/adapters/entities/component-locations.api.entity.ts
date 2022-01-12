import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ExportComponentEntity } from './export-components.api.entity';

@Entity('component_locations')
export class ComponentLocationEntity {
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
}
