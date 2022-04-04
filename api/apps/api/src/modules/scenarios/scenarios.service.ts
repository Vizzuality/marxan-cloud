import {
  BadRequestException,
  HttpService,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { FetchSpecification } from 'nestjs-base-service';
import { classToClass } from 'class-transformer';
import * as stream from 'stream';
import { Either, isLeft, left, right } from 'fp-ts/Either';
import { pick } from 'lodash';

import { MarxanInput, MarxanParameters } from '@marxan/marxan-input';
import { AppInfoDTO } from '@marxan-api/dto/info.dto';
import { AppConfig } from '@marxan-api/utils/config.utils';
import { ScenarioFeaturesService } from '@marxan-api/modules/scenarios-features';
import { AdjustPlanningUnits } from '@marxan-api/modules/analysis/entry-points/adjust-planning-units';
import { apiGlobalPrefixes } from '@marxan-api/api.config';

import {
  ScenarioInfoDTO,
  ScenariosCrudService,
} from './scenarios-crud.service';

import { CreateScenarioDTO } from './dto/create.scenario.dto';
import { UpdateScenarioDTO } from './dto/update.scenario.dto';
import { UpdateScenarioPlanningUnitLockStatusDto } from './dto/update-scenario-planning-unit-lock-status.dto';
import { SolutionResultCrudService } from './solutions-result/solution-result-crud.service';
import {
  OutputFilesService,
  OutputZipFailure,
} from './output-files/output-files.service';
import {
  InputFilesArchiverService,
  InputFilesService,
  InputZipFailure,
} from './input-files';
import { notFound, RunService } from './marxan-run';
import { GeoFeatureSetSpecification } from '../geo-features/dto/geo-feature-set-specification.dto';
import { Scenario, SimpleJobStatus } from './scenario.api.entity';
import { assertDefined } from '@marxan/utils';
import { GeoFeaturePropertySetService } from '../geo-features/geo-feature-property-sets.service';
import { ScenarioPlanningUnitsService } from './planning-units/scenario-planning-units.service';
import { ScenarioPlanningUnitsLinkerService } from './planning-units/scenario-planning-units-linker-service';
import { CreateGeoFeatureSetDTO } from '../geo-features/dto/create.geo-feature-set.dto';
import { SpecificationService } from './specification';
import { CostRange, CostRangeService } from './cost-range-service';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetProjectErrors, GetProjectQuery } from '@marxan/projects';
import {
  ChangeProtectedAreasError,
  ProtectedAreaService,
  ScenarioProtectedArea,
  submissionFailed,
} from './protected-area';
import { ProtectedAreasChangeDto } from './dto/protected-area-change.dto';
import { UploadShapefileDto } from '@marxan-api/modules/scenarios/dto/upload.shapefile.dto';
import {
  CalibrationRunResult,
  ScenarioCalibrationRepo,
} from '../blm/values/scenario-calibration-repo';
import {
  DoesntExist,
  ProjectChecker,
} from '@marxan-api/modules/projects/project-checker/project-checker.service';
import { CancelBlmCalibration, StartBlmCalibration } from './blm-calibration';
import { BlockGuard } from '@marxan-api/modules/projects/block-guard/block-guard.service';
import { ScenarioAccessControl } from '@marxan-api/modules/access-control/scenarios-acl/scenario-access-control';
import { forbiddenError } from '@marxan-api/modules/access-control';
import { internalError } from '@marxan-api/modules/specification/application/submit-specification.command';
import { LastUpdatedSpecificationError } from '@marxan-api/modules/scenario-specification/application/last-updated-specification.query';
import { ScenariosPlanningUnitGeoEntity } from '@marxan/scenarios-planning-unit';
import { PaginationMeta } from '@marxan-api/utils/app-base.service';
import { ScenarioFeaturesData } from '@marxan/features';
import { ScenariosOutputResultsApiEntity } from '@marxan/marxan-output';
import {
  blmCreationFailure,
  CreateInitialScenarioBlm,
} from '@marxan-api/modules/scenarios/blm-calibration/create-initial-scenario-blm.command';
import {
  ChangeScenarioBlmRange,
  ChangeScenarioRangeErrors,
} from '@marxan-api/modules/scenarios/blm-calibration/change-scenario-blm-range.command';
import { ScenarioBlmRepo } from '@marxan-api/modules/blm/values';
import {
  GetScenarioFailure,
  scenarioNotFound,
} from '@marxan-api/modules/blm/values/blm-repos';

