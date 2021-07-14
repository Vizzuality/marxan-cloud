import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { scenarioResource, ScenarioResult } from './scenario.api.entity';
import { Request, Response } from 'express';
import {
  FetchSpecification,
  ProcessFetchSpecification,
} from 'nestjs-base-service';

import {
  ApiAcceptedResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
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
import { ProxyService } from '@marxan-api/modules/proxy/proxy.service';
import { ZipFilesSerializer } from './dto/zip-files.serializer';

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
    private readonly service: ScenariosService,
    private readonly scenarioSerializer: ScenarioSerializer,
    private readonly scenarioFeatureSerializer: ScenarioFeatureSerializer,
    private readonly scenarioSolutionSerializer: ScenarioSolutionSerializer,
    private readonly proxyService: ProxyService,
    private readonly zipFilesSerializer: ZipFilesSerializer,
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
    required: false,
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
  @Post()
  async create(
    @Body(new ValidationPipe()) dto: CreateScenarioDTO,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<ScenarioResult> {
    return await this.scenarioSerializer.serialize(
      await this.service.create(dto, { authenticatedUser: req.user }),
    );
  }

  @ApiConsumesShapefile({ withGeoJsonResponse: false })
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
    response.send(result);
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
  @ApiTags(marxanRunTag)
  @ApiQuery({
    name: `blm`,
    required: false,
    type: Number,
  })
  @ApiAcceptedResponse({
    description: `No content.`,
  })
  @Post(`:id/marxan`)
  async executeMarxanRun(
    @Param(`id`, ParseUUIDPipe) id: string,
    @Query(`blm`) blm?: number,
  ) {
    await this.service.run(id, blm);
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
  async cancelMaraxnRun(@Param(`id`, ParseUUIDPipe) id: string) {
    await this.service.cancel(id);
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
    return this.scenarioSolutionSerializer.serialize(
      result.data,
      result.metadata,
    );
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
    return this.scenarioSolutionSerializer.serialize(
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
}
