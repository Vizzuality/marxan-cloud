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

import { CostSurfaceFacade } from './cost-surface/cost-surface.facade';
import {
  ScenarioInfoDTO,
  ScenariosCrudService,
} from './scenarios-crud.service';

import { CreateScenarioDTO } from './dto/create.scenario.dto';
import { UpdateScenarioDTO } from './dto/update.scenario.dto';
import { UpdateScenarioPlanningUnitLockStatusDto } from './dto/update-scenario-planning-unit-lock-status.dto';
import { SolutionResultCrudService } from './solutions-result/solution-result-crud.service';
import { OutputFilesService } from './output-files/output-files.service';
import { InputFilesArchiverService, InputFilesService } from './input-files';
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
  ChangeBlmRange,
  ChangeRangeErrors,
} from '@marxan-api/modules/projects/blm';
import { GetFailure, ProjectBlmRepo } from '@marxan-api/modules/blm';
import {
  CalibrationRunResult,
  ScenarioCalibrationRepo,
} from '../blm/values/scenario-calibration-repo';
import { StartBlmCalibration } from './blm-calibration/start-blm-calibration.command';
import {
  DoesntExist,
  ProjectChecker,
} from '@marxan-api/modules/scenarios/project-checker.service';

/** @debt move to own module */
const EmptyGeoFeaturesSpecification: GeoFeatureSetSpecification = {
  status: SimpleJobStatus.draft,
  features: [],
};

export const projectNotReady = Symbol('project not ready');
export type ProjectNotReady = typeof projectNotReady;

export const projectDoesntExist = Symbol(`project doesn't exist`);
export type ProjectDoesntExist = typeof projectDoesntExist;

export const scenarioNotFound = Symbol(`scenario not found`);

export type SubmitProtectedAreaError =
  | GetProjectErrors
  | typeof submissionFailed
  | typeof scenarioNotFound;

