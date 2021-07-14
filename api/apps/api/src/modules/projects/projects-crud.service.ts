import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { isDefined } from '@marxan/utils';
import { InjectRepository } from '@nestjs/typeorm';
import { AppInfoDTO } from '@marxan-api/dto/info.dto';
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
import { FetchSpecification } from 'nestjs-base-service';
import {
  MultiplePlanningAreaIds,
  PlanningAreasService,
} from './planning-areas';

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

@Injectable()
export class ProjectsCrudService extends AppBaseService<
  Project,
  CreateProjectDTO,
  UpdateProjectDTO,
  AppInfoDTO
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
    _info?: AppInfoDTO,
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
    info?: AppInfoDTO,
  ): Promise<Project> {
    /**
     * @debt Temporary setup. I think we should remove TimeUserEntityMetadata
     * from entities and just use a separate event log, and a view to obtain the
     * same information (who created an entity and when, and when it was last
     * modified) from that log, kind of event sourcing way.
     */
    const project = await super.setDataCreate(create, info);
    project.createdBy = info?.authenticatedUser?.id!;

    const bbox = await this.planningAreasService.getPlanningAreaBBox({
      ...create,
      planningAreaGeometryId: create.planningAreaId,
    });
    if (bbox) {
      project.bbox = bbox;
    }

    return project;
  }

  async actionAfterCreate(
    model: Project,
    createModel: CreateProjectDTO,
    _info?: AppInfoDTO,
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
        this.planningUnitsService.create(createModel),
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
    _info?: AppInfoDTO,
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
        this.planningUnitsService.create(createModel),
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
    _?: AppInfoDTO,
  ): Promise<Project> {
    const bbox = await this.planningAreasService.getPlanningAreaBBox({
      ...update,
      planningAreaGeometryId: update.planningAreaId,
    });
    if (bbox) {
      const modelWithBbox = await super.setDataUpdate(model, update, _);
      modelWithBbox.bbox = bbox;
      return modelWithBbox;
    }
    return model;
  }

  async extendGetByIdResult(
    entity: Project,
    _fetchSpecification?: FetchSpecification,
    _info?: AppInfoDTO,
  ): Promise<Project> {
    const ids: MultiplePlanningAreaIds = entity;
    const idAndName = await this.planningAreasService.getPlanningAreaIdAndName(
      ids,
    );
    if (isDefined(idAndName)) {
      entity.planningAreaId = idAndName.planningAreaId;
      entity.planningAreaName = idAndName.planningAreaName;
    }
    return entity;
  }

  async extendFindAllResults(
    entitiesAndCount: [Project[], number],
    _fetchSpecification?: FetchSpecification,
    _info?: AppInfoDTO,
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