import { ExportScenario } from '../clone/export/application/export-scenario.command';
import {
  SetInitialCostSurface,
  SetInitialCostSurfaceError,
} from './cost-surface/application/set-initial-cost-surface.command';
import { UpdateCostSurface } from './cost-surface/application/update-cost-surface.command';
import { DeleteScenario } from './cost-surface/infra/delete-scenario.command';
import {
  lockedByAnotherUser,
  noLockInPlace,
} from '@marxan-api/modules/access-control/scenarios-acl/locks/lock.service';
import { ScenarioLockResultSingular } from '@marxan-api/modules/access-control/scenarios-acl/locks/dto/scenario.lock.dto';
import { ResourceId } from '@marxan/cloning/domain';
import { GeoJsonDataDTO } from './dto/shapefile.geojson.response.dto';
import { FeatureCollection } from 'geojson';
import {
  unknownPdfWebshotError,
  WebshotConfig,
  WebshotPdfConfig,
  WebshotService,
} from '@marxan/webshot';
import { blmImageMock } from './__mock__/blm-image-mock';

/** @debt move to own module */
const EmptyGeoFeaturesSpecification: GeoFeatureSetSpecification = {
  status: SimpleJobStatus.draft,
  features: [],
};

export const projectNotReady = Symbol('project not ready');
export type ProjectNotReady = typeof projectNotReady;

export const bestSolutionNotFound = Symbol('best solution not found');

export const projectDoesntExist = Symbol(`project doesn't exist`);
export type ProjectDoesntExist = typeof projectDoesntExist;

export type SubmitProtectedAreaError =
  | GetProjectErrors
  | typeof submissionFailed
  | typeof scenarioNotFound;

export type GetProtectedAreasError = GetProjectErrors | typeof scenarioNotFound;
export type GetBestSolutionError =
  | typeof forbiddenError
  | typeof scenarioNotFound
  | typeof bestSolutionNotFound;

export type UpdateProtectedAreasError =
  | ChangeProtectedAreasError
  | GetProjectErrors
  | typeof scenarioNotFound;

@Injectable()
export class ScenariosService {
  private readonly geoprocessingUrl: string = AppConfig.get(
    'geoprocessing.url',
  ) as string;

  constructor(
    private readonly crudService: ScenariosCrudService,
    private readonly scenarioFeatures: ScenarioFeaturesService,
    private readonly updatePlanningUnits: AdjustPlanningUnits,
    private readonly httpService: HttpService,
    private readonly solutionsCrudService: SolutionResultCrudService,
    private readonly marxanInputValidator: MarxanInput,
    private readonly runService: RunService,
    private readonly inputFilesService: InputFilesService,
    private readonly outputFilesService: OutputFilesService,
    private readonly geoFeaturePropertySetService: GeoFeaturePropertySetService,
    private readonly inputArchiveService: InputFilesArchiverService,
    private readonly planningUnitsService: ScenarioPlanningUnitsService,
    private readonly planningUnitsLinkerService: ScenarioPlanningUnitsLinkerService,
    private readonly specificationService: SpecificationService,
    private readonly costService: CostRangeService,
    private readonly blockGuard: BlockGuard,
    private readonly projectChecker: ProjectChecker,
    private readonly protectedArea: ProtectedAreaService,
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly blmValuesRepository: ScenarioBlmRepo,
    private readonly scenarioCalibrationRepository: ScenarioCalibrationRepo,
    private readonly scenarioAclService: ScenarioAccessControl,
    private readonly webshotService: WebshotService,
  ) {}

  async findAllPaginated(
    fetchSpecification: FetchSpecification,
    appInfo?: ScenarioInfoDTO,
  ) {
    return this.crudService.findAllPaginated(fetchSpecification, appInfo);
  }

  async getById(
    scenarioId: string,
    info: AppInfoDTO,
    fetchSpecification?: FetchSpecification,
  ): Promise<Either<GetScenarioFailure | typeof forbiddenError, Scenario>> {
    try {
      assertDefined(info.authenticatedUser);
      const scenario = await this.crudService.getById(
        scenarioId,
        fetchSpecification,
      );
      if (
        !(await this.scenarioAclService.canViewScenario(
          info.authenticatedUser.id,
          scenarioId,
        ))
      ) {
        return left(forbiddenError);
      }
      return right(scenario);
    } catch (error) {
      return left(scenarioNotFound);
    }
  }

  async remove(
    scenarioId: string,
    userId: string,
  ): Promise<
    Either<
      | typeof forbiddenError
      | typeof lockedByAnotherUser
      | typeof noLockInPlace
      | typeof scenarioNotFound,
      void
    >
  > {
    if (await this.givenScenarioDoesNotExist(scenarioId))
      return left(scenarioNotFound);

    const userCanEditScenario = await this.scenarioAclService.canEditScenarioAndOwnsLock(
      userId,
      scenarioId,
      true,
    );
    if (isLeft(userCanEditScenario)) {
      return userCanEditScenario;
    }
    return right(await this.crudService.remove(scenarioId));
  }

