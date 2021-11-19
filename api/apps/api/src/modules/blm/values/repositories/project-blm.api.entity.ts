import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { JsonApiAsyncJobMeta } from '@marxan-api/dto/async-job.dto';
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
export interface ProjectBlm {
  id: string;

  /**
   * User-supplied or defaults if none provided,
   */
  range: number[];

  /**
   * Calculated from range.
   */
  values: number[];

  /**
   * Sets once at the project creation chain - once PU are known.
   */
  defaults: number[];
}
@Entity('project_blms')
export class ProjectBlm extends TimeUserEntityMetadata {
  // Should we use PostgreSQL ranges?
  @ApiProperty({ isArray: true })
  @Column('int', { array: true, default: [0, 0] })
  range!: number[];

  @ApiProperty({ isArray: true })
  @Column('int', { array: true, default: [] })
  values!: number[];

  @ApiProperty({ isArray: true })
  @Column('int', { array: true, default: [] })
  defaults!: number[];

  /**
   * The project to which this BLM Values belongs.
   */
  @ApiProperty()
  @PrimaryColumn('uuid')
  @OneToOne(() => Project)
  @JoinColumn()
  id!: string;
}

export class JSONAPIProjectBlmData {
  @ApiProperty({
    type: String,
  })
  type = 'project_blms';

  @ApiProperty({ description: 'This is the Id of the project' })
  id!: string;

  @ApiProperty({
    type: ProjectBlm,
  })
  attributes!: ProjectBlm;

  @ApiPropertyOptional()
  relationships?: Record<string, unknown>;
}

export class ProjectResultPlural {
  @ApiProperty({
    isArray: true,
    type: JSONAPIProjectBlmData,
  })
  data!: JSONAPIProjectBlmData[];
}

export class ProjectBlmResultSingular extends JsonApiAsyncJobMeta {
  @ApiProperty()
  data!: JSONAPIProjectBlmData;
}
