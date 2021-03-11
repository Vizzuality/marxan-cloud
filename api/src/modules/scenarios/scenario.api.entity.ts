import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Dictionary } from 'lodash';
import { Project } from 'modules/projects/project.api.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'modules/users/user.api.entity';
import { IsArray, IsOptional } from 'class-validator';
import { TimeUserEntityMetadata } from 'types/time-user-entity-metadata';
import { BaseServiceResource } from 'types/resource.interface';

export const scenarioResource: BaseServiceResource = {
  className: 'Scenario',
  name: {
    singular: 'scenario',
    plural: 'scenarios',
  },
  entitiesAllowedAsIncludes: ['project', 'users'],
};

/**
 * The kind of Marxan scenario (standard, Marxan with Zones, and possibly other
 * kinds in the future).
 */
export enum ScenarioType {
  marxan = 'marxan',
  marxanWithZones = 'marxan-with-zones',
}

export enum JobStatus {
  created = 'created',
  running = 'running',
  done = 'done',
  failure = 'failure',
}

@Entity('scenarios')
export class Scenario extends TimeUserEntityMetadata {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('character varying')
  name: string;

  @ApiPropertyOptional()
  @Column('character varying')
  description: string;

  @ApiProperty({ enum: ScenarioType, enumName: 'ScenarioType' })
  @Column('enum')
  type: ScenarioType;

  /**
   * The project to which this scenario belongs.
   */
  @ApiProperty({ type: () => Project })
  @ManyToOne((_type) => Project, (project) => project.scenarios)
  @JoinColumn({
    name: 'project_id',
    referencedColumnName: 'id',
  })
  project: Project;

  @Column('uuid', { name: 'project_id' })
  projectId: string;

  /**
   * Filter for WDPA data selection.
   *
   * @todo Improve description, add examples.
   */
  @ApiPropertyOptional()
  @IsOptional()
  @Column('jsonb', { name: 'wdpa_filter' })
  wdpaFilter: Record<string, unknown> | null;

  /**
   * Threshold - which portion (%) of a protected area needs to intersect a
   * planning unit for this to be locked in as protected.
   *
   * @todo Document possible values/range (should this be a [0,1] range
   * instead), add validator decorators...
   */
  @ApiPropertyOptional()
  @Column('integer', { name: 'wdpa_threshold' })
  @IsOptional()
  wdpaThreshold: number | null;

  /**
   * Number of runs for Marxan calculations.
   */
  @ApiPropertyOptional()
  @Column('integer', { name: 'number_of_runs' })
  numberOfRuns?: number;

  /**
   * Boundary Length Modifier
   */
  @ApiPropertyOptional()
  @Column('double precision', { name: 'blm' })
  boundaryLengthModifier?: number;

  /**
   * JSONB storage for non-relational attributes
   *
   * @debt We should use versioned types for metadata.
   */
  @ApiPropertyOptional()
  @Column('jsonb')
  metadata: Dictionary<string>;

  /**
   * Status of the scenario calculation job.
   *
   * @todo Check description.
   */
  @ApiProperty({ enum: JobStatus, enumName: 'JobStatus' })
  @Column('enum')
  status?: JobStatus;

  /**
   * Parent scenario.
   */
  @ApiPropertyOptional()
  @IsOptional()
  @Column('uuid', { name: 'parent_id' })
  parentScenario: Scenario;

  @ApiProperty({
    type: () => User,
    isArray: true,
  })
  @IsArray()
  @ManyToMany((_type) => User, (user) => user.scenarios, { eager: true })
  users: Partial<User>[];
}

export class JSONAPIScenarioData {
  @ApiProperty()
  type = 'scenarios';

  @ApiProperty()
  id: string;

  @ApiProperty()
  attributes: Scenario;
}

export class ScenarioResult {
  @ApiProperty()
  data: JSONAPIScenarioData;
}
