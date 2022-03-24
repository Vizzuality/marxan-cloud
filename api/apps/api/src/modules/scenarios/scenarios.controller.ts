import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
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
import { Response } from 'express';
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
  ApiNoContentResponse,
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
import { GeoJsonDataDTO } from './dto/shapefile.geojson.response.dto';
import { ApiConsumesShapefile } from '@marxan-api/decorators/shapefile.decorator';
import { ScenariosService } from './scenarios.service';
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
import {
  GeometryFileInterceptor,
  GeometryKind,
} from '@marxan-api/decorators/file-interceptors.decorator';
import { ProtectedAreaDto } from '@marxan-api/modules/scenarios/dto/protected-area.dto';
import { UploadShapefileDto } from '@marxan-api/modules/scenarios/dto/upload.shapefile.dto';
import { ProtectedAreasChangeDto } from '@marxan-api/modules/scenarios/dto/protected-area-change.dto';
import { StartScenarioBlmCalibrationDto } from '@marxan-api/modules/scenarios/dto/start-scenario-blm-calibration.dto';
import { BlmCalibrationRunResultDto } from './dto/scenario-blm-calibration-results.dto';
import { ImplementsAcl } from '@marxan-api/decorators/acl.decorator';
import { forbiddenError } from '@marxan-api/modules/access-control';
import { notFound as notFoundSpec } from '@marxan-api/modules/scenario-specification/application/last-updated-specification.query';

import { ScenarioAccessControl } from '@marxan-api/modules/access-control/scenarios-acl/scenario-access-control';
import { BlmRangeDto } from '@marxan-api/modules/scenarios/dto/blm-range.dto';
import {
  ScenarioLockResultPlural,
  ScenarioLockResultSingular,
} from '@marxan-api/modules/access-control/scenarios-acl/locks/dto/scenario.lock.dto';
import { mapAclDomainToHttpError } from '@marxan-api/utils/acl.utils';
import { BaseTilesOpenApi } from '@marxan/tiles';
import { WebshotSummaryReportConfig } from '@marxan/webshot';
import { WebshotService } from '@marxan/webshot';
import { AppSessionToken } from '@marxan-api/decorators/app-session-token-cookie.decorator';

const basePath = `${apiGlobalPrefixes.v1}/scenarios`;
const solutionsSubPath = `:id/marxan/solutions`;

const marxanRunTag = 'Marxan Run';
const marxanRunFiles = 'Marxan Run - Files';

