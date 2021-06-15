import { BadRequestException, HttpService, Injectable } from '@nestjs/common';
import { FetchSpecification } from 'nestjs-base-service';
import { classToClass } from 'class-transformer';

import { MarxanInput, MarxanParameters } from '@marxan/marxan-input';
import { AppInfoDTO } from '@marxan-api/dto/info.dto';
import { AppConfig } from '@marxan-api/utils/config.utils';
import { ScenarioFeaturesService } from '@marxan-api/modules/scenarios-features';
import { AdjustPlanningUnits } from '@marxan-api/modules/analysis/entry-points/adjust-planning-units';
import { apiGlobalPrefixes } from '@marxan-api/api.config';

import { CostSurfaceFacade } from './cost-surface/cost-surface.facade';
import { ScenariosCrudService } from './scenarios-crud.service';

import { CreateScenarioDTO } from './dto/create.scenario.dto';
import { UpdateScenarioDTO } from './dto/update.scenario.dto';
import { UpdateScenarioPlanningUnitLockStatusDto } from './dto/update-scenario-planning-unit-lock-status.dto';

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
    private readonly marxanInputValidator: MarxanInput,
  ) {}

  async findAllPaginated(fetchSpecification: FetchSpecification) {
    return this.crudService.findAllPaginated(fetchSpecification);
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

  private async assertScenario(scenarioId: string) {
    await this.crudService.getById(scenarioId);
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
    }
    const withValidatedMetadata: T = classToClass<T>(input);
    if (withValidatedMetadata.metadata) {
      withValidatedMetadata.metadata.marxanInputParameterFile = marxanInput;
    }
    return withValidatedMetadata;
  }
}
