import {
  BadRequestException, Controller, ForbiddenException,
  Get, InternalServerErrorException, Param,
  ParseIntPipe,
  ParseUUIDPipe, Post,
  Req,
  Res,
  UploadedFile,
  UseGuards
} from '@nestjs/common';

import { projectResource } from './project.api.entity';
import {
  ApiBearerAuth,
  ApiCreatedResponse, ApiOperation,
  ApiParam, ApiTags
} from '@nestjs/swagger';
import { apiGlobalPrefixes } from '@marxan-api/api.config';
import { JwtAuthGuard } from '@marxan-api/guards/jwt-auth.guard';
import {
  ensureShapefileHasRequiredFiles,
} from '@marxan-api/utils/file-uploads.utils';

import { RequestWithAuthenticatedUser } from '@marxan-api/app.controller';
import { ApiConsumesShapefile } from '../../decorators/shapefile.decorator';
import {
  ProjectsService,
  validationFailed,
} from './projects.service';
import { PlanningAreaResponseDto } from './dto/planning-area-response.dto';
import { isLeft } from 'fp-ts/Either';
import { asyncJobTag } from '@marxan-api/dto/async-job-tag';
import { inlineJobTag } from '@marxan-api/dto/inline-job-tag';
import {
  GeometryFileInterceptor,
  GeometryKind,
} from '@marxan-api/decorators/file-interceptors.decorator';
import { Response } from 'express';
import {
  ImplementsAcl,
  IsMissingAclImplementation,
} from '@marxan-api/decorators/acl.decorator';
import { ProxyService } from '@marxan-api/modules/proxy/proxy.service';
import { TilesOpenApi } from '@marxan/tiles';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Project - planning area and planning grid')
@Controller(`${apiGlobalPrefixes.v1}/projects`)
export class ProjectPlanningAreaAndGridController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly proxyService: ProxyService,
  ) {}

  @IsMissingAclImplementation()
  @ApiConsumesShapefile({ withGeoJsonResponse: false })
  @ApiOperation({
    description: 'Upload shapefile for project-specific planning unit grid',
  })
  @GeometryFileInterceptor(GeometryKind.Complex)
  @ApiCreatedResponse({ type: PlanningAreaResponseDto })
  @ApiTags(asyncJobTag)
  @Post(`planning-area/shapefile-grid`)
  async uploadCustomGridShapefile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<PlanningAreaResponseDto> {
    await ensureShapefileHasRequiredFiles(file);

    const result = await this.projectsService.savePlanningAreaFromShapefile(
      file,
      true,
    );
    if (isLeft(result)) {
      throw new InternalServerErrorException(result.left);
    }
    return result.right;
  }

  @IsMissingAclImplementation()
  @ApiConsumesShapefile({
    withGeoJsonResponse: true,
    type: PlanningAreaResponseDto,
    description: 'Upload shapefile with project planning-area',
  })
  @GeometryFileInterceptor(GeometryKind.Simple)
  @ApiTags(inlineJobTag)
  @Post('planning-area/shapefile')
  async shapefileWithProjectPlanningArea(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<PlanningAreaResponseDto> {
    await ensureShapefileHasRequiredFiles(file);

    const result = await this.projectsService.savePlanningAreaFromShapefile(
      file,
    );
    if (isLeft(result)) {
      const mapping: Record<typeof result['left'], () => never> = {
        [validationFailed]: () => {
          throw new BadRequestException();
        },
      };
      mapping[result.left]();
      throw new InternalServerErrorException();
    }

    return result.right;
  }

  @ImplementsAcl()
  @TilesOpenApi()
  @ApiOperation({
    description: 'Get planning area grid tiles for user uploaded grid.',
  })
  @ApiParam({
    name: 'id',
    description: 'planning area id',
    type: String,
    required: true,
    example: 'e5c3b978-908c-49d3-b1e3-89727e9f999c',
  })
  @Get('planning-area/:id/grid/preview/tiles/:z/:x/:y.mvt')
  async proxyPlanningAreaGridTile(
    @Req() req: RequestWithAuthenticatedUser,
    @Res() response: Response,
    @Param('id', ParseUUIDPipe) planningAreaId: string,
  ) {
    const checkPlanningAreaBelongsToProject = await this.projectsService.doesPlanningAreaBelongToProjectAndCanUserViewIt(
      planningAreaId,
      req.user.id,
    );
    if (isLeft(checkPlanningAreaBelongsToProject)) {
      throw new ForbiddenException();
    }
    return await this.proxyService.proxyTileRequest(req, response);
  }

  @ImplementsAcl()
  @TilesOpenApi()
  @ApiOperation({
    description: 'Get planning area tiles for uploaded planning area.',
  })
  @ApiParam({
    name: 'id',
    description: 'Scenario id',
    type: String,
    required: true,
    example: 'e5c3b978-908c-49d3-b1e3-89727e9f999c',
  })
  @Get('planning-area/:id/preview/tiles/:z/:x/:y.mvt')
  async proxyPlanningAreaTile(
    @Req() req: RequestWithAuthenticatedUser,
    @Res() response: Response,
    @Param('id', ParseUUIDPipe) planningAreaId: string,
  ): Promise<void> {
    const checkPlanningAreaBelongsToProject = await this.projectsService.doesPlanningAreaBelongToProjectAndCanUserViewIt(
      planningAreaId,
      req.user.id,
    );
    if (isLeft(checkPlanningAreaBelongsToProject)) {
      throw new ForbiddenException();
    }

    return await this.proxyService.proxyTileRequest(req, response);
  }

  @ImplementsAcl()
  @TilesOpenApi()
  @ApiOperation({
    description: 'Get planning area tiles for project planning area.',
  })
  @ApiParam({
    name: 'projectId',
    description: 'Scenario id',
    type: String,
    required: true,
    example: 'e5c3b978-908c-49d3-b1e3-89727e9f999c',
  })
  @Get(':projectId/planning-area/tiles/:z/:x/:y.mvt')
  async proxyProjectPlanningAreaTile(
    @Req() req: RequestWithAuthenticatedUser,
    @Res() response: Response,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('z', ParseIntPipe) z: number,
    @Param('x', ParseIntPipe) x: number,
    @Param('y', ParseIntPipe) y: number,
  ) {
    const checkPlanningAreaBelongsToProject = await this.projectsService.doesPlanningAreaBelongToProjectAndCanUserViewIt(
      projectId,
      req.user.id,
    );
    if (isLeft(checkPlanningAreaBelongsToProject)) {
      throw new ForbiddenException();
    }

    const result = await this.projectsService.getActualUrlForProjectPlanningAreaTiles(
      projectId,
      req.user.id,
      z,
      x,
      y,
    );

    if (isLeft(result)) {
      throw new ForbiddenException();
    }
    req.url = req.url.replace(result.right.from, result.right.to);
    req.originalUrl = req.originalUrl.replace(
      result.right.from,
      result.right.to,
    );

    return await this.proxyService.proxyTileRequest(req, response);
  }

  @ImplementsAcl()
  @TilesOpenApi()
  @ApiOperation({
    description: 'Get planning area grid tiles for project grid.',
  })
  @ApiParam({
    name: 'projectId',
    description: 'Scenario id',
    type: String,
    required: true,
    example: 'e5c3b978-908c-49d3-b1e3-89727e9f999c',
  })
  @Get(':projectId/grid/tiles/:z/:x/:y.mvt')
  async proxyProjectPlanningUnitsTile(
    @Req() req: RequestWithAuthenticatedUser,
    @Res() response: Response,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('z', ParseIntPipe) z: number,
    @Param('x', ParseIntPipe) x: number,
    @Param('y', ParseIntPipe) y: number,
  ) {
    const checkPlanningAreaBelongsToProject = await this.projectsService.doesPlanningAreaBelongToProjectAndCanUserViewIt(
      projectId,
      req.user.id,
    );
    if (isLeft(checkPlanningAreaBelongsToProject)) {
      throw new ForbiddenException();
    }

    const result = await this.projectsService.getActualUrlForProjectPlanningGridTiles(
      projectId,
      req.user.id,
      z,
      x,
      y,
    );

    if (isLeft(result)) {
      throw new ForbiddenException();
    }

    req.url = req.url.replace(result.right.from, result.right.to);
    req.originalUrl = req.originalUrl.replace(
      result.right.from,
      result.right.to,
    );

    req.query = result.right.query;

    return await this.proxyService.proxyTileRequest(req, response);
  }
}
