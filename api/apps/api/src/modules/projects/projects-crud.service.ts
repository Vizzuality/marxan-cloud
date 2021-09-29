import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { assertDefined, isDefined } from '@marxan/utils';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Project } from './project.api.entity';
import { CreateProjectDTO } from './dto/create.project.dto';
import { UpdateProjectDTO } from './dto/update.project.dto';
import { UsersService } from '@marxan-api/modules/users/users.service';
import { ScenariosCrudService } from '@marxan-api/modules/scenarios/scenarios-crud.service';
import { PlanningUnitsService } from '@marxan-api/modules/planning-units/planning-units.service';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from '@marxan-api/utils/app-base.service';
import { AdminAreasService } from '@marxan-api/modules/admin-areas/admin-areas.service';
import { CountriesService } from '@marxan-api/modules/countries/countries.service';
import { AppConfig } from '@marxan-api/utils/config.utils';
import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';
import { User } from '@marxan-api/modules/users/user.api.entity';
import { FetchSpecification } from 'nestjs-base-service';
import {
  MultiplePlanningAreaIds,
  PlanningAreasService,
} from './planning-areas';
import { UsersProjectsApiEntity } from './control-level/users-projects.api.entity';
import { Roles } from '@marxan-api/modules/users/role.api.entity';
import { AppInfoDTO } from '@marxan-api/dto/info.dto';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { ProtectedArea } from '@marxan/protected-areas';

const projectFilterKeyNames = [
  'name',
  'organizationId',
  'countryId',
  'adminAreaLevel1Id',
  'adminAreaLevel2Id',
] as const;
type ProjectFilterKeys = keyof Pick<
  Project,
  typeof projectFilterKeyNames[number]
>;
type ProjectFilters = Record<ProjectFilterKeys, string[]>;

export type ProjectsInfoDTO = AppInfoDTO & {
  params?: {
    nameSearch?: string;
  };
};

@Injectable()
export class ProjectsCrudService extends AppBaseService<
  Project,
  CreateProjectDTO,
  UpdateProjectDTO,
  ProjectsInfoDTO
