import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FetchSpecification } from 'nestjs-base-service';
import { AppInfoDTO } from '@marxan-api/dto/info.dto';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreateScenarioDTO } from './dto/create.scenario.dto';
import { UpdateScenarioDTO } from './dto/update.scenario.dto';
import { JobStatus, Scenario, ScenarioType } from './scenario.api.entity';

import * as faker from 'faker';
import { UsersService } from '@marxan-api/modules/users/users.service';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from '@marxan-api/utils/app-base.service';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { ProtectedAreasCrudService } from '@marxan-api/modules/protected-areas/protected-areas-crud.service';
import { ProjectsCrudService } from '@marxan-api/modules/projects/projects-crud.service';
import { concat } from 'lodash';
import { AppConfig } from '@marxan-api/utils/config.utils';
import { WdpaAreaCalculationService } from './wdpa-area-calculation.service';
import { CommandBus } from '@nestjs/cqrs';
import { CalculatePlanningUnitsProtectionLevel } from '../planning-units-protection-level';
import { assertDefined } from '@marxan/utils';

const scenarioFilterKeyNames = ['name', 'type', 'projectId', 'status'] as const;
type ScenarioFilterKeys = keyof Pick<
  Scenario,
  typeof scenarioFilterKeyNames[number]
>;
type ScenarioFilters = Record<ScenarioFilterKeys, string[]>;

export type ScenarioInfoDTO = AppInfoDTO & {
  params?: {
    nameAndDescriptionFilter?: string;
  };
};

@Injectable()
export class ScenariosCrudService extends AppBaseService<
  Scenario,
  CreateScenarioDTO,
  UpdateScenarioDTO,
  ScenarioInfoDTO
> {
  constructor(
    @InjectRepository(Scenario)
    protected readonly repository: Repository<Scenario>,
    @InjectRepository(Project)
    protected readonly projectRepository: Repository<Project>,
    @Inject(UsersService) protected readonly usersService: UsersService,
    @Inject(ProtectedAreasCrudService)
    protected readonly protectedAreasService: ProtectedAreasCrudService,
    @Inject(forwardRef(() => ProjectsCrudService))
    protected readonly projectsService: ProjectsCrudService,
    private readonly wdpaCalculationsDetector: WdpaAreaCalculationService,
    private readonly commandBus: CommandBus,
  ) {
    super(repository, 'scenario', 'scenarios', {
      logging: { muteAll: AppConfig.get<boolean>('logging.muteAll', false) },
    });
  }

  async actionAfterCreate(
    model: Scenario,
    createModel: CreateScenarioDTO,
    _?: ScenarioInfoDTO,
  ): Promise<void> {
    if (this.wdpaCalculationsDetector.shouldTrigger(model, createModel)) {
      await this.commandBus.execute(
        new CalculatePlanningUnitsProtectionLevel(
          model.id,
          model.protectedAreaFilterByIds,
        ),
      );
    }
  }

  async actionAfterUpdate(
    model: Scenario,
    updateModel: UpdateScenarioDTO,
    _?: ScenarioInfoDTO,
  ): Promise<void> {
    if (this.wdpaCalculationsDetector.shouldTrigger(model, updateModel)) {
      await this.commandBus.execute(
        new CalculatePlanningUnitsProtectionLevel(
          model.id,
          model.protectedAreaFilterByIds,
        ),
      );
    }
  }

  get serializerConfig(): JSONAPISerializerConfig<Scenario> {
    return {
      attributes: [
        'id',
        'name',
        'description',
        'type',
        'protectedAreaFilterByIds',
        'customProtectedAreaIds',
        'wdpaIucnCategories',
        'wdpaThreshold',
        'numberOfRuns',
        'boundaryLengthModifier',
        'metadata',
        'status',
        'projectId',
        'project',
        'users',
        'createdAt',
        'createdByUser',
        'lastModifiedAt',
        'ranAtLeastOnce',
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
    _info?: ScenarioInfoDTO,
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
    info?: ScenarioInfoDTO,
  ): Promise<Scenario> {
    const model = await super.setDataCreate(create, info);
    assertDefined(model.projectId);
    /**
     * We always compute the list of protected areas to associate to a scenario
     * from the list of IUCN categories and the list of project-specific protected
     * areas supplied in the request. Users should not set the list of actual
     * protected areas directly (and in fact we don't even expose this property
     * in DTOs).
     */
    if (create.wdpaIucnCategories || create.customProtectedAreaIds) {
      const wdpaAreaIds = await this.getWDPAAreasWithinProjectByIUCNCategory(
        create,
      );
      model.protectedAreaFilterByIds = [
        ...new Set(
          concat(wdpaAreaIds, create.customProtectedAreaIds).filter(
            (i): i is string => !!i,
          ),
        ),
      ];
    }
    model.createdBy = info?.authenticatedUser?.id!;
    return model;
  }

  async setDataUpdate(
    model: Scenario,
    update: UpdateScenarioDTO,
    info?: ScenarioInfoDTO,
  ): Promise<Scenario> {
    update.projectId = (
      await this.projectRepository.findOne({
        where: {
          id: model.projectId,
        },
      })
    )?.id;
    assertDefined(update.projectId);
    model = await super.setDataUpdate(model, update, info);
    /**
     * We always compute the list of protected areas to associate to a scenario
     * from the list of IUCN categories and the list of project-specific protected
     * areas supplied in the request. Users should not set the list of actual
     * protected areas directly (and in fact we don't even expose this property
     * in DTOs).
     */
    if (update.wdpaIucnCategories || update.customProtectedAreaIds) {
      const wdpaAreaIds = await this.getWDPAAreasWithinProjectByIUCNCategory(
        update,
      );
      model.protectedAreaFilterByIds = [
        ...new Set(
          concat(wdpaAreaIds, update.customProtectedAreaIds).filter(
            (i): i is string => !!i,
          ),
        ),
      ];
    }

    if (model.metadata?.marxanInputParameterFile) {
      model.metadata.marxanInputParameterFile = Object.assign(
        model.metadata.marxanInputParameterFile,
        update.metadata?.marxanInputParameterFile,
      );
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
    _info?: ScenarioInfoDTO,
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
    const planningAreaLocation = await this.projectsService.locatePlanningAreaEntity(
      parentProject,
    );

    /**
     * If project boundaries are set, we can then retrieve WDPA protected areas
     * that intersect the boundaries, via the list of user-supplied IUCN
     * categories they want to use as selector for protected areas.
     */
    const wdpaAreaIdsWithinPlanningArea = planningAreaLocation
      ? await this.protectedAreasService
          .findAllWDPAProtectedAreasInPlanningAreaByIUCNCategory(
            planningAreaLocation.id,
            planningAreaLocation.tableName,
            wdpaIucnCategories,
          )
          .then((r) => r.map((i) => i.id))
      : undefined;
    return wdpaAreaIdsWithinPlanningArea;
  }

  async extendFindAllQuery(
    query: SelectQueryBuilder<Scenario>,
    fetchSpecification: FetchSpecification,
    info?: ScenarioInfoDTO,
  ): Promise<SelectQueryBuilder<Scenario>> {
    const nameAndDescriptionFilter = info?.params?.nameAndDescriptionFilter;
    if (nameAndDescriptionFilter) {
      const nameAndDescriptionFilterField = 'nameAndDescriptionFilter' as const;
      query.andWhere(
        `(${this.alias}.name ||' '|| COALESCE(${this.alias}.description, '')) ILIKE :${nameAndDescriptionFilterField}`,
        { [nameAndDescriptionFilterField]: `%${nameAndDescriptionFilter}%` },
      );
    }

    return query;
  }
}
