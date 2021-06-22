import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  ParseBoolPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Put,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
  Logger,
} from '@nestjs/common';
import { scenarioResource, ScenarioResult } from './scenario.api.entity';
import { Request, Response } from 'express';
import {
  FetchSpecification,
  ProcessFetchSpecification,
} from 'nestjs-base-service';
import { CreateGeoFeatureSetDTO } from '@marxan-api/modules/geo-features/dto/create.geo-feature-set.dto';
import { GeoFeatureSetResult } from '@marxan-api/modules/geo-features/geo-feature-set.api.entity';
import { GeoFeaturesService } from '@marxan-api/modules/geo-features/geo-features.service';

import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import { apiGlobalPrefixes } from '@marxan-api/api.config';
import { JwtAuthGuard } from '@marxan-api/guards/jwt-auth.guard';

import {
  JSONAPIQueryParams,
  JSONAPISingleEntityQueryParams,
} from '@marxan-api/decorators/json-api-parameters.decorator';
import { CreateScenarioDTO } from './dto/create.scenario.dto';
import { UpdateScenarioDTO } from './dto/update.scenario.dto';
import { RequestWithAuthenticatedUser } from '@marxan-api/app.controller';
import { RemoteScenarioFeaturesData } from '../scenarios-features/entities/remote-scenario-features-data.geo.entity';
import { UpdateScenarioPlanningUnitLockStatusDto } from './dto/update-scenario-planning-unit-lock-status.dto';
import { uploadOptions } from '@marxan-api/utils/file-uploads.utils';
import { ShapefileGeoJSONResponseDTO } from './dto/shapefile.geojson.response.dto';
import { ApiConsumesShapefile } from '@marxan-api/decorators/shapefile.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { ScenariosService } from './scenarios.service';
import { ScenarioSerializer } from './dto/scenario.serializer';
import { ScenarioFeatureSerializer } from './dto/scenario-feature.serializer';
import { ScenarioFeatureResultDto } from './dto/scenario-feature-result.dto';
import { ScenarioSolutionResultDto } from './dto/scenario-solution-result.dto';
import { ScenarioSolutionSerializer } from './dto/scenario-solution.serializer';