@ImplementsAcl()
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
    private readonly scenarioAclService: ScenarioAccessControl,
    private readonly webshotService: WebshotService,
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
    @Req() req: RequestWithAuthenticatedUser,
    @Query('q') nameAndDescriptionFilter?: string,
  ): Promise<ScenarioResult> {
    const results = await this.service.findAllPaginated(fetchSpecification, {
      params: { nameAndDescriptionFilter },
      authenticatedUser: req.user,
    });
    return this.scenarioSerializer.serialize(results.data, results.metadata);
  }

  @BaseTilesOpenApi()
  @ApiOperation({
    description: 'Get tiles for a scenario planning units.',
  })
  @ApiParam({
    name: 'id',
    description: 'scenario id',
    type: String,
    required: true,
    example: 'e5c3b978-908c-49d3-b1e3-89727e9f999c',
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
  async proxyPlanningUnitsTile(
    @Req() req: RequestWithAuthenticatedUser,
    @Res() response: Response,
    @Param('id', ParseUUIDPipe) scenarioId: string,
  ) {
    /* Due to the usage of proxyService in other modules
    the ACL control for this endpoint is placed in the controller */
    if (
      !(await this.scenarioAclService.canViewScenario(req.user.id, scenarioId))
    ) {
      throw new ForbiddenException();
    }
    return await this.proxyService.proxyTileRequest(req, response);
  }

  @BaseTilesOpenApi()
  @ApiParam({
    name: 'scenarioIdA',
    description: 'First scenario to be compare',
    type: String,
    required: true,
    example: 'e5c3b978-908c-49d3-b1e3-89727e9f999c',
  })
  @ApiParam({
    name: 'scenarioIdB',
    description: 'Second scenario to be compare with the first',
    type: String,
    required: true,
    example: 'e5c3b978-908c-49d3-b1e3-89727e9f999c',
  })
  @ApiOperation({
    description: 'Get tile to compare scenarios within the same project.',
  })
  @Get('/:scenarioIdA/compare/:scenarioIdB/tiles/:z/:x/:y.mvt')
  async proxyProtectedAreaTile(
    @Req() req: RequestWithAuthenticatedUser,
    @Res() response: Response,
    @Param('scenarioIdA', ParseUUIDPipe) scenarioIdA: string,
    @Param('scenarioIdB', ParseUUIDPipe) scenarioIdB: string,
  ) {
    /* Due to the usage of proxyService in other modules
    the ACL control for this endpoint is placed in the controller */
    if (
      !(
        (await this.scenarioAclService.canViewScenario(
          req.user.id,
          scenarioIdA,
        )) &&
        (await this.scenarioAclService.canViewScenario(
          req.user.id,
          scenarioIdB,
        ))
      )
    ) {
      throw new ForbiddenException();
    }
    return await this.proxyService.proxyTileRequest(req, response);
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
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<ScenarioResult> {
    const result = await this.service.getById(
      id,
      {
        authenticatedUser: req.user,
      },
      fetchSpecification,
    );

    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        userId: req.user.id,
        resourceType: scenarioResource.name.plural,
      });
    }

    return await this.scenarioSerializer.serialize(result.right);
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
      throw mapAclDomainToHttpError(result.left, {
        userId: req.user.id,
        resourceType: scenarioResource.name.plural,
      });
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
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<GeoFeatureSetResult> {
    const result = await this.service.createSpecification(id, req.user.id, dto);

    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        scenarioId: id,
        userId: req.user.id,
        resourceType: scenarioResource.name.plural,
      });
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
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<GeoFeatureSetResult> {
    const result = await this.service.getLastUpdatedSpecification(
      id,
      req.user.id,
    );
    if (isLeft(result)) {
      switch (result.left) {
        case notFoundSpec:
          return this.geoFeatureSetSerializer.emptySpecification();
        case forbiddenError:
          throw new ForbiddenException();
        default:
          const _exhaustiveCheck: never = result.left;
          throw _exhaustiveCheck;
      }
    }
    return await this.geoFeatureSetSerializer.serialize(result.right);
  }

  @ApiConsumesShapefile({ withGeoJsonResponse: false })
  @GeometryFileInterceptor(GeometryKind.ComplexWithProperties)
  @ApiTags(asyncJobTag)
  @Post(`:id/cost-surface/shapefile`)
  async processCostSurfaceShapefile(
    @Param('id') scenarioId: string,
    @Req() req: RequestWithAuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<JsonApiAsyncJobMeta> {
    const result = await this.service.processCostSurfaceShapefile(
      scenarioId,
      req.user.id,
      file,
    );

    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        scenarioId,
        userId: req.user.id,
        resourceType: scenarioResource.name.plural,
      });
    }
    return AsyncJobDto.forScenario().asJsonApiMetadata();
  }

  @Get(`:id/cost-surface`)
  @ApiOkResponse({ type: CostRangeDto })
  async getCostRange(
    @Param('id') scenarioId: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<CostRangeDto> {
    const result = await this.service.getCostRange(scenarioId, req.user.id);
    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        scenarioId,
        userId: req.user.id,
        resourceType: scenarioResource.name.plural,
      });
    }
    return plainToClass<CostRangeDto, CostRangeDto>(CostRangeDto, result.right);
  }

  @ApiConsumesShapefile()
  @ApiTags(inlineJobTag)
  @Post(':id/planning-unit-shapefile')
  @GeometryFileInterceptor(GeometryKind.Simple)
  async uploadLockInShapeFile(
    @Param('id', ParseUUIDPipe) scenarioId: string,
    @Req() req: RequestWithAuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<GeoJsonDataDTO> {
    const result = await this.service.uploadLockInShapeFile(
      scenarioId,
      req.user.id,
      file,
    );
    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        scenarioId,
        userId: req.user.id,
        resourceType: scenarioResource.name.plural,
      });
    }
    return result.right;
  }

  @ApiOperation({ description: 'Update scenario' })
  @ApiOkResponse({ type: ScenarioResult })
  @ApiTags(asyncJobTag)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Req() req: RequestWithAuthenticatedUser,
    @Body(new ValidationPipe()) dto: UpdateScenarioDTO,
  ): Promise<ScenarioResult> {
    const result = await this.service.update(id, req.user.id, dto);

    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        scenarioId: id,
        userId: req.user.id,
        resourceType: scenarioResource.name.plural,
      });
    }

    return await this.scenarioSerializer.serialize(
      result.right,
      undefined,
      true,
    );
  }

  @ApiOperation({ description: 'Delete scenario' })
  @ApiOkResponse()
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<void> {
    const result = await this.service.remove(id, req.user.id);

    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        scenarioId: id,
        userId: req.user.id,
        resourceType: scenarioResource.name.plural,
      });
    }
  }

  @ApiTags(asyncJobTag)
  @ApiOkResponse()
  @Post(':id/planning-units')
  async changePlanningUnits(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestWithAuthenticatedUser,
    @Body() input: UpdateScenarioPlanningUnitLockStatusDto,
  ): Promise<JsonApiAsyncJobMeta> {
    const result = await this.service.changeLockStatus(id, req.user.id, input);
    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        scenarioId: id,
        userId: req.user.id,
        resourceType: scenarioResource.name.plural,
      });
    }
    return AsyncJobDto.forScenario().asJsonApiMetadata();
  }

  @Delete(`:id/planning-units`)
  @ApiOkResponse()
  async resetPlanningUnitsLockStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<void> {
    const result = await this.service.resetLockStatus(id, req.user.id);

    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        scenarioId: id,
        userId: req.user.id,
        resourceType: scenarioResource.name.plural,
      });
    }
  }

  @Get(':id/planning-units')
  @ApiOkResponse({ type: ScenarioPlanningUnitDto, isArray: true })
  async getPlanningUnits(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<ScenarioPlanningUnitDto[]> {
    const result = await this.service.getPlanningUnits(id, req.user.id);

    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        scenarioId: id,
        userId: req.user.id,
        resourceType: scenarioResource.name.plural,
      });
    }

    return this.planningUnitsSerializer.serialize(result.right);
  }

  @ApiOperation({ description: `Resolve scenario's features pre-gap data.` })
  @ApiOkResponse({
    type: ScenarioFeaturesData,
  })
  @Get(':id/features')
  async getScenarioFeatures(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<Partial<ScenarioFeaturesData>[]> {
    const result = await this.service.getFeatures(id, req.user.id);
    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        scenarioId: id,
        userId: req.user.id,
        resourceType: scenarioResource.name.plural,
      });
    }
    return this.scenarioFeatureSerializer.serialize(
      result.right.data,
      result.right.metadata,
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
    @Req() req: RequestWithAuthenticatedUser,
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
    @Query('q') featureClassAndAliasFilter?: string,
  ): Promise<Partial<ScenarioFeaturesGapData>[]> {
    const result = await this.scenarioFeaturesGapDataService.findAllPaginatedAcl(
      fetchSpecification,
      {
        params: {
          scenarioId: id,
          searchPhrase: featureClassAndAliasFilter,
        },
        authenticatedUser: req.user,
      },
    );

    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        scenarioId: id,
        userId: req.user.id,
        resourceType: scenarioResource.name.plural,
      });
    }
    return this.scenarioFeaturesGapData.serialize(
      result.right.data,
      result.right.metadata,
    );
  }

  @ApiTags(marxanRunFiles)
  @ApiOperation({ description: `Resolve scenario's input parameter file.` })
  @Get(':id/marxan/dat/input.dat')
  @ApiProduces('text/csv')
  @Header('Content-Type', 'text/csv')
  async getInputParameterFile(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<string> {
    const result = await this.service.getInputParameterFile(id, req.user.id);
    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        scenarioId: id,
        userId: req.user.id,
        resourceType: scenarioResource.name.plural,
      });
    }
    return result.right;
  }

  @ApiTags(marxanRunFiles)
  @ApiOperation({ description: `Resolve scenario's spec file.` })
  @Get(':id/marxan/dat/spec.dat')
  @ApiProduces('text/csv')
  @Header('Content-Type', 'text/csv')
  async getSpecDatFile(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<string> {
    const result = await this.service.getSpecDatCsv(id, req.user.id);
    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        scenarioId: id,
        userId: req.user.id,
        resourceType: scenarioResource.name.plural,
      });
    }
    return result.right;
  }

  @ApiTags(marxanRunFiles)
  @ApiOperation({ description: `Resolve scenario's puvspr file.` })
  @Get(':id/marxan/dat/puvspr.dat')
  @ApiProduces('text/csv')
  @Header('Content-Type', 'text/csv')
  async getPuvsprDatFile(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<string> {
    const result = await this.service.getPuvsprDatCsv(id, req.user.id);
    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        scenarioId: id,
        userId: req.user.id,
        resourceType: scenarioResource.name.plural,
      });
    }
    return result.right;
  }

  @ApiTags(marxanRunFiles)
  @ApiOperation({ description: `Resolve scenario's bound file.` })
  @Get(':id/marxan/dat/bound.dat')
  @ApiProduces('text/csv')
  @Header('Content-Type', 'text/csv')
  async getBoundDatFile(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<string> {
    const result = await this.service.getBoundDatCsv(id, req.user.id);
    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        scenarioId: id,
        userId: req.user.id,
        resourceType: scenarioResource.name.plural,
      });
    }
    return result.right;
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
    @Req() req: RequestWithAuthenticatedUser,
    @Res() response: Response,
  ) {
    const result = await this.service.getMarxanExecutionOutputArchive(
      scenarioId,
      req.user.id,
    );

    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        scenarioId,
        userId: req.user.id,
        resourceType: scenarioResource.name.plural,
      });
    }

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
    @Req() req: RequestWithAuthenticatedUser,
    @Res() response: Response,
  ) {
    const result = await this.service.getMarxanExecutionInputArchive(
      scenarioId,
      req.user.id,
    );

    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        scenarioId,
        userId: req.user.id,
        resourceType: scenarioResource.name.plural,
      });
    }
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
    @Req() req: RequestWithAuthenticatedUser,
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
  ): Promise<ScenarioFeatureResultDto> {
    const result = await this.service.findAllSolutionsPaginated(
      id,
      req.user.id,
      fetchSpecification,
    );

    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        scenarioId: id,
        userId: req.user.id,
        resourceType: scenarioResource.name.plural,
      });
    }

    return this.scenarioSolutionSerializer.serialize(
      result.right.data,
      result.right.metadata,
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
    @Req() req: RequestWithAuthenticatedUser,
    @Query(`blm`) blm?: number,
  ): Promise<JsonApiAsyncJobMeta> {
    const result = await this.service.run(id, req.user.id, blm);
    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        scenarioId: id,
        userId: req.user.id,
        resourceType: scenarioResource.name.plural,
      });
    }
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
  async cancelMarxanRun(
    @Param(`id`, ParseUUIDPipe) id: string,
    @Req() req: RequestWithAuthenticatedUser,
  ) {
    const result = await this.service.cancelMarxanRun(id, req.user.id);

    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        scenarioId: id,
        userId: req.user.id,
        resourceType: scenarioResource.name.plural,
      });
    }
  }

  @ApiTags(marxanRunTag)
  @ApiOkResponse({
    type: ScenarioSolutionResultDto,
  })
  @JSONAPIQueryParams()
  @Get(`${solutionsSubPath}/best`)
  async getScenarioRunBestSolutions(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestWithAuthenticatedUser,
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
  ): Promise<ScenarioFeatureResultDto> {
    const result = await this.service.getBestSolution(
      id,
      req.user.id,
      fetchSpecification,
    );

    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        scenarioId: id,
        userId: req.user.id,
        resourceType: scenarioResource.name.plural,
      });
    }

    return this.scenarioSolutionSerializer.serialize(result.right[0]);
  }

  @ApiTags(marxanRunTag)
  @ApiOkResponse({
    type: ScenarioSolutionResultDto,
  })
  @JSONAPIQueryParams()
  @Get(`${solutionsSubPath}/most-different`)
  async getScenarioRunMostDifferentSolutions(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestWithAuthenticatedUser,
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
  ): Promise<ScenarioFeatureResultDto> {
    const result = await this.service.getMostDifferentSolutions(
      id,
      req.user.id,
      fetchSpecification,
    );

    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        scenarioId: id,
        userId: req.user.id,
        resourceType: scenarioResource.name.plural,
      });
    }

    return this.scenarioSolutionSerializer.serialize(result.right[0]);
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
    @Req() req: RequestWithAuthenticatedUser,
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
    @Query('q') featureClassAndAliasFilter?: string,
  ): Promise<Partial<ScenarioFeaturesOutputGapData>[]> {
    const result = await this.scenarioFeaturesOutputGapDataService.findAllPaginatedAcl(
      fetchSpecification,
      {
        params: {
          scenarioId: id,
          searchPhrase: featureClassAndAliasFilter,
        },
        authenticatedUser: req.user,
      },
    );

    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        scenarioId: id,
        userId: req.user.id,
        resourceType: scenarioResource.name.plural,
      });
    }

    return this.scenarioFeaturesOutputGapData.serialize(
      result.right.data,
      result.right.metadata,
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
    @Req() req: RequestWithAuthenticatedUser,
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
  ): Promise<ScenarioFeatureResultDto> {
    const result = await this.service.getOneSolution(
      id,
      runId,
      req.user.id,
      fetchSpecification,
    );

    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        scenarioId: id,
        userId: req.user.id,
        resourceType: scenarioResource.name.plural,
      });
    }

    return this.scenarioSolutionSerializer.serialize(result.right);
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
    @Req() req: RequestWithAuthenticatedUser,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.service.getCostSurfaceCsv(id, req.user.id, res);

    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        scenarioId: id,
        userId: req.user.id,
        resourceType: scenarioResource.name.plural,
      });
    }
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
      throw mapAclDomainToHttpError(result.left, {
        scenarioId,
        userId: req.user.id,
        resourceType: scenarioResource.name.plural,
      });
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
      throw mapAclDomainToHttpError(result.left, {
        scenarioId,
        userId: req.user.id,
        resourceType: scenarioResource.name.plural,
      });
    }
    return await this.getProtectedAreasForScenario(scenarioId, req);
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
      throw mapAclDomainToHttpError(outcome.left, {
        scenarioId,
        userId: req.user.id,
        resourceType: scenarioResource.name.plural,
      });
    }
    return AsyncJobDto.forScenario().asJsonApiMetadata();
  }

  @ApiOperation({
    description: `Start BLM calibration process for a scenario.`,
    summary: `Start BLM calibration process for a scenario.`,
  })
  @ApiOkResponse({
    type: JsonApiAsyncJobMeta,
  })
  @Post(`:id/calibration`)
  async startCalibration(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() { range }: StartScenarioBlmCalibrationDto,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<JsonApiAsyncJobMeta> {
    const result = await this.service.startBlmCalibration(
      id,
      {
        authenticatedUser: req.user,
      },
      range,
    );

    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        scenarioId: id,
        userId: req.user.id,
        resourceType: scenarioResource.name.plural,
        range,
      });
    }

    return AsyncJobDto.forScenario().asJsonApiMetadata();
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
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<BlmCalibrationRunResultDto[]> {
    const result = await this.service.getBlmCalibrationResults(id, req.user.id);

    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        scenarioId: id,
        userId: req.user.id,
        resourceType: scenarioResource.name.plural,
      });
    }

    return result.right;
  }

  @ApiOperation({
    description: `Retrieve BLM range for a scenario.`,
    summary: `Retrieve BLM range for a scenario.`,
  })
  @ApiOkResponse({
    type: BlmRangeDto,
    isArray: true,
  })
  @Get(`:id/blm/range`)
  async getBlmRange(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<BlmRangeDto> {
    const result = await this.service.getBlmRange(id, req.user.id);

    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        scenarioId: id,
        userId: req.user.id,
        resourceType: scenarioResource.name.plural,
      });
    }

    return BlmRangeDto.fromBlmValues(result.right);
  }

  @ApiOperation({
    description: `Cancel BLM calibration execution.`,
    summary: `Cancel BLM calibration execution.`,
  })
  @Delete(`:id/calibration`)
  async cancelBlmCalibration(
    @Param(`id`, ParseUUIDPipe) id: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<void> {
    const result = await this.service.cancelBlmCalibration(id, req.user.id);

    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        scenarioId: id,
        userId: req.user.id,
        resourceType: scenarioResource.name.plural,
      });
    }
  }

  @ApiOperation({
    description: `Start Scenario Editing session.`,
    summary: `Creates a Lock entity with related scenario
     and user data to prevent other users from editing at the same time.`,
  })
  @ApiOkResponse({ type: ScenarioLockResultSingular })
  @Post(`:id/lock`)
  async startScenarioEditingSession(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<ScenarioLockResultSingular> {
    const result = await this.scenarioAclService.acquireLock(req.user.id, id);

    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        scenarioId: id,
        userId: req.user.id,
        resourceType: scenarioResource.name.plural,
      });
    }
    return { data: result.right };
  }

  @ApiOperation({
    description: `End Scenario Editing session.`,
    summary: `Deletes the lock created on a scenario so other
    users can start editing the scenario.`,
  })
  @ApiNoContentResponse({
    status: 204,
    description: 'Lock was released correctly',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(`:id/lock`)
  async endScenarioEditingSession(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<void> {
    const result = await this.service.releaseLock(id, req.user.id);

    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        scenarioId: id,
        userId: req.user.id,
        resourceType: scenarioResource.name.plural,
      });
    }
  }

  @Get(':scenarioId/editing-locks')
  @ApiOperation({
    summary: 'Get lock for scenario if it exists. Otherwise, it returns null',
  })
  @ApiOkResponse({ type: ScenarioLockResultPlural })
  async findLocksForScenariosWithinParentProject(
    @Param('scenarioId', ParseUUIDPipe) scenarioId: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<ScenarioLockResultSingular> {
    const result = await this.service.findLock(scenarioId, req.user.id);

    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        scenarioId,
        userId: req.user.id,
        resourceType: scenarioResource.name.plural,
      });
    }

    return result.right;
  }

  @ApiOperation({ description: 'Get PDF summary report for scenario' })
  @ApiOkResponse()
  @Header('content-type', 'application/pdf')
  @Post('/:scenarioId/solutions/report')
  async getSummaryReportForProject(
    @Body() config: WebshotSummaryReportConfig,
    @Param('scenarioId', ParseUUIDPipe) scenarioId: string,
    @Res() res: Response,
    @Req() req: RequestWithAuthenticatedUser,
    @AppSessionToken() appSessionToken: string,
  ): Promise<any> {
    /**
     * If a frontend app session token was provided via cookie, use this to let
     * the webshot service authenticate to the app, otherwise fall back to
     * looking for the relevant cookies in the body of the request.
     *
     * @todo Remove this once the new auth workflow via `Cookie` header is
     * stable.
     */
    const configForWebshot = appSessionToken
      ? {
          ...config,
          cookie: appSessionToken,
        }
      : config;
    // @debt Refactor to use @nestjs/common's StreamableFile
    // (https://docs.nestjs.com/techniques/streaming-files#streamable-file-class)
    // after upgrading NestJS to v8.
    const scenario = await this.service.getById(scenarioId, {
      authenticatedUser: req.user,
    });

    if (isLeft(scenario)) {
      throw mapAclDomainToHttpError(scenario.left, {
        scenarioId,
        userId: req.user.id,
        resourceType: scenarioResource.name.plural,
      });
    }

    const pdfStream = await this.webshotService.getSummaryReportForScenario(
      scenarioId,
      scenario.right.projectId,
      configForWebshot,
    );

    if (isLeft(pdfStream)) {
      return new InternalServerErrorException(
        'Unexpected error while preparing scenario solutions report.',
      );
    }

    pdfStream.right.pipe(res);
  }
}
