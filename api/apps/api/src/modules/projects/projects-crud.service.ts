import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppInfoDTO } from '@marxan-api/dto/info.dto';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Project } from './project.api.entity';
import { CreateProjectDTO } from './dto/create.project.dto';
import { UpdateProjectDTO } from './dto/update.project.dto';
import { UsersService } from '@marxan-api/modules/users/users.service';
import { ScenariosService } from '@marxan-api/modules/scenarios/scenarios.service';
import { PlanningUnitsService } from '@marxan-api/modules/planning-units/planning-units.service';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from '@marxan-api/utils/app-base.service';
import { Country } from '@marxan-api/modules/countries/country.geo.entity';
import { AdminAreasService } from '@marxan-api/modules/admin-areas/admin-areas.service';
import { CountriesService } from '@marxan-api/modules/countries/countries.service';
import { AppConfig } from '@marxan-api/utils/config.utils';
import { AdminArea } from '@marxan/admin-regions';

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
    @Inject(forwardRef(() => ScenariosService))
    protected readonly scenariosService: ScenariosService,
    @Inject(UsersService) protected readonly usersService: UsersService,
    @Inject(AdminAreasService)
    protected readonly adminAreasService: AdminAreasService,
    @Inject(CountriesService)
    protected readonly countriesService: CountriesService,
    @Inject(PlanningUnitsService)
    private readonly planningUnitsService: PlanningUnitsService,
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
    return project;
  }

  /**
   * Look up the planning area for this project.
   *
   * In decreasing precedence (i.e. most specific is used):
   *
   * * a project-specific protected area (@todo not implemented yet)
   * * a level 2 admin area
   * * a level 1 admin area
   * * a country
   */
  async getPlanningArea(
    project: Partial<Project>,
  ): Promise<Partial<AdminArea | undefined>> {
    const planningArea = project.planningAreaGeometryId
      ? /**
         * @todo here we should look up the actual custom planning area from
         * `planningAreaGeometryId`, when we implement this.
         */
        new AdminArea()
      : project.adminAreaLevel2Id
      ? await this.adminAreasService.getByLevel1OrLevel2Id(
          project.adminAreaLevel2Id!,
        )
      : project.adminAreaLevel1Id
      ? await this.adminAreasService.getByLevel1OrLevel2Id(
          project.adminAreaLevel1Id!,
        )
      : project.countryId
      ? await this.countriesService.getById(project.countryId)
      : undefined;
    return planningArea;
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
        createModel.extent)
    ) {
      this.logger.debug('creating planning unit job ');
      return this.planningUnitsService.create(createModel);
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
        createModel.extent)
    ) {
      this.logger.debug('creating planning unit job ');
      return this.planningUnitsService.create(createModel);
    }
  }

  async validateBeforeCreate(
    createModel: CreateProjectDTO,
    info?: AppInfoDTO,
  ): Promise<void> {
    if (this.shouldManuallySetBbox(createModel)) {
      const derivedSubmittedAdminArea = await this.getPlanningArea({
        ...createModel,
        extent: undefined,
      });

      if (!derivedSubmittedAdminArea) {
        // due to current usage, hard to get around it with coupling and throw errors to controller
        throw new BadRequestException('...');
      }

      if (
        derivedSubmittedAdminArea.gid0 !== createModel.countryId ||
        derivedSubmittedAdminArea.gid1 !== createModel.adminAreaLevel1Id ||
        derivedSubmittedAdminArea.gid2 !== createModel.adminAreaLevel2Id
      ) {
        throw new BadRequestException('...');
      }

      if (derivedSubmittedAdminArea.bbox) {
        createModel.extent = {
          bbox: derivedSubmittedAdminArea.bbox,
          type: 'Polygon',
          coordinates: [],
        };
      }

      // otherwise, is it our error?
    }

    return;
  }

  async validateBeforeUpdate(
    projectId: string,
    updateModel: UpdateProjectDTO,
    info?: AppInfoDTO,
  ): Promise<void> {
    //
    return;
  }

  private shouldManuallySetBbox = (createModel: CreateProjectDTO): boolean =>
    Boolean(
      createModel.adminAreaLevel1Id ||
        createModel.adminAreaLevel2Id ||
        createModel.countryId,
    );
}
