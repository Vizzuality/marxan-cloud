import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppInfoDTO } from 'dto/info.dto';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Project } from './project.api.entity';
import { CreateProjectDTO } from './dto/create.project.dto';
import { UpdateProjectDTO } from './dto/update.project.dto';

import * as faker from 'faker';
import { UsersService } from 'modules/users/users.service';
import { ScenariosService } from 'modules/scenarios/scenarios.service';
import { PlanningUnitsService } from 'modules/planning-units/planning-units.service';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';
import { Country } from 'modules/countries/country.geo.entity';
import { AdminArea } from 'modules/admin-areas/admin-area.geo.entity';
import { AdminAreasService } from 'modules/admin-areas/admin-areas.service';
import { CountriesService } from 'modules/countries/countries.service';

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
export class ProjectsService extends AppBaseService<
  Project,
  CreateProjectDTO,
  UpdateProjectDTO,
  AppInfoDTO
> {
  private readonly logger = new Logger(ProjectsService.name);
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
    super(repository, 'project', 'projects');
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

  async importLegacyProject(_file: Express.Multer.File): Promise<Project> {
    return new Project();
  }

  async fakeFindOne(_id: string): Promise<Project> {
    const project = {
      ...new Project(),
      id: faker.random.uuid(),
      name: faker.lorem.words(5),
      description: faker.lorem.sentence(),
      users: await Promise.all(
        Array.from({ length: 10 }).map(
          async (_userId) =>
            await this.usersService.fakeFindOne(faker.random.uuid()),
        ),
      ),
      attributes: await Promise.all(
        Array.from({ length: 5 }).map(
          async (_scenarioId) =>
            await this.scenariosService.fakeFindOne(faker.random.uuid()),
        ),
      ),
    };
    return project;
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
  ): Promise<Country | Partial<AdminArea | undefined>> {
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
    return planningArea
  }

  async actionAfterCreate(
    model: Project,
    createModel: CreateProjectDTO,
    info?: AppInfoDTO,
  ): Promise<void> {
    if (createModel.planningUnitAreakm2 && createModel.planningUnitGridShape &&
      (createModel.countryId || createModel.adminAreaLevel1Id || createModel.adminAreaLevel2Id || createModel.extent)) {
      this.logger.debug('creating planning unit job ');
      return this.planningUnitsService.create(createModel);
    }
  }

  async actionAfterUpdate(
    model: Project,
    createModel: CreateProjectDTO,
    info?: AppInfoDTO,
  ): Promise<void> {
    if (createModel.planningUnitAreakm2 && createModel.planningUnitGridShape &&
      (createModel.countryId || createModel.adminAreaLevel1Id || createModel.adminAreaLevel2Id || createModel.extent)) {
      this.logger.debug('creating planning unit job ');
      return this.planningUnitsService.create(createModel);
    }
  }
}