  async create(
    input: CreateScenarioDTO,
    info: AppInfoDTO,
  ): Promise<
    Either<
      | typeof forbiddenError
      | typeof blmCreationFailure
      | ProjectNotReady
      | ProjectDoesntExist
      | SetInitialCostSurfaceError,
      Scenario
    >
  > {
    assertDefined(info.authenticatedUser);
    if (
      !(await this.scenarioAclService.canCreateScenario(
        info.authenticatedUser.id,
        input.projectId,
      ))
    ) {
      return left(forbiddenError);
    }
    const validatedMetadata = this.getPayloadWithValidatedMetadata(input);
    const isProjectReady = await this.projectChecker.isProjectReady(
      input.projectId,
    );
    if (isLeft(isProjectReady)) {
      const _exhaustiveCheck: DoesntExist = isProjectReady.left;
      return left(projectDoesntExist);
    } else {
      if (!isProjectReady.right) {
        return left(projectNotReady);
      }
    }
    const scenario = await this.crudService.create(validatedMetadata, info);
    const blmCreationResult = await this.commandBus.execute(
      new CreateInitialScenarioBlm(scenario.id, scenario.projectId),
    );

    if (isLeft(blmCreationResult)) {
      await this.commandBus.execute(new DeleteScenario(scenario.id));

      return blmCreationResult;
    }

    await this.planningUnitsLinkerService.link(scenario);

    const costSurfaceInitializationResult = await this.commandBus.execute(
      new SetInitialCostSurface(scenario.id, scenario.projectId),
    );

    if (isLeft(costSurfaceInitializationResult)) {
      await this.commandBus.execute(new DeleteScenario(scenario.id));
      return costSurfaceInitializationResult;
    }

    await this.crudService.assignCreatorRole(
      scenario.id,
      info.authenticatedUser.id,
    );

    return right(scenario);
  }

  async update(
    scenarioId: string,
    userId: string,
    input: UpdateScenarioDTO,
  ): Promise<
    Either<
      | typeof forbiddenError
      | typeof lockedByAnotherUser
      | typeof noLockInPlace
      | typeof scenarioNotFound,
      Scenario
    >
  > {
    if (await this.givenScenarioDoesNotExist(scenarioId))
      return left(scenarioNotFound);

    const scenario = await this.getById(scenarioId, {
      authenticatedUser: { id: userId },
    });
    if (isLeft(scenario)) {
      return left(forbiddenError);
    }
    const userCanEditScenario = await this.scenarioAclService.canEditScenarioAndOwnsLock(
      userId,
      scenarioId,
    );
    if (isLeft(userCanEditScenario)) {
      return userCanEditScenario;
    }
    await this.blockGuard.ensureThatScenarioIsNotBlocked(scenario.right.id);
    const validatedMetadata = this.getPayloadWithValidatedMetadata(input);
    return right(await this.crudService.update(scenarioId, validatedMetadata));
  }

  async getFeatures(
    scenarioId: string,
    userId: string,
  ): Promise<
    Either<
      typeof forbiddenError | typeof scenarioNotFound,
      {
        data: (Partial<ScenarioFeaturesData> | undefined)[];
        metadata: PaginationMeta | undefined;
      }
    >
  > {
    if (await this.givenScenarioDoesNotExist(scenarioId))
      return left(scenarioNotFound);

    if (!(await this.scenarioAclService.canViewScenario(userId, scenarioId))) {
      return left(forbiddenError);
    }
    return right(
      await this.scenarioFeatures.findAllPaginated(undefined, {
        params: {
          scenarioId,
        },
      }),
    );
  }

  async getInputParameterFile(
    scenarioId: string,
    userId: string,
  ): Promise<Either<typeof forbiddenError | typeof scenarioNotFound, string>> {
    if (await this.givenScenarioDoesNotExist(scenarioId))
      return left(scenarioNotFound);

    if (!(await this.scenarioAclService.canViewScenario(userId, scenarioId))) {
      return left(forbiddenError);
    }
    return right(
      await this.inputFilesService.getInputParameterFile(scenarioId),
    );
  }

  async changeLockStatus(
    scenarioId: string,
    userId: string,
    input: UpdateScenarioPlanningUnitLockStatusDto,
  ): Promise<
    Either<
      | typeof forbiddenError
      | typeof noLockInPlace
      | typeof lockedByAnotherUser
      | typeof scenarioNotFound,
      void
    >
  > {
    if (await this.givenScenarioDoesNotExist(scenarioId))
      return left(scenarioNotFound);

    const userCanEditScenario = await this.scenarioAclService.canEditScenarioAndOwnsLock(
      userId,
      scenarioId,
    );
    if (isLeft(userCanEditScenario)) {
      return userCanEditScenario;
    }
    await this.updatePlanningUnits.update(scenarioId, {
      include: {
        geo: input.byGeoJson?.include,
        pu: input.byId?.include,
      },
      exclude: {
        pu: input.byId?.exclude,
        geo: input.byGeoJson?.exclude,
      },
    });
    return right(void 0);
  }

  async processCostSurfaceShapefile(
    scenarioId: string,
    userId: string,
    file: Express.Multer.File,
  ): Promise<
    Either<
      typeof forbiddenError | typeof noLockInPlace | typeof lockedByAnotherUser,
      void
    >
  > {
    const userCanEditScenario = await this.scenarioAclService.canEditScenarioAndOwnsLock(
      userId,
      scenarioId,
    );
    if (isLeft(userCanEditScenario)) {
      return userCanEditScenario;
    }

    await this.commandBus.execute(new UpdateCostSurface(scenarioId, file));
    return right(void 0);
  }