> {
  constructor(
    @InjectRepository(Project)
    protected readonly repository: Repository<Project>,
    @Inject(forwardRef(() => ScenariosCrudService))
    protected readonly scenariosService: ScenariosCrudService,
    @Inject(UsersService) protected readonly usersService: UsersService,
    @Inject(AdminAreasService)
    protected readonly adminAreasService: AdminAreasService,
    @Inject(CountriesService)
    protected readonly countriesService: CountriesService,
    @Inject(PlanningUnitsService)
    private readonly planningUnitsService: PlanningUnitsService,
    private readonly planningAreasService: PlanningAreasService,
    @InjectRepository(UsersProjectsApiEntity)
    private readonly userProjects: Repository<UsersProjectsApiEntity>,
    @InjectRepository(ProtectedArea, DbConnections.geoprocessingDB)
    private readonly protectedAreas: Repository<ProtectedArea>,
  ) {
    super(repository, 'project', 'projects', {
      logging: { muteAll: AppConfig.get<boolean>('logging.muteAll', false) },
    });
  }

  get serializerConfig(): JSONAPISerializerConfig<Project> {
    return {
      attributes: [
        'name',
        'description',
        'countryId',
        'adminAreaLevel1Id',
        'adminAreaLevel2Id',
        'planningUnitGridShape',
        'planningUnitAreakm2',
        'users',
        'scenarios',
        'createdAt',
        'lastModifiedAt',
        'planningAreaId',
        'planningAreaName',
        'bbox',
        'customProtectedAreas',
      ],
      keyForAttribute: 'camelCase',
      users: {
        ref: 'id',
        attributes: ['fname', 'lname', 'email', 'projectRoles'],
        projectRoles: {
          ref: 'name',
          attributes: ['name'],
        },
      },
      scenarios: {
        ref: 'id',
        attributes: [
          'name',
          'description',
          'type',
          'wdpaFilter',
          'wdpaThreshold',
          'adminRegionId',
          'numberOfRuns',
          'boundaryLengthModifier',
          'metadata',
          'status',
          'createdAt',
          'lastModifiedAt',
        ],
      },
    };
  }

  /**
   * Apply service-specific filters.
   */
  setFilters(
    query: SelectQueryBuilder<Project>,
    filters: ProjectFilters,
    _info?: ProjectsInfoDTO,
  ): SelectQueryBuilder<Project> {
    this._processBaseFilters<ProjectFilters>(
      query,
      filters,
      projectFilterKeyNames,
    );
    return query;
  }

  async setDataCreate(
    create: CreateProjectDTO,
    info?: ProjectsInfoDTO,
  ): Promise<Project> {
    assertDefined(info?.authenticatedUser?.id);
    /**
     * @debt Temporary setup. I think we should remove TimeUserEntityMetadata
     * from entities and just use a separate event log, and a view to obtain the
     * same information (who created an entity and when, and when it was last
     * modified) from that log, kind of event sourcing way.
     */
    const project = await super.setDataCreate(create, info);
    project.createdBy = info.authenticatedUser?.id;
    project.planningAreaGeometryId = create.planningAreaId;

    const bbox = await this.planningAreasService.getPlanningAreaBBox({
      ...create,
      planningAreaGeometryId: create.planningAreaId,
    });
    if (bbox) {
      project.bbox = bbox;
    }

    return project;
  }

  async assignCreatorRole(projectId: string, userId: string): Promise<void> {
    await this.userProjects.save(
      this.userProjects.create({
        projectId,
        userId,
        roleName: Roles.project_owner,
      }),
    );
  }

  async actionAfterCreate(
    model: Project,
    createModel: CreateProjectDTO,
    _info?: ProjectsInfoDTO,
  ): Promise<void> {
    if (
      createModel.planningUnitAreakm2 &&
      createModel.planningUnitGridShape &&
      (createModel.countryId ||
        createModel.adminAreaLevel1Id ||
        createModel.adminAreaLevel2Id ||
        createModel.planningAreaId)
    ) {
      this.logger.debug(
        'creating planning unit job and assigning project to area',
      );
      await Promise.all([
        this.planningUnitsService.create({
          ...createModel,
          planningUnitAreakm2: createModel.planningUnitAreakm2,
          planningUnitGridShape: createModel.planningUnitGridShape,
          projectId: model.id,
        }),
        this.planningAreasService.assignProject({
          projectId: model.id,
          planningAreaGeometryId: createModel.planningAreaId,
        }),
      ]);
    }
  }

  async actionAfterUpdate(
    model: Project,
    createModel: UpdateProjectDTO,
    _info?: ProjectsInfoDTO,
  ): Promise<void> {
    /**
     * @deprecated Workers and jobs should be move to the new functionality
     */

    if (
      createModel.planningUnitAreakm2 &&
      createModel.planningUnitGridShape &&
      (createModel.countryId ||
        createModel.adminAreaLevel1Id ||
        createModel.adminAreaLevel2Id ||
        createModel.planningAreaId)
    ) {
      await Promise.all([
        this.planningUnitsService.create({
          ...createModel,
          planningUnitAreakm2: createModel.planningUnitAreakm2,
          planningUnitGridShape: createModel.planningUnitGridShape,
          projectId: model.id,
        }),
        this.planningAreasService.assignProject({
          projectId: model.id,
          planningAreaGeometryId: createModel.planningAreaId,
        }),
      ]);
    }
  }

  async setDataUpdate(
    model: Project,
    update: UpdateProjectDTO,
    _?: ProjectsInfoDTO,
  ): Promise<Project> {
    const bbox = await this.planningAreasService.getPlanningAreaBBox({
      ...update,
      planningAreaGeometryId: update.planningAreaId,
    });
    if (bbox || update.planningAreaId !== undefined) {
      const updatedModel = await super.setDataUpdate(model, update, _);
      if (bbox) updatedModel.bbox = bbox;
      if (update.planningAreaId !== undefined)
        updatedModel.planningAreaGeometryId = update.planningAreaId;
      return updatedModel;
    }
    return model;
  }

  async extendGetByIdResult(
    entity: Project,
    _fetchSpecification?: FetchSpecification,
    _info?: ProjectsInfoDTO,
  ): Promise<Project> {
    const ids: MultiplePlanningAreaIds = entity;
    const idAndName = await this.planningAreasService.getPlanningAreaIdAndName(
      ids,
    );
    if (isDefined(idAndName)) {
      entity.planningAreaId = idAndName.planningAreaId;
      entity.planningAreaName = idAndName.planningAreaName;
    }

    const customProtectedAreas = await this.protectedAreas.find({
      where: {
        projectId: entity.id,
      },
    });
    entity.customProtectedAreas = customProtectedAreas.map((area) => ({
      name: area.fullName ?? undefined,
      id: area.id,
    }));

    return entity;
  }

  extendGetByIdQuery(
    query: SelectQueryBuilder<Project>,
    fetchSpecification?: FetchSpecification,
    info?: ProjectsInfoDTO,
  ): SelectQueryBuilder<Project> {
    const loggedUser = Boolean(info?.authenticatedUser);
    query.leftJoin(
      UsersProjectsApiEntity,
      `acl`,
      `${this.alias}.id = acl.project_id`,
    );

    if (loggedUser) {
      query
        .andWhere(`acl.user_id = :userId`, {
          userId: info?.authenticatedUser?.id,
        })
        .andWhere(`acl.role_id = :roleId`, {
          roleId: Roles.project_owner,
        });
    } else {
      query.andWhere(`${this.alias}.is_public = true`);
    }

    return query;
  }

  async extendFindAllQuery(
    query: SelectQueryBuilder<Project>,
    fetchSpecification: FetchSpecification,
    info?: ProjectsInfoDTO,
  ): Promise<SelectQueryBuilder<Project>> {
    const loggedUser = Boolean(info?.authenticatedUser);

    const { namesSearch } = info?.params ?? {};

    query.leftJoin(
      UsersProjectsApiEntity,
      `acl`,
      `${this.alias}.id = acl.project_id`,
    );

    if (namesSearch) {
      const nameSearchFilterField = 'nameSearchFilter' as const;
      query.leftJoin(
        GeoFeature,
        'geofeature',
        `${this.alias}.id = geofeature.project_id`,
      );
      query.leftJoin(User, 'user', `${this.alias}.createdBy = user.id`);
      query.andWhere(
        `(
          ${this.alias}.name
          ||' '|| COALESCE(geofeature.description, '')
          ||' '|| COALESCE(geofeature.feature_class_name, '')
          ||' '|| COALESCE(user.fname, '')
          ||' '|| COALESCE(user.lname, '')
          ||' '|| COALESCE(user.display_name, '')
        ) ILIKE :${nameSearchFilterField}`,
        { [nameSearchFilterField]: `%${namesSearch}%` },
      );
    }

    if (loggedUser) {
      query
        .andWhere(`acl.user_id = :userId`, {
          userId: info?.authenticatedUser?.id,
        })
        .andWhere(`acl.role_id = :roleId`, {
          roleId: Roles.project_owner,
        });
    } else {
      query.andWhere(`${this.alias}.is_public = true`);
    }

    return query;
  }

  /**
   * Could be that entity-relations in codebase are wrong
   * https://github.com/typeorm/typeorm/blob/master/docs/many-to-many-relations.md#many-to-many-relations-with-custom-properties
   *
   * Thus, when using `remove(EntityInstance)` it complains on missing
   * `user_id`.
   *
   * `delete` seems to omit code-declarations and use db's cascades
   */
  async remove(id: string): Promise<void> {
    await this.repository.delete({
      id,
    });
  }

  async extendFindAllResults(
    entitiesAndCount: [Project[], number],
    _fetchSpecification?: FetchSpecification,
    _info?: ProjectsInfoDTO,
  ): Promise<[Project[], number]> {
    const extendedEntities: Promise<Project>[] = entitiesAndCount[0].map(
      (entity) => this.extendGetByIdResult(entity),
    );
    return [await Promise.all(extendedEntities), entitiesAndCount[1]];
  }

  locatePlanningAreaEntity = this.planningAreasService.locatePlanningAreaEntity.bind(
    this.planningAreasService,
  );
}
