import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import {
  JobStatus,
  scenarioResource,
  ScenarioResult,
} from './scenario.api.entity';
import { Request, Response } from 'express';
import { ScenariosService } from './scenarios.service';
import {
  FetchSpecification,
  ProcessFetchSpecification,
} from 'nestjs-base-service';

import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { apiGlobalPrefixes } from 'api.config';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';

import {
  JSONAPIQueryParams,
  JSONAPISingleEntityQueryParams,
} from 'decorators/json-api-parameters.decorator';
import { CreateScenarioDTO } from './dto/create.scenario.dto';
import { UpdateScenarioDTO } from './dto/update.scenario.dto';
import { RequestWithAuthenticatedUser } from 'app.controller';

import { ScenarioFeaturesService } from '../scenarios-features';
import { RemoteScenarioFeaturesData } from '../scenarios-features/entities/remote-scenario-features-data.geo.entity';
import { ProcessingStatusDto } from './dto/processing-status.dto';
import { UpdateScenarioPlanningUnitLockStatusDto } from './dto/update-scenario-planning-unit-lock-status.dto';
import { uploadOptions } from 'utils/file-uploads.utils';
import { ProxyService } from 'modules/proxy/proxy.service';
import { ShapefileGeoJSONResponseDTO } from './dto/shapefile.geojson.response.dto';
import { AdjustPlanningUnits } from '../analysis/entry-points/adjust-planning-units';
import {
  ApiConsumesShape,
  ApiConsumesShapefile,
} from 'decorators/shapefile.decorator';
import { CostSurfaceFacade } from './cost-surface/cost-surface.facade';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags(scenarioResource.className)
@Controller(`${apiGlobalPrefixes.v1}/scenarios`)
export class ScenariosController {
  constructor(
    public readonly service: ScenariosService,
    private readonly proxyService: ProxyService,
    private readonly scenarioFeatures: ScenarioFeaturesService,
    private readonly updatePlanningUnits: AdjustPlanningUnits,
    private readonly costSurface: CostSurfaceFacade,
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
  @Get()
  async findAll(
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
  ): Promise<ScenarioResult> {
    const results = await this.service.findAllPaginated(fetchSpecification, {});
    return this.service.serialize(results.data, results.metadata);
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
    return await this.service.serialize(
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
    return await this.service.serialize(
      await this.service.create(dto, { authenticatedUser: req.user }),
    );
  }

  @ApiConsumesShape()
  @ApiNoContentResponse()
  @Post(`:id/cost-surface/shapefile`)
  async processCostSurfaceShapefile(
    @Param('id') scenarioId: string,
    @Req() request: Request,
  ): Promise<void> {
    // TODO #1 pre-validate scenarioId
    /**
     * Could be via interceptor
     * (would require to not include @Res() and force-ignore http-proxy needs)
     * or just ...BaseService
     */

    this.costSurface.convert(scenarioId, request);
    return;
  }

  // TODO add Validations
  @ApiConsumesShapefile()
  @Post(':id/planning-unit-shapefile')
  //@UseInterceptors(FileInterceptor('file', uploadOptions))
  async uploadLockInShapeFile(
    @Param('id') scenarioId: string,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<ShapefileGeoJSONResponseDTO> {
    await this.service.getById(scenarioId);
    const proxyServiceResponse = await this.proxyService.proxyUploadShapeFile(
      request,
      response,
    );
    return proxyServiceResponse;
  }

  @ApiOperation({ description: 'Update scenario' })
  @ApiOkResponse({ type: ScenarioResult })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) dto: UpdateScenarioDTO,
  ): Promise<ScenarioResult> {
    return await this.service.serialize(await this.service.update(id, dto));
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
    // TODO implement more flexible error results to propagate 4xx
    await this.updatePlanningUnits.update(id, {
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

  @Get(':id/planning-units')
  async planningUnitsStatus(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProcessingStatusDto> {
    // TODO call analysis-module's service

    // TODO where exactly we should look for the status?
    return {
      status: JobStatus.running,
    };
  }

  @ApiOperation({ description: `Resolve scenario's features pre-gap data.` })
  @ApiOkResponse({
    type: RemoteScenarioFeaturesData,
  })
  @Get(':id/features')
  async getScenarioFeatures(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Partial<RemoteScenarioFeaturesData>[]> {
    return this.scenarioFeatures.serialize(
      (
        await this.scenarioFeatures.findAll(undefined, {
          params: {
            scenarioId: id,
          },
        })
      )[0],
    );
  }
}
