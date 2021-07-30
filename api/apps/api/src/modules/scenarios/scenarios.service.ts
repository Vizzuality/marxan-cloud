import {
  BadRequestException,
  HttpService,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { FetchSpecification } from 'nestjs-base-service';
import { classToClass } from 'class-transformer';
import * as stream from 'stream';
import { isLeft } from 'fp-ts/Either';
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
import { InputFilesService, InputFilesArchiverService } from './input-files';
import { notFound, RunService } from './marxan-run';
import { GeoFeatureSetSpecification } from '../geo-features/dto/geo-feature-set-specification.dto';
import { SimpleJobStatus } from './scenario.api.entity';
import { assertDefined } from '@marxan/utils';
import { GeoFeaturePropertySetService } from '../geo-features/geo-feature-property-sets.service';
import { ScenarioPlanningUnitsService } from './planning-units/scenario-planning-units.service';
import { ScenarioPlanningUnitsLinkerService } from './planning-units/scenario-planning-units-linker-service';

/** @debt move to own module */
const EmptyGeoFeaturesSpecification: GeoFeatureSetSpecification = {
  status: SimpleJobStatus.draft,
  features: [],
};

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

  async create(input: CreateScenarioDTO, info: AppInfoDTO) {
    const validatedMetadata = this.getPayloadWithValidatedMetadata(input);
    const scenario = await this.crudService.create(validatedMetadata, info);
    await this.planningUnitsLinkerService.link(scenario);
    return scenario;
  }

  async update(scenarioId: string, input: UpdateScenarioDTO) {
    await this.assertScenario(scenarioId);
    const validatedMetadata = this.getPayloadWithValidatedMetadata(input);
    return this.crudService.update(scenarioId, validatedMetadata);
  }

  async getFeatures(scenarioId: string) {
    await this.assertScenario(scenarioId);
    return (
      await this.scenarioFeatures.findAll(undefined, {
        params: {
          scenarioId,
        },
      })
    )[0];
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
    fetchSpecification: FetchSpecification,
  ) {
    await this.assertScenario(scenarioId);
    // TODO correct implementation
    return this.solutionsCrudService.getById(runId);
  }

  async getBestSolution(
    scenarioId: string,
    fetchSpecification: FetchSpecification,
  ) {
    await this.assertScenario(scenarioId);
    // TODO correct implementation
    fetchSpecification.filter = { ...fetchSpecification.filter, best: true };
    return this.solutionsCrudService.findAllPaginated(fetchSpecification);
  }

  async getMostDifferentSolutions(
    scenarioId: string,
    fetchSpecification: FetchSpecification,
  ) {
    await this.assertScenario(scenarioId);
    // TODO correct implementation
    fetchSpecification.filter = {
      ...fetchSpecification.filter,
      distinctFive: true,
    };
    // TODO remove the following two lines once implementation is in place.
    // The artificial limiting of response elements is only to serve (up to) the
    // expected number of elements to frontend in the meanwhile.
    fetchSpecification.pageSize = 5;
    fetchSpecification.pageNumber = 1;
    return this.solutionsCrudService.findAllPaginated(fetchSpecification);
  }

  async findAllSolutionsPaginated(
    scenarioId: string,
    fetchSpecification: FetchSpecification,
  ) {
    await this.assertScenario(scenarioId);
    // TODO correct implementation
    return this.solutionsCrudService.findAllPaginated(fetchSpecification);
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
}
