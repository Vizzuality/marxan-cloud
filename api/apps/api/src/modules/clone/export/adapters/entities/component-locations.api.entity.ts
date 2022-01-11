import { Column, Entity, ManyToOne } from 'typeorm';
import { ExportComponentEntity } from './export-components.api.entity';

@Entity('component_locations')
export class ComponentLocationEntity {
  @Column({ type: 'text', name: 'uri', primary: true })
  uri!: string;

  @Column({ type: 'text', name: 'relative_path', primary: true })
  relativePath!: string;

  @Column({ type: 'uuid', name: 'component_id' })
  componentId!: string;

  @ManyToOne(() => ExportComponentEntity, (component) => component.uris)
  component!: ExportComponentEntity;
}