  async uploadLockInShapeFile(
    scenarioId: string,
    userId: string,
    file: Express.Multer.File,
  ): Promise<
    Either<
      | typeof forbiddenError
      | typeof noLockInPlace
      | typeof lockedByAnotherUser
      | typeof scenarioNotFound,
      GeoJsonDataDTO
    >
  > {
    if (await this.givenScenarioDoesNotExist(scenarioId))
      return left(scenarioNotFound);

    const userCanEditScenario = await this.scenarioAclService.canEditScenarioAndOwnsLock(
      userId,
      scenarioId,
    );
    if (isLeft(userCanEditScenario)) {
      return userCanEditScenario;
    }
    /**
     * @validateStatus is required for HttpService to not reject and wrap geoprocessing's response
     * in case a shapefile is not validated and a status 4xx is sent back.
     */
    const geoJson = await this.httpService
      .post(
        `${this.geoprocessingUrl}${apiGlobalPrefixes.v1}/planning-units/planning-unit-shapefile`,
        file,
        {
          headers: { 'Content-Type': 'application/json' },
          validateStatus: (status) => status <= 499,
        },
      )
      .toPromise()
      .then((response) => response.data.data as FeatureCollection)
      .then(
        (geoJson) =>
          ({
            data: {
              type: geoJson.type,
              features: geoJson.features.map((feature) => ({
                ...feature,
                // remove any shapefile attributes that may be still around at this
                // stage, as they are not needed.
                properties: {},
              })),
            },
          } as GeoJsonDataDTO),
      );
    return right(geoJson);
  }

  async getCostSurfaceCsv(
    scenarioId: string,
    userId: string,
    stream: stream.Writable,
  ): Promise<Either<typeof forbiddenError | typeof scenarioNotFound, void>> {
    if (await this.givenScenarioDoesNotExist(scenarioId))
      return left(scenarioNotFound);
    if (!(await this.scenarioAclService.canViewScenario(userId, scenarioId))) {
      return left(forbiddenError);
    }
    await this.inputFilesService.readCostSurface(scenarioId, stream);

    return right(void 0);
  }

  async getSpecDatCsv(
    scenarioId: string,
    userId: string,
  ): Promise<Either<typeof forbiddenError | typeof scenarioNotFound, string>> {
    if (await this.givenScenarioDoesNotExist(scenarioId))
      return left(scenarioNotFound);
    if (!(await this.scenarioAclService.canViewScenario(userId, scenarioId))) {
      return left(forbiddenError);
    }
    return right(await this.inputFilesService.getSpecDatContent(scenarioId));
  }

  async getBoundDatCsv(
    scenarioId: string,
    userId: string,
  ): Promise<Either<typeof forbiddenError | typeof scenarioNotFound, string>> {
    if (await this.givenScenarioDoesNotExist(scenarioId))
      return left(scenarioNotFound);
    if (!(await this.scenarioAclService.canViewScenario(userId, scenarioId))) {
      return left(forbiddenError);
    }
    return right(await this.inputFilesService.getBoundDatContent(scenarioId));
  }

  async run(
    scenarioId: string,
    userId: string,
    blm?: number,
  ): Promise<
    Either<
      | GetScenarioFailure
      | typeof forbiddenError
      | typeof noLockInPlace
      | typeof lockedByAnotherUser
      | typeof scenarioNotFound,
      void
    >
  > {
    const scenario = await this.getById(scenarioId, {
      authenticatedUser: { id: userId },
    });

    if (isLeft(scenario)) return scenario;

    const userCanEditScenario = await this.scenarioAclService.canEditScenarioAndOwnsLock(
      userId,
      scenarioId,
    );
    if (isLeft(userCanEditScenario)) {
      return userCanEditScenario;
    }
    await this.runService.run(
      pick(scenario.right, 'id', 'boundaryLengthModifier'),
      blm,
    );
    return right(void 0);
  }

  async getBlmRange(
    scenarioId: string,
    userId: string,
  ): Promise<
    Either<
      typeof scenarioNotFound | typeof forbiddenError | GetScenarioFailure,
      [number, number]
    >
  > {
    const userIsAllowed = await this.scenarioAclService.canViewScenario(
      userId,
      scenarioId,
    );
    if (!userIsAllowed) return left(forbiddenError);
    const blm = await this.blmValuesRepository.get(scenarioId);
    if (isLeft(blm)) return blm;

    return right(blm.right.range);
  }

