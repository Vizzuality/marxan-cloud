import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  Index,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { BaseServiceResource } from '@marxan-api/types/resource.interface';
import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';

export const costSurfaceResource: BaseServiceResource = {
  className: 'CostSurface',
  name: {
    singular: 'costSurface',
    plural: 'costSurfaces',
  },
};

@Entity('cost_surfaces')
@Unique('UQ_cost_surface_name_for_project', ['projectId', 'name'])
@Index('IDX_default_cost_surface_for_project', ['projectId', 'isDefault'], {
  where: 'isDefault = TRUE',
  unique: true,
})
export class CostSurface {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ type: () => Project })
  @ManyToOne((_type) => Project, (project) => project.costSurfaces)
  @JoinColumn({
    name: 'project_id',
  })
  project!: Project;

  @Column({ name: 'project_id' })
  projectId!: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @ApiProperty()
  @Column({ type: 'float8' })
  min!: number;

  @ApiProperty()
  @Column({ type: 'float8' })
  max!: number;

  @ApiProperty()
  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault!: boolean;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at', type: 'timestamp without time zone' })
  createdAt!: Date;

  @ApiProperty()
  @UpdateDateColumn({
    name: 'last_modified_at',
    type: 'timestamp without time zone',
  })
  lastModifiedAt!: Date;

  @ApiProperty()
  @OneToMany(() => Scenario, (scenario) => scenario.costSurface, {})
  scenarios!: Scenario[];

  @ApiPropertyOptional()
  scenarioUsageCount?: number;
}

export class JSONAPICostSurface {
  @ApiProperty()
  type = costSurfaceResource.name.plural;

  @ApiProperty()
  id!: string;

  @ApiProperty()
  attributes!: CostSurface;
}

export class CostSurfaceResult {
  @ApiProperty()
  data!: JSONAPICostSurface;
}
