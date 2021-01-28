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
import { Country } from 'modules/countries/country.api.entity';
import { IsInt, IsNumber, Max, Min } from 'class-validator';
import { TimeUserEntityMetadata } from 'types/time-user-entity-metadata';

/**
 * The kind of Marxan scenario (standard, Marxan with Zones, and possibly other
 * kinds in the future).
 */
export enum ScenarioType {
  standard = 'Standard',
  marxanWithZones = 'Marxan with zones',
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

  /**
   * The country where this scenario is located.
   */
  @ApiProperty()
  @ManyToOne((_type) => Country)
  @JoinColumn({
    name: 'country_id',
    referencedColumnName: 'alpha2',
  })
  country: Country;

  /**
   * Extent of the scenario
   */
  @ApiPropertyOptional()
  @Column('geometry')
  extent: object | null;

  /**
   * Filter for WDPA data selection.
   */
  @ApiPropertyOptional()
  @Column('jsonb', { name: 'wdpa_filter' })
  wdpaFilter: object | null;

  /**
   * Threshold - which portion (%) of a protected area needs to intersect a
   * planning unit for this to be locked in as protected.
   * @todo document possible values/range (should this be a [0,1] range
   * instead), add validator decorators...
   */
  @ApiPropertyOptional()
  @Column('integer', { name: 'wdpa_threshold' })
  @IsInt()
  @Min(0)
  @Max(100)
  wdpaThreshold: number | null;

  /**
   * The smallest administrative region that contains the whole scenario's
   * geometry.
   * @todo check description, link to AdminRegion entity
   */
  @ApiProperty()
  @Column('uuid', { name: 'admin_region_id' })
  @IsUUID()
  adminRegionId: string;

  /**
   * Number of runs for Marxan calculations.
   */
  @ApiProperty()
  @Column('integer', { name: 'number_of_runs' })
  @IsInt()
  @Min(0)
  numberOfRuns: number;

  /**
   * Boundary Length Modifier
   */
  @ApiProperty()
  @Column('double precision', { name: 'blm' })
  @IsNumber()
  boundaryLengthModifier: number;

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
  status: JobStatus;

  /**
   * Parent scenario.
   */
  @ApiPropertyOptional()
  @Column('uuid', { name: 'parent_id' })
  parentScenario: Scenario;

  @ApiProperty({
    type: () => User,
    isArray: true,
  })
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