export type GetProtectedAreasError = GetProjectErrors | typeof scenarioNotFound;

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
    private readonly costSurface: CostSurfaceFacade,
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
    private readonly projectChecker: ProjectChecker,
    private readonly protectedArea: ProtectedAreaService,
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly blmValuesRepository: ProjectBlmRepo,
    private readonly scenarioCalibrationRepository: ScenarioCalibrationRepo,
  ) {}

  async findAllPaginated(
    fetchSpecification: FetchSpecification,
    appInfo?: ScenarioInfoDTO,
  ) {
    return this.crudService.findAllPaginated(fetchSpecification, appInfo);
  }

  async getById(scenarioId: string, fetchSpecification?: FetchSpecification) {
    return this.crudService.getById(scenarioId, fetchSpecification);
  }

  async remove(scenarioId: string): Promise<void> {
    await this.assertScenario(scenarioId);
    return this.crudService.remove(scenarioId);
  }

  async create(
    input: CreateScenarioDTO,
    info: AppInfoDTO,
  ): Promise<Either<ProjectNotReady | ProjectDoesntExist, Scenario>> {
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
    await this.planningUnitsLinkerService.link(scenario);

    return right(scenario);
  }

  async update(scenarioId: string, input: UpdateScenarioDTO) {
    await this.canEditGuard(scenarioId);
    await this.assertScenario(scenarioId);
    const validatedMetadata = this.getPayloadWithValidatedMetadata(input);

    return await this.crudService.update(scenarioId, validatedMetadata);
  }

  async getFeatures(scenarioId: string) {
    await this.assertScenario(scenarioId);
    return await this.scenarioFeatures.findAllPaginated(undefined, {
      params: {
        scenarioId,
      },
    });
  }

  async getInputParameterFile(scenarioId: string): Promise<string> {
    await this.assertScenario(scenarioId);
    return this.inputFilesService.getInputParameterFile(scenarioId);
  }

  async changeLockStatus(
    scenarioId: string,
    input: UpdateScenarioPlanningUnitLockStatusDto,
  ) {
    await this.assertScenario(scenarioId);
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
    return;
  }

  processCostSurfaceShapefile(scenarioId: string, file: Express.Multer.File) {
    this.costSurface.convert(scenarioId, file);
    return;
  }

  async uploadLockInShapeFile(scenarioId: string, file: Express.Multer.File) {
    await this.assertScenario(scenarioId);
    /**
     * @validateStatus is required for HttpService to not reject and wrap geoprocessing's response
     * in case a shapefile is not validated and a status 4xx is sent back.
     */
    const { data: geoJson } = await this.httpService
      .post(
        `${this.geoprocessingUrl}${apiGlobalPrefixes.v1}/planning-units/planning-unit-shapefile`,
        file,
        {
          headers: { 'Content-Type': 'application/json' },
          validateStatus: (status) => status <= 499,
        },
      )
      .toPromise();
    return geoJson;
  }

  async findScenarioResults(
    scenarioId: string,
    fetchSpecification: FetchSpecification,
  ) {
    await this.assertScenario(scenarioId);
    return this.solutionsCrudService.findAll(fetchSpecification);
  }

  async getCostSurfaceCsv(
    scenarioId: string,
    stream: stream.Writable,
  ): Promise<void> {
    await this.assertScenario(scenarioId);
    await this.inputFilesService.readCostSurface(scenarioId, stream);
  }

  async getSpecDatCsv(scenarioId: string): Promise<string> {
    await this.assertScenario(scenarioId);
    return this.inputFilesService.getSpecDatContent(scenarioId);
  }

  async getBoundDatCsv(scenarioId: string): Promise<string> {
    await this.assertScenario(scenarioId);
    return this.inputFilesService.getBoundDatContent(scenarioId);
  }

  async run(scenarioId: string, blm?: number): Promise<void> {
    const scenario = await this.assertScenario(scenarioId);
    await this.runService.run(
      pick(scenario, 'id', 'boundaryLengthModifier'),
      blm,
    );
  }

  async startBlmCalibration(
    id: string,
    rangeToUpdate?: [number, number],
  ): Promise<Either<ChangeRangeErrors | GetFailure, true>> {
    const scenario = await this.getById(id);
    const projectId = scenario.projectId;
    if (rangeToUpdate) {
      const result = await this.commandBus.execute(
        new ChangeBlmRange(projectId, rangeToUpdate),
      );
      if (isLeft(result)) return result;
    }
    const projectBlmValues = await this.blmValuesRepository.get(projectId);
    if (isLeft(projectBlmValues)) return projectBlmValues;

    await this.commandBus.execute(
      new StartBlmCalibration(id, projectBlmValues.right.values),
    );

    return right(true);
  }

  async getBlmCalibrationResults(
    scenarioId: string,
  ): Promise<CalibrationRunResult[]> {
    return this.scenarioCalibrationRepository.getScenarioCalibrationResults(
      scenarioId,
    );
  }

  async cancel(scenarioId: string): Promise<void> {
    await this.assertScenario(scenarioId);
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
  }

  private async assertScenario(scenarioId: string) {
    return await this.crudService.getById(scenarioId);
  }

  async getOneSolution(
    scenarioId: string,
    runId: string,
    _fetchSpecification: FetchSpecification,
  ) {
    await this.assertScenario(scenarioId);
    // TODO permissions guard
    // TODO runId is part of scenarioId
    return this.solutionsCrudService.getById(runId);
  }

  async getBestSolution(
    scenarioId: string,
    fetchSpecification: FetchSpecification,
  ) {
    await this.assertScenario(scenarioId);
    // TODO permissions guard
    return await this.solutionsCrudService
      .findAll({
        ...fetchSpecification,
        filter: { ...fetchSpecification.filter, best: true, scenarioId },
      })
      .then((results) => results[0]);
  }

  async getMostDifferentSolutions(
    scenarioId: string,
    fetchSpecification: FetchSpecification,
  ) {
    await this.assertScenario(scenarioId);
    // TODO permissions guard
    return this.solutionsCrudService.findAll({
      ...fetchSpecification,
      filter: { ...fetchSpecification.filter, distinctFive: true, scenarioId },
    });
  }

  async findAllSolutionsPaginated(
    scenarioId: string,
    fetchSpecification: FetchSpecification,
  ) {
    await this.assertScenario(scenarioId);
    return this.solutionsCrudService.findAllPaginated({
      ...fetchSpecification,
      filter: { ...fetchSpecification.filter, scenarioId },
    });
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

  /**
   * Get geofeatures specification for a scenario. This is part of the scenario
   * itself, but exposed via a separate endpoint.
   */
  async getFeatureSetForScenario(
    scenarioId: string,
  ): Promise<GeoFeatureSetSpecification | undefined> {
    const scenario = await this.getById(scenarioId);
    assertDefined(scenario);
    return await this.crudService
      .getById(scenarioId)
      .then((result) => {
        return result.featureSet;
      })
      .then((result) =>
        result
          ? this.geoFeaturePropertySetService.extendGeoFeatureProcessingSpecification(
              result,
              scenario,
            )
          : EmptyGeoFeaturesSpecification,
      )
      .catch((e) => Logger.error(e));
  }

  async getMarxanExecutionOutputArchive(scenarioId: string) {
    await this.assertScenario(scenarioId);
    return this.outputFilesService.get(scenarioId);
  }

  async getPuvsprDatCsv(scenarioId: string) {
    await this.assertScenario(scenarioId);
    return this.inputFilesService.getPuvsprDatContent(scenarioId);
  }

  async getMarxanExecutionInputArchive(scenarioId: string) {
    await this.assertScenario(scenarioId);
    return this.inputArchiveService.archive(scenarioId);
  }

  async getPlanningUnits(scenarioId: string) {
    await this.assertScenario(scenarioId);
    return this.planningUnitsService.get(scenarioId);
  }

  async createSpecification(scenarioId: string, dto: CreateGeoFeatureSetDTO) {
    const scenario = await this.assertScenario(scenarioId);
    return await this.specificationService.submit(
      scenarioId,
      scenario.projectId,
      dto,
    );
  }

  async getLastUpdatedSpecification(scenarioId: string) {
    const scenario = await this.assertScenario(scenarioId);
    return await this.specificationService.getLastUpdatedFor(
      scenarioId,
      scenario.projectId,
    );
  }

  getCostRange(scenarioId: string): Promise<CostRange> {
    return this.costService.getRange(scenarioId);
  }

  async resetLockStatus(scenarioId: string) {
    await this.assertScenario(scenarioId);
    await this.planningUnitsService.resetLockStatus(scenarioId);
  }

  async addProtectedAreaFor(
    scenarioId: string,
    file: Express.Multer.File,
    info: AppInfoDTO,
    dto: UploadShapefileDto,
  ): Promise<Either<SubmitProtectedAreaError, true>> {
    try {
      const scenario = await this.assertScenario(scenarioId);
      const projectResponse = await this.queryBus.execute(
        new GetProjectQuery(scenario.projectId, info.authenticatedUser?.id),
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
    } catch {
      return left(scenarioNotFound);
    }
  }

  async getProtectedAreasFor(
    scenarioId: string,
    info: AppInfoDTO,
  ): Promise<Either<GetProtectedAreasError, ScenarioProtectedArea[]>> {
    try {
      const scenario = await this.assertScenario(scenarioId);
      const projectResponse = await this.queryBus.execute(
        new GetProjectQuery(scenario.projectId, info.authenticatedUser?.id),
      );
      if (isLeft(projectResponse)) {
        return projectResponse;
      }

      const areas = await this.protectedArea.getFor(
        {
          id: scenarioId,
          protectedAreaIds: scenario.protectedAreaFilterByIds ?? [],
        },
        projectResponse.right,
      );

      return right(areas);
    } catch {
      return left(scenarioNotFound);
    }
  }

  async updateProtectedAreasFor(
    scenarioId: string,
    dto: ProtectedAreasChangeDto,
    info: AppInfoDTO,
  ): Promise<Either<UpdateProtectedAreasError, true>> {
    const scenario = await this.assertScenario(scenarioId);
    const projectResponse = await this.queryBus.execute(
      new GetProjectQuery(scenario.projectId, info.authenticatedUser?.id),
    );

    if (isLeft(projectResponse)) {
      return projectResponse;
    }

    const result = await this.protectedArea.selectFor(
      {
        id: scenarioId,
        protectedAreaIds: scenario.protectedAreaFilterByIds ?? [],
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

  private async canEditGuard(scenarioId: string) {
    const scenario = await this.crudService.getById(scenarioId);
    // TODO: Check where do we should use the guard
    const editIsBlocked = await this.projectChecker.hasProjectPendingExports(
      scenario.projectId,
    );

    if (isLeft(editIsBlocked))
      throw new BadRequestException(
        `Scenario ${scenarioId} editing is blocked because of pending export`,
      );
  }
}