const basePath = `${apiGlobalPrefixes.v1}/scenarios`;
const solutionsSubPath = `:id/marxan/run/:runId/solutions`;

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags(scenarioResource.className)
@Controller(basePath)
export class ScenariosController {
  constructor(
    public readonly service: ScenariosService,
    private readonly geoFeaturesService: GeoFeaturesService,
    private readonly scenarioSerializer: ScenarioSerializer,
    private readonly scenarioFeatureSerializer: ScenarioFeatureSerializer,
    private readonly scenarioSolutionSerializer: ScenarioSolutionSerializer,
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
  @Post()
  async create(
    @Body(new ValidationPipe()) dto: CreateScenarioDTO,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<ScenarioResult> {
    return await this.scenarioSerializer.serialize(
      await this.service.create(dto, { authenticatedUser: req.user }),
    );
  }

  @ApiOperation({ description: 'Create feature set for scenario' })
  @ApiCreatedResponse({ type: ScenarioResult })
  @Post(':id/features/specification')
  async createFeatureSetFor(
    @Body(new ValidationPipe()) dto: CreateGeoFeatureSetDTO,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<any> {
    Logger.debug(`Creating feature specification with dto: ${dto}`);
    return dto;
  }

  @ApiConsumesShapefile(false)
  @ApiNoContentResponse()
  @Post(`:id/cost-surface/shapefile`)
  async processCostSurfaceShapefile(
    @Param('id') scenarioId: string,
    @Req() request: Request,
  ): Promise<void> {
    this.service.processCostSurfaceShapefile(scenarioId, request.file);
  }

  @ApiConsumesShapefile()
  @Post(':id/planning-unit-shapefile')
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  async uploadLockInShapeFile(
    @Param('id', ParseUUIDPipe) scenarioId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ShapefileGeoJSONResponseDTO> {
    return this.service.uploadLockInShapeFile(scenarioId, file);
  }

  @ApiOperation({ description: 'Update scenario' })
  @ApiOkResponse({ type: ScenarioResult })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) dto: UpdateScenarioDTO,
  ): Promise<ScenarioResult> {
    return await this.scenarioSerializer.serialize(
      await this.service.update(id, dto),
    );
  }

  @ApiOperation({ description: 'Delete scenario' })
  @ApiOkResponse()
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.service.remove(id);
  }

  @Patch(':id/planning-units')
  @ApiOkResponse()
  async changePlanningUnits(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() input: UpdateScenarioPlanningUnitLockStatusDto,
  ): Promise<void> {
    await this.service.changeLockStatus(id, input);
    return;
  }

  @ApiOperation({ description: `Resolve scenario's features pre-gap data.` })
  @ApiOkResponse({
    type: RemoteScenarioFeaturesData,
  })
  @Get(':id/features')
  async getScenarioFeatures(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Partial<RemoteScenarioFeaturesData>[]> {
    return this.scenarioFeatureSerializer.serialize(
      await this.service.getFeatures(id),
    );
  }

  @ApiOperation({ description: `Resolve scenario's input parameter file.` })
  @Get(':id/marxan/dat/input.dat')
  @ApiProduces('text/plain')
  @Header('Content-Type', 'text/plain')
  async getInputParameterFile(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<string> {
    return await this.service.getInputParameterFile(id);
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
    @Param('runId', ParseUUIDPipe) runId: string,
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
    @Query('best', ParseBoolPipe) selectOnlyBest?: boolean,
    @Query('most-different', ParseBoolPipe) selectMostDifferent?: boolean,
  ): Promise<ScenarioFeatureResultDto> {
    if (selectOnlyBest) {
      return this.getScenarioRunBestSolutions(id, runId);
    }

    if (selectMostDifferent) {
      return this.getScenarioRunMostDifferentSolutions(
        id,
        runId,
        fetchSpecification,
      );
    }

    const result = await this.service.findAllSolutionsPaginated(
      id,
      runId,
      fetchSpecification,
    );
    return this.scenarioSolutionSerializer.serialize(
      result.data,
      result.metadata,
    );
  }

  @ApiOkResponse({
    type: ScenarioSolutionResultDto,
  })
  @JSONAPIQueryParams()
  @Get(`${solutionsSubPath}/best`)
  async getScenarioRunBestSolutions(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('runId', ParseUUIDPipe) runId: string,
  ): Promise<ScenarioFeatureResultDto> {
    return this.scenarioSolutionSerializer.serialize(
      await this.service.getBestSolution(id, runId),
    );
  }

  @ApiOkResponse({
    type: ScenarioSolutionResultDto,
  })
  @JSONAPIQueryParams()
  @Get(`${solutionsSubPath}/most-different`)
  async getScenarioRunMostDifferentSolutions(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('runId', ParseUUIDPipe) runId: string,
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
  ): Promise<ScenarioFeatureResultDto> {
    const result = await this.service.getMostDifferentSolutions(
      id,
      runId,
      fetchSpecification,
    );
    return this.scenarioSolutionSerializer.serialize(
      result.data,
      result.metadata,
    );
  }

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

  @ApiOperation({
    description: "Create the specification for a scenario's feature set",
  })
  @ApiOkResponse()
  @Post(':id/features/specification')
  async createFeatureSetForScenario(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ValidationPipe()) dto: CreateGeoFeatureSetDTO,
  ): Promise<GeoFeatureSetResult> {
    return await this.geoFeaturesService.createOrReplaceFeatureSet(id, dto);
  }
  @ApiOperation({
    description: "Replace the specification for a scenario's feature set",
  })
  @ApiOkResponse()
  @Put(':id/features/specification')
  async replaceFeatureSetForScenario(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ValidationPipe()) dto: CreateGeoFeatureSetDTO,
  ): Promise<GeoFeatureSetResult> {
    return await this.geoFeaturesService.createOrReplaceFeatureSet(id, dto);
  }
}
