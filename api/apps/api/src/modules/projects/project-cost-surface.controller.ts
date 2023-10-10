import {
  Body,
  Controller,
  ForbiddenException,
  Delete,
  forwardRef,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { apiGlobalPrefixes } from '@marxan-api/api.config';
import { ApiConsumesShapefile } from '@marxan-api/decorators/shapefile.decorator';
import {
  GeometryFileInterceptor,
  GeometryKind,
} from '@marxan-api/decorators/file-interceptors.decorator';
import { asyncJobTag } from '@marxan-api/dto/async-job-tag';
import { RequestWithAuthenticatedUser } from '@marxan-api/app.controller';
import { isLeft } from 'fp-ts/Either';
import { mapAclDomainToHttpError } from '@marxan-api/utils/acl.utils';
import { scenarioResource } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { ScenariosService } from '@marxan-api/modules/scenarios/scenarios.service';
import { CostRangeDto } from '@marxan-api/modules/scenarios/dto/cost-range.dto';
import { plainToClass } from 'class-transformer';
import { JwtAuthGuard } from '@marxan-api/guards/jwt-auth.guard';
import { ImplementsAcl } from '@marxan-api/decorators/acl.decorator';
import { CostSurfaceService } from '@marxan-api/modules/cost-surface/cost-surface.service';
import { UploadCostSurfaceShapefileDto } from '@marxan-api/modules/cost-surface/dto/upload-cost-surface-shapefile.dto';
import {
  AsyncJobDto,
  JsonApiAsyncJobMeta,
} from '@marxan-api/dto/async-job.dto';
import { ensureShapefileHasRequiredFiles } from '@marxan-api/utils/file-uploads.utils';
import { UpdateCostSurfaceDto } from '@marxan-api/modules/cost-surface/dto/update-cost-surface.dto';
import { CostSurfaceSerializer } from '@marxan-api/modules/cost-surface/dto/cost-surface.serializer';
import { Response } from 'express';
import { ProxyService } from '@marxan-api/modules/proxy/proxy.service';
import {
  costSurfaceResource,
  CostSurfaceResult,
  CostSurfaceResultPlural,
  JSONAPICostSurface,
} from '@marxan-api/modules/cost-surface/cost-surface.api.entity';

@ApiTags('Project - Cost Surfaces')
@Controller(`${apiGlobalPrefixes.v1}/projects`)
export class ProjectCostSurfaceController {
  constructor(
    @Inject(forwardRef(() => ScenariosService))
    public readonly scenarioService: ScenariosService,
    public readonly costSurfaceService: CostSurfaceService,
    public readonly costSurfaceSeralizer: CostSurfaceSerializer,
    private readonly proxyService: ProxyService,
  ) {}

  @ImplementsAcl()
  @UseGuards(JwtAuthGuard)
  @Get(`:projectId/cost-surfaces/:costSurfaceId`)
  @ApiOkResponse({ type: CostSurfaceResult })
  async getCostSurfaces(
    @Param('projectId') projectId: string,
    @Param('costSurfaceId') costSurfaceId: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<void> {
    const result = await this.costSurfaceService.getCostSurface(
      req.user.id,
      projectId,
      costSurfaceId,
    );

    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        projectId,
        userId: req.user.id,
        resourceType: costSurfaceResource.name.plural,
      });
    }

    return this.costSurfaceSeralizer.serialize(result.right);
  }

  @ImplementsAcl()
  @UseGuards(JwtAuthGuard)
  @Get(`:projectId/cost-surfaces/`)
  @ApiOkResponse({ type: CostSurfaceResultPlural })
  async getCostSurface(
    @Param('projectId') projectId: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<void> {
    const result = await this.costSurfaceService.getCostSurfaces(
      req.user.id,
      projectId,
    );

    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        projectId,
        userId: req.user.id,
        resourceType: costSurfaceResource.name.plural,
      });
    }

    return this.costSurfaceSeralizer.serialize(result.right);
  }

  @ImplementsAcl()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ description: 'To be implemented' })
  @ApiConsumesShapefile({ withGeoJsonResponse: false })
  @GeometryFileInterceptor(GeometryKind.Complex)
  @ApiTags(asyncJobTag)
  @Post(`:projectId/cost-surfaces/shapefile`)
  async processCostSurfaceShapefile(
    @Param('projectId') projectId: string,
    @Req() req: RequestWithAuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadCostSurfaceShapefileDto,
  ): Promise<JsonApiAsyncJobMeta> {
    await ensureShapefileHasRequiredFiles(file);

    const result = await this.costSurfaceService.uploadCostSurfaceShapefile(
      req.user.id,
      projectId,
      dto,
      file,
    );

    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        projectId,
        userId: req.user.id,
        resourceType: scenarioResource.name.plural,
      });
    }
    return AsyncJobDto.forProject().asJsonApiMetadata();
  }

  @ImplementsAcl()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: 'Updates the Cost Surface with the data from the provided DTO',
  })
  @ApiParam({
    name: 'costSurfaceId',
    description: 'The id of the Cost Surface to be updated',
  })
  @ApiParam({
    name: 'projectId',
    description: 'The id of the Project that the Cost Surface is associated to',
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @Patch(`:projectId/cost-surfaces/:costSurfaceId`)
  async updateCostSurface(
    @Param('projectId') projectId: string,
    @Param('costSurfaceId') costSurfaceId: string,
    @Req() req: RequestWithAuthenticatedUser,
    @Body() dto: UpdateCostSurfaceDto,
  ): Promise<JSONAPICostSurface> {
    const result = await this.costSurfaceService.update(
      req.user.id,
      projectId,
      costSurfaceId,
      dto,
    );

    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        projectId,
        costSurfaceId,
        userId: req.user.id,
      });
    }

    return this.costSurfaceSeralizer.serialize(result.right);
  }

  @ImplementsAcl()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ description: 'Delete CostSurface' })
  @ApiOkResponse()
  @ApiParam({
    name: 'costSurfaceId',
    description: 'The id of the Cost Surface to be deleted',
  })
  @ApiParam({
    name: 'projectId',
    description: 'The id of the Project that the Cost Surface is associated to',
  })
  @Delete(`:projectId/cost-surfaces/:costSurfaceId`)
  async deleteCostSurface(
    @Param('projectId') projectId: string,
    @Param('costSurfaceId') costSurfaceId: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<void> {
    const result = await this.costSurfaceService.deleteCostSurface(
      req.user.id,
      projectId,
      costSurfaceId,
    );
    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        projectId,
        costSurfaceId,
        userId: req.user.id,
      });
    }
  }

  @ImplementsAcl()
  @UseGuards(JwtAuthGuard)
  @ApiParam({
    name: 'costSurfaceId',
    description:
      'The id of the Cost Surface for which to retrieve [min,max] cost range',
  })
  @ApiParam({
    name: 'projectId',
    description: 'The id of the Project that the Cost Surface is associated to',
  })
  @Get(`:projectId/cost-surfaces/:costSurfaceId/cost-range`)
  @ApiOkResponse({ type: CostRangeDto })
  async getCostRange(
    @Param('projectId') projectId: string,
    @Param('costSurfaceId') costSurfaceId: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<CostRangeDto> {
    const result = await this.costSurfaceService.getCostSurfaceRange(
      costSurfaceId,
      projectId,
      req.user.id,
    );

    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        projectId,
        costSurfaceId,
        userId: req.user.id,
      });
    }

    return plainToClass<CostRangeDto, CostRangeDto>(CostRangeDto, result.right);
  }

  @ImplementsAcl()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: 'Get cost surface tiles.',
  })
  @ApiParam({
    name: 'costSurfaceId',
    description:
      'The id of the Cost Surface for which to retrieve [min,max] cost range',
  })
  @ApiParam({
    name: 'projectId',
    description: 'The id of the Project that the Cost Surface is associated to',
  })
  @ApiParam({
    name: 'z',
    description: 'The zoom level ranging from 0 - 20',
    type: Number,
    required: true,
  })
  @ApiParam({
    name: 'x',
    description: 'The tile x offset on Mercator Projection',
    type: Number,
    required: true,
  })
  @ApiParam({
    name: 'y',
    description: 'The tile y offset on Mercator Projection',
    type: Number,
    required: true,
  })
  @Get(':projectId/cost-surfaces/:costSurfaceId/preview/tiles/:z/:x/:y.mvt')
  async proxyCostSurfaceTile(
    @Req() req: RequestWithAuthenticatedUser,
    @Res() response: Response,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('costSurfaceId', ParseUUIDPipe) costSurfaceId: string,
  ): Promise<void> {
    const checkCostSurfaceForProject = await this.costSurfaceService.checkProjectCostSurfaceVisibility(
      req.user.id,
      projectId,
      costSurfaceId,
    );
    if (isLeft(checkCostSurfaceForProject)) {
      throw new ForbiddenException();
    }

    req.url = req.url.replace(
      `projects/${projectId}/`,
      ``,
    );

    return await this.proxyService.proxyTileRequest(req, response);
  }
}
