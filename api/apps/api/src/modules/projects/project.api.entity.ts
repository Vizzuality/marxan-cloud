import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../users/user.api.entity';
import { Scenario } from '../scenarios/scenario.api.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Organization } from '../organizations/organization.api.entity';
import { TimeUserEntityMetadata } from '../../types/time-user-entity-metadata';
import { BaseServiceResource } from '../../types/resource.interface';
import { BBox } from 'geojson';

export const projectResource: BaseServiceResource = {
  className: 'Project',
  name: {
    singular: 'project',
    plural: 'projects',
  },
  entitiesAllowedAsIncludes: ['scenarios', 'users'],
};

export enum PlanningUnitGridShape {
  square = 'square',
  hexagon = 'hexagon',
  fromShapefile = 'from_shapefile',
}

@Entity('projects')
export class Project extends TimeUserEntityMetadata {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty()
  @Column('character varying')
  name!: string;

  @ApiPropertyOptional()
  @Column('character varying')
  description?: string;

  @Column({
    type: `boolean`,
    name: `is_public`,
    default: false,
  })
  isPublic!: boolean;

  /**
   * The organization to which this scenario belongs.
   */
  @ApiProperty({ type: () => Organization })
  @ManyToOne((_type) => Organization, (organization) => organization.projects)
  @JoinColumn({
    name: 'organization_id',
    referencedColumnName: 'id',
  })
  organization?: Organization;

  @Column('uuid', { name: 'organization_id' })
  organizationId!: string;

  /**
   * The country where this project is located.
   *
   * Uses the gid0 property of the Country entity.
   */
  @Column('character varying', { name: 'country_id' })
  countryId!: string;

  /**
   * Administrative area (level 1) on which this project is focused.
   */
  @ApiProperty()
  @Column('character varying', { name: 'admin_area_l1_id' })
  adminAreaLevel1Id?: string;

  /**
   * Administrative area (level 2) on which this project is focused.
   */
  @ApiProperty()
  @Column('character varying', { name: 'admin_area_l2_id' })
  adminAreaLevel2Id?: string;

  /**
   * Custom geometry for the project.
   *
   * If using a custom geometry, this must have been uploaded and associated to
   * the project.
   */
  @ApiPropertyOptional()
  @Column('uuid', {
    name: 'planning_area_geometry_id',
    nullable: true,
  })
  planningAreaGeometryId?: string;

  /**
   * Shape of the planning units.
   *
   * Planning unit grids are generated algorithmically if the shape chosen is
   * square or hexagon; if users want to upload their own shapefile, we set this
   * to fromShapefile, and handle the upload of the shapefile separately.
   */
  @ApiProperty()
  @Column('enum', {
    name: 'planning_unit_grid_shape',
    enum: PlanningUnitGridShape,
  })
  planningUnitGridShape?: PlanningUnitGridShape;

  /**
   * Area of planning units in km2.
   *
   * This is only used if the chosen shape is `square` or `hexagon`.
   */
  @ApiProperty()
  @Column('float', { name: 'planning_unit_area_km2' })
  planningUnitAreakm2?: number;

  /**
   * Bbox of the custom extent
   */
  @ApiProperty()
  @Column('jsonb', { name: 'bbox' })
  bbox!: BBox;

  /**
   * JSONB storage for non-relational attributes
   *
   * @debt We should use versioned types for metadata.
   */
  @ApiPropertyOptional()
  @Column('jsonb')
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({ type: () => Scenario })
  @OneToMany((_type) => Scenario, (scenario) => scenario.project)
  scenarios?: Scenario[];

  @ApiProperty({
    type: () => User,
    isArray: true,
  })
  @ManyToMany((_type) => User, (user) => user.projects, { eager: true })
  users?: Partial<User>[];

  // Non Entity

  @ApiPropertyOptional({
    description: "ID of Country / Gid1 / Gid2 of project's area",
  })
  planningAreaId?: string;

  @ApiPropertyOptional({
    description: "Display name of Country / Gid1 / Gid2 of project's area",
  })
  planningAreaName?: string;
}

export class JSONAPIProjectData {
  @ApiProperty()
  type = 'projects';

  @ApiProperty()
  id!: string;

  @ApiProperty()
  attributes!: Project;

  @ApiPropertyOptional()
  relationships?: Record<string, unknown>;
}

export class ProjectResultPlural {
  @ApiProperty()
  data!: JSONAPIProjectData[];
}

export class ProjectResultSingular {
  @ApiProperty()
  data!: JSONAPIProjectData;
}
