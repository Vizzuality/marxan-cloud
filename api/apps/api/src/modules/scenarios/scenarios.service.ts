import { BadRequestException, HttpService, Injectable } from '@nestjs/common';
import { FetchSpecification } from 'nestjs-base-service';
import { classToClass } from 'class-transformer';
import * as stream from 'stream';

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
import { CostSurfaceViewService } from './cost-surface-readmodel/cost-surface-view.service';
import { InputParameterFileProvider } from './input-parameter-file.provider';
import { SpecDatService } from './input-files/spec.dat.service';

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
    private readonly costSurfaceView: CostSurfaceViewService,
    private readonly marxanInputValidator: MarxanInput,
    private readonly inputParameterFileProvider: InputParameterFileProvider,
    private readonly specDatService: SpecDatService,
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
    return this.crudService.create(validatedMetadata, info);
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
    return this.inputParameterFileProvider.getInputParameterFile(scenarioId);
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
    runId: string,
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
    await this.costSurfaceView.read(scenarioId, stream);
  }

  async getSpecDatCsv(scenarioId: string): Promise<string> {
    await this.assertScenario(scenarioId);
    return this.specDatService.getSpecDatContent(scenarioId);
  }

  private async assertScenario(scenarioId: string) {
    await this.crudService.getById(scenarioId);
  }

  async getBestSolution(scenarioId: string, runId: string) {
    await this.assertScenario(scenarioId);
    // TODO correct implementation
    return this.solutionsCrudService.getById(runId);
  }

  async getMostDifferentSolutions(
    scenarioId: string,
    runId: string,
    fetchSpecification: FetchSpecification,
  ) {
    await this.assertScenario(scenarioId);
    // TODO correct implementation
    return this.solutionsCrudService.findAllPaginated(fetchSpecification);
  }

  async findAllSolutionsPaginated(
    scenarioId: string,
    runId: string,
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
}
