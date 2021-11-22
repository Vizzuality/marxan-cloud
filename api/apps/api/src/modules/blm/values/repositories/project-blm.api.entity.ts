import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToOne, PrimaryColumn } from 'typeorm';
import { BaseServiceResource } from '@marxan-api/types/resource.interface';
import { TimeUserEntityMetadata } from '@marxan/utils';
import { Project } from '@marxan-api/modules/projects/project.api.entity';

export const projectBlmResource: BaseServiceResource = {
  className: 'ProjectBlm',
  name: {
    singular: 'project_blm',
    plural: 'project_blms',
  },
  entitiesAllowedAsIncludes: [],
};

@Entity('project_blms')
export class ProjectBlm extends TimeUserEntityMetadata {
  @ApiProperty({ isArray: true })
  @Column('decimal', { array: true, default: [0.001, 100] })
  range!: [number, number];

  @ApiProperty({ isArray: true })
  @Column('decimal', { array: true, default: [] })
  values!: number[];

  @ApiProperty({ isArray: true })
  @Column('decimal', { array: true, default: [] })
  defaults!: number[];

  /**
   * The project to which this BLM Values belongs.
   */
  @ApiProperty()
  @PrimaryColumn('uuid')
  @OneToOne(() => Project)
  id!: string;
}
