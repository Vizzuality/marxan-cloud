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
        'protectedAreaFilterByIds',
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
    _info?: AppInfoDTO,
  ): SelectQueryBuilder<Scenario> {
    query = this._processBaseFilters<ScenarioFilters>(
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
    /**
     * We always compute the list of protected areas to associate to a scenario
     * from the list of IUCN categories and the list of user-uploaded protected
     * areas supplied in the request. Users should not set the list of actual
     * protected areas directly (and in fact we don't even expose this property
     * in DTOs).
     */
    if (create.wdpaIucnCategories || create.customProtectedAreaIds) {
      const wdpaAreaIds = await this.getWDPAAreasWithinProjectByIUCNCategory(
        create,
      );
      model.protectedAreaFilterByIds = concat(
        wdpaAreaIds,
        create.customProtectedAreaIds,
      ).filter((i): i is string => !!i);
    }
    model.createdBy = info?.authenticatedUser?.id!;
    return model;
  }

  async setDataUpdate(
    model: Scenario,
    update: UpdateScenarioDTO,
    info?: AppInfoDTO,
  ): Promise<Scenario> {
    model = await super.setDataUpdate(model, update, info);
    /**
     * We always compute the list of protected areas to associate to a scenario
     * from the list of IUCN categories and the list of user-uploaded protected
     * areas supplied in the request. Users should not set the list of actual
     * protected areas directly (and in fact we don't even expose this property
     * in DTOs).
     */
    if (update.wdpaIucnCategories || update.customProtectedAreaIds) {
      const wdpaAreaIds = await this.getWDPAAreasWithinProjectByIUCNCategory(
        update,
      );
      model.protectedAreaFilterByIds = concat(
        wdpaAreaIds,
        update.customProtectedAreaIds,
      ).filter((i): i is string => !!i);
    }
    return model;
  }

  /**
   * Link protected areas to the scenario.
   */
  async getWDPAAreasWithinProjectByIUCNCategory(
    {
      projectId,
      wdpaIucnCategories,
    }:
      | Pick<CreateScenarioDTO, 'projectId' | 'wdpaIucnCategories'>
      | Pick<UpdateScenarioDTO, 'projectId' | 'wdpaIucnCategories'>,
    _info?: AppInfoDTO,
  ): Promise<string[] | undefined> {
    /**
     * If no IUCN categories were supplied, we're done.
     */
    if (!wdpaIucnCategories) {
      return;
    }

    /**
     * We need to get the parent project's metadata first
     */
    const parentProject = await this.projectRepository.findOneOrFail(projectId);

    /**
     * We can then check if project boundaries are set (either a GADM admin area
     * or a custom geometry).
     *
     * @todo Custom project planning area geometries are not implemented yet; once
     * users can upload and select these, we should add selection of protected
     * areas in custom geometries here. In practice this should all be handled in
     * Project.getPlanningArea(), but we'll need to check that things work as
     * expected.
     */
    const planningAreaId = await this.projectsService
      .getPlanningArea(parentProject)
      .then((r) => r?.id);

    /**
     * If project boundaries are set, we can then retrieve WDPA protected areas
     * that intersect the boundaries, via the list of user-supplied IUCN
     * categories they want to use as selector for protected areas.
     */
    const wdpaAreaIdsWithinPlanningArea = planningAreaId
      ? await this.protectedAreasService
          .findAllWDPAProtectedAreasInPlanningAreaByIUCNCategory(
            planningAreaId,
            wdpaIucnCategories,
          )
          .then((r) => r.map((i) => i.id))
      : undefined;
    return wdpaAreaIdsWithinPlanningArea;
  }
}
