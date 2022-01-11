import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  Header,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { scenarioResource, ScenarioResult } from './scenario.api.entity';
import { Request, Response } from 'express';
import {
  FetchSpecification,
  ProcessFetchSpecification,
} from 'nestjs-base-service';
import { GeoFeatureSetResult } from '@marxan-api/modules/geo-features/geo-feature-set.api.entity';

import {
  ApiAcceptedResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import { apiGlobalPrefixes } from '@marxan-api/api.config';
import { JwtAuthGuard } from '@marxan-api/guards/jwt-auth.guard';

import {
  JSONAPIQueryParams,
  JSONAPISingleEntityQueryParams,
} from '@marxan-api/decorators/json-api-parameters.decorator';
import { CreateScenarioDTO } from './dto/create.scenario.dto';
import { UpdateScenarioDTO } from './dto/update.scenario.dto';
import { RequestWithAuthenticatedUser } from '@marxan-api/app.controller';
import {
  ScenarioFeaturesData,
  ScenarioFeaturesGapData,
  ScenarioFeaturesOutputGapData,
} from '@marxan/features';
import { UpdateScenarioPlanningUnitLockStatusDto } from './dto/update-scenario-planning-unit-lock-status.dto';
import { ShapefileGeoJSONResponseDTO } from './dto/shapefile.geojson.response.dto';
import { ApiConsumesShapefile } from '@marxan-api/decorators/shapefile.decorator';
import {
  projectDoesntExist,
  projectNotReady,
  ScenariosService,
} from './scenarios.service';
import { ScenarioSerializer } from './dto/scenario.serializer';
import { ScenarioFeatureSerializer } from './dto/scenario-feature.serializer';
import { ScenarioFeatureResultDto } from './dto/scenario-feature-result.dto';
import { ScenarioSolutionResultDto } from './dto/scenario-solution-result.dto';
import { ScenarioSolutionSerializer } from './dto/scenario-solution.serializer';
import { ProxyService } from '@marxan-api/modules/proxy/proxy.service';
import { ZipFilesSerializer } from './dto/zip-files.serializer';
import { ScenarioPlanningUnitSerializer } from './dto/scenario-planning-unit.serializer';
import { GeoFeatureSetSerializer } from '../geo-features/geo-feature-set.serializer';
import { CreateGeoFeatureSetDTO } from '../geo-features/dto/create.geo-feature-set.dto';
import { ScenarioPlanningUnitDto } from './dto/scenario-planning-unit.dto';
import { isLeft } from 'fp-ts/Either';
import { ScenarioFeaturesGapDataService } from '../scenarios-features/scenario-features-gap-data.service';
import { ScenarioFeaturesGapDataSerializer } from './dto/scenario-feature-gap-data.serializer';
import { ScenarioFeaturesOutputGapDataService } from '../scenarios-features/scenario-features-output-gap-data.service';
import { ScenarioFeaturesOutputGapDataSerializer } from './dto/scenario-feature-output-gap-data.serializer';
import { CostRangeDto } from './dto/cost-range.dto';
import {
  AsyncJobDto,
  JsonApiAsyncJobMeta,
} from '@marxan-api/dto/async-job.dto';
import { asyncJobTag } from '@marxan-api/dto/async-job-tag';
import { inlineJobTag } from '@marxan-api/dto/inline-job-tag';
import { submissionFailed } from '@marxan-api/modules/scenarios/protected-area';
import {
  GeometryFileInterceptor,
  GeometryKind,
} from '@marxan-api/decorators/file-interceptors.decorator';
import { ProtectedAreaDto } from '@marxan-api/modules/scenarios/dto/protected-area.dto';
import { UploadShapefileDto } from '@marxan-api/modules/scenarios/dto/upload.shapefile.dto';
import { ProtectedAreasChangeDto } from '@marxan-api/modules/scenarios/dto/protected-area-change.dto';
import { StartScenarioBlmCalibrationDto } from '@marxan-api/modules/scenarios/dto/start-scenario-blm-calibration.dto';
import {
  invalidRange,
  planningUnitAreaNotFound,
} from '@marxan-api/modules/projects/blm/change-blm-range.command';
import { projectNotFound } from '@marxan-api/modules/blm';
import { BlmCalibrationRunResultDto } from './dto/scenario-blm-calibration-results.dto';

const basePath = `${apiGlobalPrefixes.v1}/scenarios`;
const solutionsSubPath = `:id/marxan/solutions`;

const marxanRunTag = 'Marxan Run';
const marxanRunFiles = 'Marxan Run - Files';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags(scenarioResource.className)
@Controller(basePath)
export class ScenariosController {
  constructor(
    public readonly service: ScenariosService,
    private readonly scenarioFeaturesGapDataService: ScenarioFeaturesGapDataService,
    private readonly scenarioFeaturesOutputGapDataService: ScenarioFeaturesOutputGapDataService,
    private readonly geoFeatureSetSerializer: GeoFeatureSetSerializer,
    private readonly scenarioSerializer: ScenarioSerializer,
    private readonly scenarioFeaturesGapData: ScenarioFeaturesGapDataSerializer,
    private readonly scenarioFeaturesOutputGapData: ScenarioFeaturesOutputGapDataSerializer,
    private readonly scenarioFeatureSerializer: ScenarioFeatureSerializer,
    private readonly scenarioSolutionSerializer: ScenarioSolutionSerializer,
    private readonly proxyService: ProxyService,
    private readonly zipFilesSerializer: ZipFilesSerializer,
    private readonly planningUnitsSerializer: ScenarioPlanningUnitSerializer,
  ) {}

  @ApiOperation({
    description: 'Find all scenarios',
  })
  @ApiOkResponse({
    type: ScenarioResult,
  })
  @JSONAPIQueryParams({
    entitiesAllowedAsIncludes: scenarioResource.entitiesAllowedAsIncludes,
    availableFilters: [
      { name: 'name' },
      { name: 'type' },
      { name: 'projectId' },
      { name: 'status' },
    ],
  })
  @ApiQuery({
    name: 'q',
    required: false,
    description: `A free search over name and description`,
  })
  @Get()
  async findAll(
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
    @Query('q') nameAndDescriptionFilter?: string,
  ): Promise<ScenarioResult> {
    const results = await this.service.findAllPaginated(fetchSpecification, {
      params: { nameAndDescriptionFilter },
    });
    return this.scenarioSerializer.serialize(results.data, results.metadata);
  }

  @ApiOperation({
    description: 'Get planning unit tiles for selected scenario.',
  })
  /**
   *@todo Change ApiOkResponse mvt type
   */
  @ApiOkResponse({
    description: 'Binary protobuffer mvt tile',
    type: String,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiParam({
    name: 'id',
    description: 'Scenario id',
    type: String,
    required: true,
    example: 'e5c3b978-908c-49d3-b1e3-89727e9f999c',
  })
  @ApiParam({
    name: 'z',
    description: 'The zoom level ranging from 0 - 20',
    type: Number,
    required: true,
    example: 6,
  })
  @ApiParam({
    name: 'x',
    description: 'The tile x offset on Mercator Projection',
    type: Number,
    required: true,
    example: 35,
  })
  @ApiParam({
    name: 'y',
    description: 'The tile y offset on Mercator Projection',
    type: Number,
    required: true,
    example: 35,
  })
  @ApiQuery({
    name: 'include',
    description:
      'one of `protection`, `lock-status`, `features`, `cost`, `results`',
    type: Array,
    required: false,
    example: 'protection',
  })
  @Get(':id/planning-units/tiles/:z/:x/:y.mvt')
  async proxyProtectedAreaTile(
    @Req() request: Request,
    @Res() response: Response,
  ) {
    return this.proxyService.proxyTileRequest(request, response);
  }

  @ApiOperation({ description: 'Find scenario by id' })
  @ApiOkResponse({ type: ScenarioResult })
  @JSONAPISingleEntityQueryParams({
    entitiesAllowedAsIncludes: scenarioResource.entitiesAllowedAsIncludes,
  })
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
  ): Promise<ScenarioResult> {
    return await this.scenarioSerializer.serialize(
      await this.service.getById(id, fetchSpecification),
    );
  }

  @ApiOperation({ description: 'Create scenario' })
  @ApiCreatedResponse({ type: ScenarioResult })
  @ApiTags(asyncJobTag)
  @Post()
  async create(
    @Body(new ValidationPipe()) dto: CreateScenarioDTO,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<ScenarioResult> {
    const result = await this.service.create(dto, {
      authenticatedUser: req.user,
    });
    if (isLeft(result)) {
      switch (result.left) {
        case projectNotReady:
          throw new ConflictException();
        case projectDoesntExist:
          throw new NotFoundException(`Project doesn't exist`);
        default:
          const _check: never = result.left;
          throw new InternalServerErrorException();
      }
    }
    return await this.scenarioSerializer.serialize(
      result.right,
      undefined,
      true,
    );
  }

  @ApiOperation({ description: 'Create feature set for scenario' })
  @ApiTags(asyncJobTag)
  @Post(':id/features/specification')
  async createSpecification(
    @Body(new ValidationPipe()) dto: CreateGeoFeatureSetDTO,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<GeoFeatureSetResult> {
    const result = await this.service.createSpecification(id, dto);
    if (isLeft(result)) {
      throw new InternalServerErrorException(result.left.description);
    }
    return await this.geoFeatureSetSerializer.serialize(
      result.right,
      undefined,
      true,
    );
  }

  @ApiOperation({ description: 'Get feature set for scenario' })
  @ApiOkResponse({ type: GeoFeatureSetResult })
  @Get(':id/features/specification')
  async getFeatureSetFor(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<GeoFeatureSetResult> {
    const result = await this.service.getLastUpdatedSpecification(id);
    if (isLeft(result)) {
      return this.geoFeatureSetSerializer.emptySpecification();
    }
    return await this.geoFeatureSetSerializer.serialize(result.right);
  }

  @ApiConsumesShapefile({ withGeoJsonResponse: false })
  @GeometryFileInterceptor(GeometryKind.ComplexWithProperties)
  @ApiTags(asyncJobTag)
  @Post(`:id/cost-surface/shapefile`)
  async processCostSurfaceShapefile(
    @Param('id') scenarioId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<JsonApiAsyncJobMeta> {
    this.service.processCostSurfaceShapefile(scenarioId, file);
    return AsyncJobDto.forScenario().asJsonApiMetadata();
  }

  @Get(`:id/cost-surface`)
  @ApiOkResponse({ type: CostRangeDto })
  async getCostRange(@Param('id') scenarioId: string): Promise<CostRangeDto> {
    const range = await this.service.getCostRange(scenarioId);
    return plainToClass<CostRangeDto, CostRangeDto>(CostRangeDto, range);
  }

  @ApiConsumesShapefile()
  @ApiTags(inlineJobTag)
  @Post(':id/planning-unit-shapefile')
  @GeometryFileInterceptor(GeometryKind.Simple)
  async uploadLockInShapeFile(
    @Param('id', ParseUUIDPipe) scenarioId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ShapefileGeoJSONResponseDTO> {
    return this.service.uploadLockInShapeFile(scenarioId, file);
  }

  @ApiOperation({ description: 'Update scenario' })
  @ApiOkResponse({ type: ScenarioResult })
  @ApiTags(asyncJobTag)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) dto: UpdateScenarioDTO,
  ): Promise<ScenarioResult> {
    return await this.scenarioSerializer.serialize(
      await this.service.update(id, dto),
      undefined,
      true,
    );
  }

  @ApiOperation({ description: 'Delete scenario' })
  @ApiOkResponse()
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.service.remove(id);
  }

  @ApiTags(asyncJobTag)
  @ApiOkResponse()
  @Post(':id/planning-units')
  async changePlanningUnits(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() input: UpdateScenarioPlanningUnitLockStatusDto,
  ): Promise<JsonApiAsyncJobMeta> {
    await this.service.changeLockStatus(id, input);
    return AsyncJobDto.forScenario().asJsonApiMetadata();
  }

  @Delete(`:id/planning-units`)
  @ApiOkResponse()
  async resetPlanningUnitsLockStatus(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.service.resetLockStatus(id);
    return;
  }

  @Get(':id/planning-units')
  @ApiOkResponse({ type: ScenarioPlanningUnitDto, isArray: true })
  async getPlanningUnits(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ScenarioPlanningUnitDto[]> {
    return this.planningUnitsSerializer.serialize(
      await this.service.getPlanningUnits(id),
    );
  }

  @ApiOperation({ description: `Resolve scenario's features pre-gap data.` })
  @ApiOkResponse({
    type: ScenarioFeaturesData,
  })
  @Get(':id/features')
  async getScenarioFeatures(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Partial<ScenarioFeaturesData>[]> {
    const result = await this.service.getFeatures(id);
    return this.scenarioFeatureSerializer.serialize(
      result.data,
      result.metadata,
    );
  }

  @ApiOperation({
    description: `Retrieve protection gap data for the features of a scenario.`,
  })
  @ApiOkResponse({
    type: ScenarioFeaturesGapData,
  })
  @JSONAPIQueryParams()
  @Get(':id/features/gap-data')
  async getScenarioFeaturesGapData(
    @Param('id', ParseUUIDPipe) id: string,
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
    @Query('q') featureClassAndAliasFilter?: string,
  ): Promise<Partial<ScenarioFeaturesGapData>[]> {
    const result = await this.scenarioFeaturesGapDataService.findAllPaginated(
      fetchSpecification,
      {
        params: {
          scenarioId: id,
          searchPhrase: featureClassAndAliasFilter,
        },
      },
    );
    return this.scenarioFeaturesGapData.serialize(result.data, result.metadata);
  }

  @ApiTags(marxanRunFiles)
  @ApiOperation({ description: `Resolve scenario's input parameter file.` })
  @Get(':id/marxan/dat/input.dat')
  @ApiProduces('text/csv')
  @Header('Content-Type', 'text/csv')
  async getInputParameterFile(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<string> {
    return await this.service.getInputParameterFile(id);
  }

  @ApiTags(marxanRunFiles)
  @ApiOperation({ description: `Resolve scenario's spec file.` })
  @Get(':id/marxan/dat/spec.dat')
  @ApiProduces('text/csv')
  @Header('Content-Type', 'text/csv')
  async getSpecDatFile(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<string> {
    return await this.service.getSpecDatCsv(id);
  }

  @ApiTags(marxanRunFiles)
  @ApiOperation({ description: `Resolve scenario's puvspr file.` })
  @Get(':id/marxan/dat/puvspr.dat')
  @ApiProduces('text/csv')
  @Header('Content-Type', 'text/csv')
  async getPuvsprDatFile(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<string> {
    return await this.service.getPuvsprDatCsv(id);
  }

  @ApiTags(marxanRunFiles)
  @ApiOperation({ description: `Resolve scenario's bound file.` })
  @Get(':id/marxan/dat/bound.dat')
  @ApiProduces('text/csv')
  @Header('Content-Type', 'text/csv')
  async getBoundDatFile(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<string> {
    return await this.service.getBoundDatCsv(id);
  }

  @ApiTags(marxanRunFiles)
  @ApiOperation({
    description: `Get archived output files`,
  })
  @Get(`:id/marxan/output`)
  @Header(`Content-Type`, `application/zip`)
  @Header('Content-Disposition', 'attachment; filename="output.zip"')
  async getOutputArchive(
    @Param(`id`, ParseUUIDPipe) scenarioId: string,
    @Res() response: Response,
  ) {
    const result = await this.service.getMarxanExecutionOutputArchive(
      scenarioId,
    );
    response.send(this.zipFilesSerializer.serialize(result));
  }

  @ApiTags(marxanRunFiles)
  @ApiOperation({
    description: `Get archived input files`,
  })
  @Get(`:id/marxan/input`)
  @Header(`Content-Type`, `application/zip`)
  @Header('Content-Disposition', 'attachment; filename="input.zip"')
  async getInputArchive(
    @Param(`id`, ParseUUIDPipe) scenarioId: string,
    @Res() response: Response,
  ) {
    const result = await this.service.getMarxanExecutionInputArchive(
      scenarioId,
    );
    response.send(this.zipFilesSerializer.serialize(result));
  }

  @ApiOkResponse({
    type: ScenarioSolutionResultDto,
  })
  @ApiQuery({
    name: 'best',
    required: false,
    type: Boolean,
  })
  @ApiQuery({
    name: 'most-different',
    required: false,
    type: Boolean,
  })
  @JSONAPIQueryParams()
  @Get(solutionsSubPath)
  async getScenarioRunSolutions(
    @Param('id', ParseUUIDPipe) id: string,
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
  ): Promise<ScenarioFeatureResultDto> {
    const result = await this.service.findAllSolutionsPaginated(
      id,
      fetchSpecification,
    );
    return this.scenarioSolutionSerializer.serialize(
      result.data,
      result.metadata,
    );
  }

  @ApiOperation({
    description: `Request start of the Marxan execution.`,
    summary: `Request start of the Marxan execution.`,
  })
  @ApiTags(marxanRunTag, asyncJobTag)
  @ApiQuery({
    name: `blm`,
    required: false,
    type: Number,
  })
  @ApiAcceptedResponse({
    type: JsonApiAsyncJobMeta,
  })
  @Post(`:id/marxan`)
  async executeMarxanRun(
    @Param(`id`, ParseUUIDPipe) id: string,
    @Query(`blm`) blm?: number,
  ): Promise<JsonApiAsyncJobMeta> {
    await this.service.run(id, blm);
    return AsyncJobDto.forScenario().asJsonApiMetadata();
  }

  @ApiOperation({
    description: `Cancel running Marxan execution.`,
    summary: `Cancel running Marxan execution.`,
  })
  @ApiTags(marxanRunTag)
  @ApiAcceptedResponse({
    description: `No content.`,
  })
  @Delete(`:id/marxan`)
  async cancelMarxanRun(@Param(`id`, ParseUUIDPipe) id: string) {
    await this.service.cancelMarxanRun(id);
  }

  @ApiTags(marxanRunTag)
  @ApiOkResponse({
    type: ScenarioSolutionResultDto,
  })
  @JSONAPIQueryParams()
  @Get(`${solutionsSubPath}/best`)
  async getScenarioRunBestSolutions(
    @Param('id', ParseUUIDPipe) id: string,
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
  ): Promise<ScenarioFeatureResultDto> {
    const result = await this.service.getBestSolution(id, fetchSpecification);
    return this.scenarioSolutionSerializer.serialize(result[0]);
  }

  @ApiTags(marxanRunTag)
  @ApiOkResponse({
    type: ScenarioSolutionResultDto,
  })
  @JSONAPIQueryParams()
  @Get(`${solutionsSubPath}/most-different`)
  async getScenarioRunMostDifferentSolutions(
    @Param('id', ParseUUIDPipe) id: string,
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
  ): Promise<ScenarioFeatureResultDto> {
    const result = await this.service.getMostDifferentSolutions(
      id,
      fetchSpecification,
    );
    return this.scenarioSolutionSerializer.serialize(result[0]);
  }

  @ApiOperation({
    description: `Retrieve Marxan protection data for the features of a scenario.`,
  })
  @ApiOkResponse({
    type: ScenarioFeaturesOutputGapData,
  })
  @JSONAPIQueryParams({
    availableFilters: [
      {
        name: 'runId',
        description: 'Filter by one or more Marxan runIds',
        examples: ['filter[runId]=1,2,3'],
      },
    ],
  })
  @Get(`${solutionsSubPath}/gap-data`)
  async getScenarioFeaturesOutputGapData(
    @Param('id', ParseUUIDPipe) id: string,
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
    @Query('q') featureClassAndAliasFilter?: string,
  ): Promise<Partial<ScenarioFeaturesOutputGapData>[]> {
    const result = await this.scenarioFeaturesOutputGapDataService.findAllPaginated(
      fetchSpecification,
      {
        params: {
          scenarioId: id,
          searchPhrase: featureClassAndAliasFilter,
        },
      },
    );
    return this.scenarioFeaturesOutputGapData.serialize(
      result.data,
      result.metadata,
    );
  }

  @ApiOkResponse({
    type: ScenarioSolutionResultDto,
  })
  @JSONAPIQueryParams()
  @Get(`${solutionsSubPath}/:runId`)
  async getScenarioRunId(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('runId', ParseUUIDPipe) runId: string,
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
  ): Promise<ScenarioFeatureResultDto> {
    return this.scenarioSolutionSerializer.serialize(
      await this.service.getOneSolution(id, runId, fetchSpecification),
    );
  }

  @ApiTags(marxanRunFiles)
  @Header('Content-Type', 'text/csv')
  @ApiOkResponse({
    schema: {
      type: 'string',
    },
  })
  @ApiOperation({
    description: `Uploaded cost surface data`,
  })
  @Get(`:id/marxan/dat/pu.dat`)
  async getScenarioCostSurface(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ): Promise<void> {
    await this.service.getCostSurfaceCsv(id, res);
    return;
  }

  @ApiOkResponse({
    type: ProtectedAreaDto,
    isArray: true,
  })
  @Get(`:id/protected-areas`)
  async getProtectedAreasForScenario(
    @Param('id') scenarioId: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<ProtectedAreaDto[]> {
    const result = await this.service.getProtectedAreasFor(scenarioId, {
      authenticatedUser: req.user,
    });

    if (isLeft(result)) {
      throw new NotFoundException();
    }

    return result.right;
  }

  @ApiOkResponse({
    type: ProtectedAreaDto,
    isArray: true,
  })
  @Post(`:id/protected-areas`)
  async updateProtectedAreasForScenario(
    @Param('id') scenarioId: string,
    @Body(new ValidationPipe()) dto: ProtectedAreasChangeDto,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<ProtectedAreaDto[]> {
    const result = await this.service.updateProtectedAreasFor(scenarioId, dto, {
      authenticatedUser: req.user,
    });

    if (isLeft(result)) {
      // TODO map error
      throw new BadRequestException();
    }

    return this.getProtectedAreasForScenario(scenarioId, req);
  }

  @ApiConsumesShapefile({ withGeoJsonResponse: false })
  @ApiOperation({
    description:
      'Upload shapefile for with protected areas for project&scenario',
  })
  @GeometryFileInterceptor(GeometryKind.Complex)
  @ApiTags(asyncJobTag)
  @Post(':id/protected-areas/shapefile')
  async shapefileForProtectedArea(
    @Param('id') scenarioId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithAuthenticatedUser,
    @Body() dto: UploadShapefileDto,
  ): Promise<JsonApiAsyncJobMeta> {
    const outcome = await this.service.addProtectedAreaFor(
      scenarioId,
      file,
      { authenticatedUser: req.user },
      dto,
    );
    if (isLeft(outcome)) {
      switch (outcome.left) {
        case submissionFailed:
          throw new InternalServerErrorException();
        default:
          throw new NotFoundException();
      }
    }
    return AsyncJobDto.forScenario().asJsonApiMetadata();
  }

  @ApiOperation({
    description: `Start BLM calibration process for a scenario.`,
    summary: `Start BLM calibration process for a scenario.`,
  })
  @ApiOkResponse({
    type: ScenarioResult,
  })
  @Post(`:id/calibration`)
  async startCalibration(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() { range }: StartScenarioBlmCalibrationDto,
  ): Promise<ScenarioResult> {
    const result = await this.service.startBlmCalibration(id, range);

    if (isLeft(result)) {
      switch (result.left) {
        case planningUnitAreaNotFound:
          throw new InternalServerErrorException(
            `Could not found planning units area for scenario with ID: ${id}`,
          );
        case projectNotFound:
          throw new NotFoundException(
            `Could not found project for scenario with ID: ${id}`,
          );
        case invalidRange:
          throw new BadRequestException(
            `Received range is invalid: [${range}]`,
          );
        default:
          throw new InternalServerErrorException();
      }
    }

    return this.scenarioSerializer.serialize(result.right, undefined, true);
  }

  @ApiOperation({
    description: `Retrieve BLM calibration results for a scenario.`,
    summary: `Retrieve BLM calibration results for a scenario.`,
  })
  @ApiOkResponse({
    type: BlmCalibrationRunResultDto,
    isArray: true,
  })
  @Get(`:id/calibration`)
  async getCalibrationResults(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BlmCalibrationRunResultDto[]> {
    return this.service.getBlmCalibrationResults(id);
  }

  @ApiOperation({
    description: `Cancel BLM calibration execution.`,
    summary: `Cancel BLM calibration execution.`,
  })
  @Delete(`:id/calibration`)
  async cancelBlmCalibration(@Param(`id`, ParseUUIDPipe) id: string) {
    await this.service.cancelBlmCalibration(id);
  }
}
