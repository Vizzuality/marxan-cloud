import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppInfoDTO } from 'dto/info.dto';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreateScenarioDTO } from './dto/create.scenario.dto';
import { UpdateScenarioDTO } from './dto/update.scenario.dto';
import { JobStatus, Scenario, ScenarioType } from './scenario.api.entity';

import * as faker from 'faker';
import { UsersService } from 'modules/users/users.service';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';
import { Project } from 'modules/projects/project.api.entity';
import { ProtectedAreasService } from 'modules/protected-areas/protected-areas.service';
import { ProjectsService } from 'modules/projects/projects.service';
import { concat } from 'lodash';

const scenarioFilterKeyNames = ['name', 'type', 'projectId', 'status'] as const;
type ScenarioFilterKeys = keyof Pick<
  Scenario,
  typeof scenarioFilterKeyNames[number]
>;
type ScenarioFilters = Record<ScenarioFilterKeys, string[]>;

@Injectable()
export class ScenariosService extends AppBaseService<
  Scenario,
  CreateScenarioDTO,
  UpdateScenarioDTO,
  AppInfoDTO
> {
  private readonly logger = new Logger(ScenariosService.name);

  constructor(
    @InjectRepository(Scenario)
    protected readonly repository: Repository<Scenario>,
    @InjectRepository(Project)
    protected readonly projectRepository: Repository<Project>,
    @Inject(UsersService) protected readonly usersService: UsersService,
    @Inject(ProtectedAreasService)
    protected readonly protectedAreasService: ProtectedAreasService,
    @Inject(forwardRef(() => ProjectsService))
    protected readonly projectsService: ProjectsService,
  ) {
    super(repository, 'scenario', 'scenarios');
  }

  get serializerConfig(): JSONAPISerializerConfig<Scenario> {
    return {
      attributes: [
        'name',
        'description',
        'type',
        'wdpaFilter',
        'wdpaThreshold',
        'numberOfRuns',
        'boundaryLengthModifier',
        'metadata',
        'status',
        'projectId',
        'project',
        'users',
        'createdAt',
        'lastModifiedAt',
      ],
      keyForAttribute: 'camelCase',
      project: {
        ref: 'id',
        attributes: [
          'name',
          'description',
          'countryId',
          'adminAreaLevel1Id',
          'adminAreaLevel2Id',
          'planningUnitGridShape',
          'planningUnitAreakm2',
          'createdAt',
          'lastModifiedAt',
        ],
      },
      users: {
        ref: 'id',
        attributes: ['fname', 'lname', 'email'],
        projectRoles: {
          ref: 'name',
          attributes: ['name'],
        },
      },
    };
  }

  async importLegacyScenario(_file: Express.Multer.File): Promise<Scenario> {
    return new Scenario();
  }

  async fakeFindOne(_id: string): Promise<Scenario> {
    const scenario = {
      ...new Scenario(),
      id: faker.random.uuid(),
      name: faker.lorem.words(5),
      description: faker.lorem.sentence(),
      type: ScenarioType.marxan,
      extent: {},
      wdpaFilter: {},
      wdpaThreshold: faker.random.number(100),
      adminRegionId: faker.random.uuid(),
      numberOfRuns: faker.random.number(100),
      boundaryLengthModifier: faker.random.number(100),
      metadata: {},
      status: JobStatus.created,
      users: await Promise.all(
        Array.from({ length: 10 }).map(
          async (_userId) =>
            await this.usersService.fakeFindOne(faker.random.uuid()),
        ),
      ),
    };
    return scenario;
  }

  /**
   * Apply service-specific filters.
   */
  setFilters(
    query: SelectQueryBuilder<Scenario>,
    filters: ScenarioFilters,
    info?: AppInfoDTO,
  ): SelectQueryBuilder<Scenario> {
    this._processBaseFilters<ScenarioFilters>(
      query,
      filters,
      scenarioFilterKeyNames,
    );
    return query;
  }

  async setDataCreate(
    create: CreateScenarioDTO,
    info?: AppInfoDTO,
  ): Promise<Scenario> {
    const model = await super.setDataCreate(create, info);
    model.createdBy = info?.authenticatedUser?.id!;
    return model;
  }
}