  async startBlmCalibration(
    id: string,
    userInfo: AppInfoDTO,
    config: WebshotConfig,
    rangeToUpdate?: [number, number],
  ): Promise<
    Either<
      | typeof forbiddenError
      | typeof noLockInPlace
      | typeof lockedByAnotherUser
      | ChangeScenarioRangeErrors,
      true
    >
  > {
    const scenario = await this.getById(id, userInfo);
    assertDefined(userInfo.authenticatedUser);
    if (isLeft(scenario)) return left(forbiddenError);

    const userCanEditScenario = await this.scenarioAclService.canEditScenarioAndOwnsLock(
      userInfo.authenticatedUser.id,
      id,
    );
    if (isLeft(userCanEditScenario)) {
      return userCanEditScenario;
    }
    await this.blockGuard.ensureThatScenarioIsNotBlocked(scenario.right.id);

    if (rangeToUpdate) {
      const result = await this.commandBus.execute(
        new ChangeScenarioBlmRange(scenario.right.id, rangeToUpdate),
      );
      if (isLeft(result)) return result;
    }
    const scenarioBlmValues = await this.blmValuesRepository.get(
      scenario.right.id,
    );
    if (isLeft(scenarioBlmValues)) return scenarioBlmValues;

    await this.commandBus.execute(
      new StartBlmCalibration(id, scenarioBlmValues.right.values, config),
    );

    return right(true);
  }

  async getBlmCalibrationResults(
    scenarioId: string,
    userId: string,
  ): Promise<Either<typeof forbiddenError, CalibrationRunResult[]>> {
    if (!(await this.scenarioAclService.canViewScenario(userId, scenarioId))) {
      return left(forbiddenError);
    }
    return right(
      await this.scenarioCalibrationRepository.getScenarioCalibrationResults(
        scenarioId,
      ),
    );
  }

  async cancelBlmCalibration(
    scenarioId: string,
    userId: string,
  ): Promise<
    Either<
      | typeof forbiddenError
      | typeof noLockInPlace
      | typeof lockedByAnotherUser
      | typeof scenarioNotFound,
      void
    >
  > {
    if (await this.givenScenarioDoesNotExist(scenarioId))
      return left(scenarioNotFound);

    const userCanEditScenario = await this.scenarioAclService.canEditScenarioAndOwnsLock(
      userId,
      scenarioId,
    );
    if (isLeft(userCanEditScenario)) {
      return userCanEditScenario;
    }
    await this.commandBus.execute(new CancelBlmCalibration(scenarioId));
    return right(void 0);
  }

  async cancelMarxanRun(
    scenarioId: string,
    userId: string,
  ): Promise<
    Either<
      | typeof forbiddenError
      | typeof noLockInPlace
      | typeof lockedByAnotherUser
      | typeof scenarioNotFound,
      void
    >
  > {
    if (await this.givenScenarioDoesNotExist(scenarioId))
      return left(scenarioNotFound);

    const userCanEditScenario = await this.scenarioAclService.canEditScenarioAndOwnsLock(
      userId,
      scenarioId,
    );
    if (isLeft(userCanEditScenario)) {
      return userCanEditScenario;
    }
    const result = await this.runService.cancel(scenarioId);
    if (isLeft(result)) {
      switch (result.left) {
        case notFound:
          throw new NotFoundException();
        default:
          const _check: never = result.left;
          throw new InternalServerErrorException();
      }
    }
    return right(void 0);
  }

  async requestExport(
    scenarioId: string,
    userId: string,
  ): Promise<Either<typeof forbiddenError | GetScenarioFailure, string>> {
    const scenario = await this.getById(scenarioId, {
      authenticatedUser: { id: userId },
    });
    if (isLeft(scenario)) return scenario;
    await this.blockGuard.ensureThatScenarioIsNotBlocked(scenarioId);
    const userCanCloneScenario = await this.scenarioAclService.canCloneScenario(
      userId,
      scenario.right.projectId,
    );

    if (!userCanCloneScenario) {
      return left(forbiddenError);
    }

    const result = await this.commandBus.execute(
      new ExportScenario(
        new ResourceId(scenario.right.projectId),
        new ResourceId(scenarioId),
      ),
    );

    return right(result.value);
  }

  async getOneSolution(
    scenarioId: string,
    runId: string,
    userId: string,
    _fetchSpecification: FetchSpecification,
  ): Promise<
    Either<
      typeof scenarioNotFound | typeof forbiddenError,
      ScenariosOutputResultsApiEntity
    >
  > {
    if (await this.givenScenarioDoesNotExist(scenarioId))
      return left(scenarioNotFound);

    // TODO runId is part of scenarioId
    if (!(await this.scenarioAclService.canViewScenario(userId, scenarioId))) {
      return left(forbiddenError);
    }
    return right(await this.solutionsCrudService.getById(runId));
  }

  async getBestSolution(
    scenarioId: string,
    userId: string,
    fetchSpecification: FetchSpecification,
  ): Promise<
    Either<GetBestSolutionError, Partial<ScenariosOutputResultsApiEntity>>
  > {
    if (await this.givenScenarioDoesNotExist(scenarioId))
      return left(scenarioNotFound);

    if (!(await this.scenarioAclService.canViewScenario(userId, scenarioId))) {
      return left(forbiddenError);
    }
    const [solutions] = await this.solutionsCrudService.findAll({
      ...fetchSpecification,
      filter: { ...fetchSpecification.filter, best: true, scenarioId },
    });
    if (!solutions.length) return left(bestSolutionNotFound);

    return right(solutions[0]);
  }

