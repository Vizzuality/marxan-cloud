import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../users/user.api.entity';
import { Scenario } from '../scenarios/scenario.api.entity';
import {
  AfterLoad,
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Organization } from '../organizations/organization.api.entity';
import { TimeUserEntityMetadata } from '../../types/time-user-entity-metadata';
import { BaseServiceResource } from '../../types/resource.interface';
import { BBox } from 'geojson';
import { ProtectedAreaDto } from '@marxan-api/modules/projects/dto/protected-area.dto';
import { JsonApiAsyncJobMeta } from '@marxan-api/dto/async-job.dto';
import { ProjectBlm } from '@marxan-api/modules/blm/values/repositories/project-blm/project-blm.api.entity';
import { PlanningUnitGridShape } from '@marxan/scenarios-planning-unit';
import { PublishedProject } from '../published-project/entities/published-project.api.entity';
import { ProjectSourcesEnum } from '@marxan/projects';
import { CostSurface } from '@marxan-api/modules/cost-surface/cost-surface.api.entity';

export const projectResource: BaseServiceResource = {
  className: 'Project',
  name: {
    singular: 'project',
    plural: 'projects',
  },
  entitiesAllowedAsIncludes: ['scenarios', 'users'],
};

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
  @ApiProperty({
    isArray: true,
    type: Number,
  })
  @Column('jsonb', { name: 'bbox' })
  bbox!: BBox;

  @ApiProperty()
  @OneToOne(() => ProjectBlm)
  projectBlm!: ProjectBlm;

  @ApiProperty()
  @Column('enum', {
    name: 'sources',
    enum: ProjectSourcesEnum,
    default: ProjectSourcesEnum.marxanCloud,
  })
  sources!: ProjectSourcesEnum;

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

  @ApiPropertyOptional({ type: () => CostSurface })
  @OneToMany((_type) => CostSurface, (costSurface) => costSurface.project)

  /**
   * @todo: Make this required when we complete the creation of a default cost surface on project creation
   */
  costSurface?: CostSurface[];

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

  @ApiPropertyOptional({
    isArray: true,
    type: ProtectedAreaDto,
  })
  customProtectedAreas?: ProtectedAreaDto[];

  @ApiPropertyOptional({
    description: 'Metadata of the project as published (if it was made public)',
  })
  @OneToOne(() => PublishedProject)
  @JoinColumn({ name: 'id' })
  publicMetadata?: PublishedProject;

  @ApiPropertyOptional({
    description:
      'Whether this project is publicly available through the Community section',
  })
  isPublic?: boolean;

  @AfterLoad()
  setIsPublicProperty() {
    /**
     * This event listener relies on the `publicMetadata` relation to have been
     * loaded, which - when using QueryBuilder via BaseService - may mean that
     * this will only happen if the relation has been explicitly loaded via
     * `leftJoinAndSelect()` (or similar, as applicable). Therefore, if we have
     * no publicMetadata here, we cannot definitely say that the project is not
     * public, but only that we don't know, as the project may well not be
     * public, or it may be but publicMetadata has not been loaded -- hence the
     * undefined here rather than an outright false.
     */
    this.isPublic = this.publicMetadata ? true : undefined;
  }
}

export class JSONAPIProjectData {
  @ApiProperty({
    type: String,
  })
  type = 'projects';

  @ApiProperty()
  id!: string;

  @ApiProperty({
    type: Project,
  })
  attributes!: Project;

  @ApiPropertyOptional()
  relationships?: Record<string, unknown>;
}

export class ProjectResultPlural {
  @ApiProperty({
    isArray: true,
    type: JSONAPIProjectData,
  })
  data!: JSONAPIProjectData[];
}

export class ProjectResultSingular extends JsonApiAsyncJobMeta {
  @ApiProperty()
  data!: JSONAPIProjectData;
}
