import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Project } from '../projects/project.api.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.api.entity';
import { IsArray, IsOptional } from 'class-validator';
import { TimeUserEntityMetadata } from '../../types/time-user-entity-metadata';
import { BaseServiceResource } from '../../types/resource.interface';
import { IUCNCategory } from '../protected-areas/protected-area.geo.entity';
import { GeoFeatureSetSpecification } from '../geo-features/dto/geo-feature-set-specification.dto';

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
  draft = 'draft',
  created = 'created',
  running = 'running',
  done = 'done',
  failure = 'failure',
}

/**
 * A simple job status, usable to represent jobs that can be only in the
 * draft or created status.
 */
export enum SimpleJobStatus {
  draft = 'draft',
  created = 'created',
}

@Entity('scenarios')
export class Scenario extends TimeUserEntityMetadata {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty()
  @Column('character varying')
  name!: string;

  @ApiPropertyOptional()
  @Column('character varying')
  description?: string;

  @ApiProperty({ enum: ScenarioType, enumName: 'ScenarioType' })
  @Column('enum', {
    enum: ScenarioType,
  })
  type!: ScenarioType;

  /**
   * The project to which this scenario belongs.
   */
  @ApiProperty({ type: () => Project })
  @ManyToOne((_type) => Project, (project) => project.scenarios)
  @JoinColumn({
    name: 'project_id',
    referencedColumnName: 'id',
  })
  project?: Project;

  @Column('uuid', { name: 'project_id' })
  projectId!: string;

  /**
   * List of IUCN categories used to select WDPA protected areas for the
   * scenario's planning area.
   */
  @ApiPropertyOptional()
  @Column('varchar', { name: 'wdpa_iucn_categories', array: true })
  wdpaIucnCategories?: IUCNCategory[];

  /**
   * List of ids of protected areas associated to the scenario.
   */
  @ApiPropertyOptional()
  @IsOptional()
  @Column('jsonb', { name: 'protected_area_filter_by_ids' })
  protectedAreaFilterByIds?: string[];

  /**
   * Which portion (%) of a protected area needs to intersect a planning unit
   * for this to be considered as protected.
   *
   * Possible values: 0 to 100, in integer steps.
   *
   * @debt We should rename this property to something like
   * `protectedAreaThreshold` as we converge on treating WDPA areas as a
   * specific subset of protected areas in general in terms of naming things,
   * but this needs to be coordinated with API consumers.
   */
  @ApiPropertyOptional()
  @Column('integer', { name: 'wdpa_threshold' })
  @IsOptional()
  wdpaThreshold?: number | null;

  @Column('jsonb', { name: 'feature_set' })
  @IsOptional()
  featureSet?: GeoFeatureSetSpecification;

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
  metadata?: {
    marxanInputParameterFile?: Record<string, string | number>;
    scenarioEditingMetadata?: Record<string, unknown>;
  };

  /**
   * Status of the scenario calculation job.
   *
   * @todo Check description.
   */
  @ApiProperty({ enum: JobStatus, enumName: 'JobStatus' })
  @Column('enum', {
    enum: JobStatus,
  })
  status!: JobStatus;

  /**
   * Parent scenario.
   */
  @ApiPropertyOptional()
  @IsOptional()
  @Column('uuid', { name: 'parent_id' })
  parentScenarioId?: string;

  @ApiPropertyOptional()
  @OneToOne((_type) => Scenario)
  @JoinColumn({ name: 'parent_id', referencedColumnName: 'id' })
  parentScenario?: Scenario;

  @ApiProperty({
    type: () => User,
    isArray: true,
  })
  @IsArray()
  @ManyToMany((_type) => User, (user) => user.scenarios, { eager: true })
  users!: Partial<User>[];

  @ApiProperty()
  @Column({
    name: 'ran_at_least_once',
    default: false,
  })
  ranAtLeastOnce!: boolean;
}

export class JSONAPIScenarioData {
  @ApiProperty()
  type = 'scenarios';

  @ApiProperty()
  id!: string;

  @ApiProperty()
  attributes!: Scenario;
}

export class ScenarioResult {
  @ApiProperty()
  data!: JSONAPIScenarioData;
}