  async getMostDifferentSolutions(
    scenarioId: string,
    userId: string,
    fetchSpecification: FetchSpecification,
  ): Promise<
    Either<
      typeof forbiddenError | typeof scenarioNotFound,
      [Partial<ScenariosOutputResultsApiEntity>[], number]
    >
  > {
    if (await this.givenScenarioDoesNotExist(scenarioId))
      return left(scenarioNotFound);

    if (!(await this.scenarioAclService.canViewScenario(userId, scenarioId))) {
      return left(forbiddenError);
    }
    return right(
      await this.solutionsCrudService.findAll({
        ...fetchSpecification,
        filter: {
          ...fetchSpecification.filter,
          distinctFive: true,
          scenarioId,
        },
      }),
    );
  }

  async findAllSolutionsPaginated(
    scenarioId: string,
    userId: string,
    fetchSpecification: FetchSpecification,
  ): Promise<
    Either<
      typeof forbiddenError | typeof scenarioNotFound,
      {
        data: (Partial<ScenariosOutputResultsApiEntity> | undefined)[];
        metadata: PaginationMeta | undefined;
      }
    >
  > {
    if (await this.givenScenarioDoesNotExist(scenarioId))
      return left(scenarioNotFound);

    if (!(await this.scenarioAclService.canViewScenario(userId, scenarioId))) {
      return left(forbiddenError);
    }
    return right(
      await this.solutionsCrudService.findAllPaginated({
        ...fetchSpecification,
        filter: { ...fetchSpecification.filter, scenarioId },
      }),
    );
  }

  /**
   * Throws
   * @param input
   * @private
   */
  private getPayloadWithValidatedMetadata<
    T extends CreateScenarioDTO | UpdateScenarioDTO
  >(input: T): T {
    let marxanInput: MarxanParameters | undefined;
    if (input.metadata?.marxanInputParameterFile) {
      try {
        marxanInput = this.marxanInputValidator.from(
          input.metadata.marxanInputParameterFile,
        );
      } catch (errors) {
        // TODO debt: shouldn't throw HttpException
        throw new BadRequestException(errors);
      }
    } else {
      marxanInput = this.marxanInputValidator.from({});
    }
    const withValidatedMetadata: T = classToClass<T>(input);
    (withValidatedMetadata.metadata ??= {}).marxanInputParameterFile = marxanInput;
    return withValidatedMetadata;
  }

  private async givenScenarioExists(scenarioId: string): Promise<boolean> {
    try {
      await this.crudService.getById(scenarioId);
      return true;
    } catch (e) {
      return false;
    }
  }

  private async givenScenarioDoesNotExist(
    scenarioId: string,
  ): Promise<boolean> {
    return !(await this.givenScenarioExists(scenarioId));
  }

  /**
   * Get geofeatures specification for a scenario. This is part of the scenario
   * itself, but exposed via a separate endpoint.
   */
  async getFeatureSetForScenario(
    scenarioId: string,
    userInfo: AppInfoDTO,
  ): Promise<
    | GeoFeatureSetSpecification
    | typeof forbiddenError
    | typeof scenarioNotFound
    | undefined
  > {
    const scenarioResult = await this.getById(scenarioId, userInfo);
    if (isLeft(scenarioResult)) return scenarioNotFound;

    return await this.crudService
      .getById(scenarioId)
      .then((result) => {
        return result.featureSet;
      })
      .then((result) =>
        result
          ? this.geoFeaturePropertySetService.extendGeoFeatureProcessingSpecification(
              result,
              scenarioResult.right,
            )
          : EmptyGeoFeaturesSpecification,
      )
      .catch((e) => Logger.error(e));
  }

  async getMarxanExecutionOutputArchive(
    scenarioId: string,
    userId: string,
  ): Promise<
    Either<
      typeof forbiddenError | typeof scenarioNotFound | OutputZipFailure,
      Buffer
    >
  > {
    if (await this.givenScenarioDoesNotExist(scenarioId))
      return left(scenarioNotFound);

    if (!(await this.scenarioAclService.canViewScenario(userId, scenarioId))) {
      return left(forbiddenError);
    }
    return await this.outputFilesService.get(scenarioId);
  }

  async getPuvsprDatCsv(
    scenarioId: string,
    userId: string,
  ): Promise<Either<typeof forbiddenError | typeof scenarioNotFound, string>> {
    if (await this.givenScenarioDoesNotExist(scenarioId))
      return left(scenarioNotFound);
    if (!(await this.scenarioAclService.canViewScenario(userId, scenarioId))) {
      return left(forbiddenError);
    }
    return right(await this.inputFilesService.getPuvsprDatContent(scenarioId));
  }

  async getMarxanExecutionInputArchive(
    scenarioId: string,
    userId: string,
  ): Promise<
    Either<
      typeof forbiddenError | typeof scenarioNotFound | InputZipFailure,
      Buffer
    >
  > {
    if (await this.givenScenarioDoesNotExist(scenarioId))
      return left(scenarioNotFound);
    if (!(await this.scenarioAclService.canViewScenario(userId, scenarioId))) {
      return left(forbiddenError);
    }
    return await this.inputArchiveService.archive(scenarioId);
  }

  async getPlanningUnits(
    scenarioId: string,
    userId: string,
  ): Promise<
    Either<
      typeof forbiddenError | typeof scenarioNotFound,
      ScenariosPlanningUnitGeoEntity[]
    >
  > {
    if (await this.givenScenarioDoesNotExist(scenarioId))
      return left(scenarioNotFound);

    if (!(await this.scenarioAclService.canViewScenario(userId, scenarioId))) {
      return left(forbiddenError);
    }

    return right(await this.planningUnitsService.get(scenarioId));
  }

  async createSpecification(
    scenarioId: string,
    userId: string,
    dto: CreateGeoFeatureSetDTO,
  ): Promise<
    Either<
      | GetScenarioFailure
      | typeof forbiddenError
      | typeof internalError
      | typeof lockedByAnotherUser
      | typeof scenarioNotFound
      | typeof noLockInPlace,
      any
    >
  > {
    const scenarioResult = await this.getById(scenarioId, {
      authenticatedUser: { id: userId },
    });
    if (isLeft(scenarioResult)) return scenarioResult;

    const userCanEditScenario = await this.scenarioAclService.canEditScenarioAndOwnsLock(
      userId,
      scenarioId,
    );
    if (isLeft(userCanEditScenario)) {
      return userCanEditScenario;
    }

    return await this.specificationService.submit(
      scenarioId,
      scenarioResult.right.projectId,
      dto,
    );
  }

  async getLastUpdatedSpecification(
    scenarioId: string,
    userId: string,
  ): Promise<
    Either<
      | GetScenarioFailure
      | LastUpdatedSpecificationError
      | typeof forbiddenError
      | typeof scenarioNotFound,
      CreateGeoFeatureSetDTO
    >
  > {
    const scenarioResult = await this.getById(scenarioId, {
      authenticatedUser: { id: userId },
    });
    if (isLeft(scenarioResult)) return scenarioResult;
    if (!(await this.scenarioAclService.canViewScenario(userId, scenarioId))) {
      return left(forbiddenError);
    }

    return await this.specificationService.getLastUpdatedFor(
      scenarioId,
      scenarioResult.right.projectId,
    );
  }

  async getCostRange(
    scenarioId: string,
    userId: string,
  ): Promise<Either<typeof forbiddenError, CostRange>> {
    if (!(await this.scenarioAclService.canViewScenario(userId, scenarioId))) {
      return left(forbiddenError);
    }
    return right(await this.costService.getRange(scenarioId));
  }

  async resetLockStatus(
    scenarioId: string,
    userId: string,
  ): Promise<
    Either<
      | typeof forbiddenError
      | typeof lockedByAnotherUser
      | typeof noLockInPlace
      | typeof scenarioNotFound,
      void
    >
  > {
    if (await this.givenScenarioDoesNotExist(scenarioId))
      return left(scenarioNotFound);

    const userCanEditScenario = await this.scenarioAclService.canEditScenarioAndOwnsLock(
      userId,
      scenarioId,
    );
    if (isLeft(userCanEditScenario)) {
      return userCanEditScenario;
    }
    await this.planningUnitsService.resetLockStatus(scenarioId);
    return right(void 0);
  }

  async addProtectedAreaFor(
    scenarioId: string,
    file: Express.Multer.File,
    info: AppInfoDTO,
    dto: UploadShapefileDto,
  ): Promise<
    Either<
      | GetScenarioFailure
      | SubmitProtectedAreaError
      | typeof forbiddenError
      | typeof noLockInPlace
      | typeof lockedByAnotherUser,
      true
    >
  > {
    const scenario = await this.getById(scenarioId, info);
    if (isLeft(scenario)) return scenario;

    assertDefined(info.authenticatedUser);
    const userCanEditScenario = await this.scenarioAclService.canEditScenarioAndOwnsLock(
      info.authenticatedUser.id,
      scenarioId,
    );
    if (isLeft(userCanEditScenario)) {
      return userCanEditScenario;
    }
    const projectResponse = await this.queryBus.execute(
      new GetProjectQuery(scenario.right.projectId, info.authenticatedUser?.id),
    );
    if (isLeft(projectResponse)) {
      return projectResponse;
    }

    const submission = await this.protectedArea.addShapeFor(
      projectResponse.right.id,
      scenarioId,
      file,
      dto.name,
    );

    if (isLeft(submission)) {
      return submission;
    }

    return right(true);
  }

  async getProtectedAreasFor(
    scenarioId: string,
    info: AppInfoDTO,
  ): Promise<
    Either<
      GetScenarioFailure | GetProtectedAreasError | typeof forbiddenError,
      ScenarioProtectedArea[]
    >
  > {
    const scenario = await this.getById(scenarioId, info);
    if (isLeft(scenario)) return scenario;
    assertDefined(info.authenticatedUser);
    if (
      !(await this.scenarioAclService.canViewScenario(
        info.authenticatedUser?.id,
        scenarioId,
      ))
    ) {
      return left(forbiddenError);
    }
    const projectResponse = await this.queryBus.execute(
      new GetProjectQuery(scenario.right.projectId, info.authenticatedUser?.id),
    );
    if (isLeft(projectResponse)) {
      return projectResponse;
    }

    const areas = await this.protectedArea.getFor(
      {
        id: scenarioId,
        protectedAreaIds: scenario.right.protectedAreaFilterByIds ?? [],
      },
      projectResponse.right,
    );

    return right(areas);
  }

  async updateProtectedAreasFor(
    scenarioId: string,
    dto: ProtectedAreasChangeDto,
    info: AppInfoDTO,
  ): Promise<
    Either<
      | GetScenarioFailure
      | UpdateProtectedAreasError
      | typeof forbiddenError
      | typeof noLockInPlace
      | typeof lockedByAnotherUser,
      true
    >
  > {
    const scenarioResult = await this.getById(scenarioId, info);
    if (isLeft(scenarioResult)) return scenarioResult;

    assertDefined(info.authenticatedUser);
    const userCanEditScenario = await this.scenarioAclService.canEditScenarioAndOwnsLock(
      info.authenticatedUser?.id,
      scenarioId,
    );
    if (isLeft(userCanEditScenario)) {
      return userCanEditScenario;
    }
    const projectResponse = await this.queryBus.execute(
      new GetProjectQuery(
        scenarioResult.right.projectId,
        info.authenticatedUser?.id,
      ),
    );

    if (isLeft(projectResponse)) {
      return projectResponse;
    }

    const result = await this.protectedArea.selectFor(
      {
        id: scenarioId,
        protectedAreaIds: scenarioResult.right.protectedAreaFilterByIds ?? [],
        threshold: dto.threshold,
      },
      projectResponse.right,
      dto.areas,
    );
    if (isLeft(result)) {
      return result;
    }
    return right(true);
  }

  async releaseLock(
    scenarioId: string,
    userId: string,
  ): Promise<
    Either<
      | typeof forbiddenError
      | GetScenarioFailure
      | typeof lockedByAnotherUser
      | typeof noLockInPlace,
      void
    >
  > {
    const scenario = await this.getById(scenarioId, {
      authenticatedUser: { id: userId },
    });
    if (isLeft(scenario)) {
      return scenario;
    }
    const projectId = scenario.right.projectId;
    return await this.scenarioAclService.releaseLock(
      userId,
      scenarioId,
      projectId,
    );
  }

  async findLock(
    scenarioId: string,
    userId: string,
  ): Promise<
    Either<
      typeof forbiddenError | GetScenarioFailure,
      ScenarioLockResultSingular
    >
  > {
    return await this.scenarioAclService.findLock(userId, scenarioId);
  }

  async getSummaryReportFor(
    scenarioId: string,
    userId: string,
    configForWebshot: WebshotPdfConfig,
  ): Promise<
    Either<
      | typeof forbiddenError
      | GetScenarioFailure
      | typeof unknownPdfWebshotError,
      stream.Readable
    >
  > {
    const scenario = await this.getById(scenarioId, {
      authenticatedUser: { id: userId },
    });

    if (isLeft(scenario)) {
      return scenario;
    }
    const webshotUrl = AppConfig.get('webshot.url') as string;

    /** @debt Refactor to use @nestjs/common's StreamableFile
     (https://docs.nestjs.com/techniques/streaming-files#streamable-file-class)
     after upgrading NestJS to v8. **/
    const pdfStream = await this.webshotService.getSummaryReportForScenario(
      scenarioId,
      scenario.right.projectId,
      configForWebshot,
      webshotUrl,
    );

    return pdfStream;
  }

  async getImageFromBlmValues(
    scenarioId: string,
    userId: string,
    _blmValue: number,
  ): Promise<Either<typeof forbiddenError | GetScenarioFailure, Buffer>> {
    const scenario = await this.getById(scenarioId, {
      authenticatedUser: { id: userId },
    });

    if (isLeft(scenario)) {
      return scenario;
    }

    if (
      !(await this.scenarioAclService.canViewBlmResults(
        userId,
        scenario.right.projectId,
      ))
    ) {
      return left(forbiddenError);
    }

    // It will return a dummy PNG while the webshot-specific endpoint to
    // generate the image is still a WIP. This should be substituted for
    // getting the PNG binary data from the blm_final_results table once
    // PNG is stored there and/or 404 error if the PNG cannot be found.
    // blmFinalResultsRepo.findOne({ where: { blmValue, scenarioId }}).image

    return right(Buffer.from(blmImageMock, 'base64'));
  }
}
