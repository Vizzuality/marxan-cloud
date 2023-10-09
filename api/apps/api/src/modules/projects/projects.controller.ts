import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Header,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';

import { projectResource, ProjectResultSingular } from './project.api.entity';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import { apiGlobalPrefixes } from '@marxan-api/api.config';
import { JwtAuthGuard } from '@marxan-api/guards/jwt-auth.guard';
import {
  ensureShapefileHasRequiredFiles,
} from '@marxan-api/utils/file-uploads.utils';

import { UpdateProjectDTO } from './dto/update.project.dto';
import { CreateProjectDTO } from './dto/create.project.dto';
import { RequestWithAuthenticatedUser } from '@marxan-api/app.controller';
import { ApiConsumesShapefile } from '../../decorators/shapefile.decorator';
import {
  ProjectsService,
  validationFailed,
} from './projects.service';
import { ProjectSerializer } from './dto/project.serializer';
import { ProjectJobsStatusDto } from './dto/project-jobs-status.dto';
import { JobStatusSerializer } from './dto/job-status.serializer';
import { PlanningAreaResponseDto } from './dto/planning-area-response.dto';
import { isLeft } from 'fp-ts/Either';
import { asyncJobTag } from '@marxan-api/dto/async-job-tag';
import { inlineJobTag } from '@marxan-api/dto/inline-job-tag';
import { UpdateProjectBlmRangeDTO } from '@marxan-api/modules/projects/dto/update-project-blm-range.dto';
import { invalidRange } from '@marxan-api/modules/projects/blm';
import {
  planningUnitAreaNotFound,
  updateFailure,
} from '@marxan-api/modules/projects/blm/change-project-blm-range.command';
import { ProjectBlmValuesResponseDto } from '@marxan-api/modules/projects/dto/project-blm-values-response.dto';
import {
  GeometryFileInterceptor,
  GeometryKind,
} from '@marxan-api/decorators/file-interceptors.decorator';
import { forbiddenError } from '@marxan-api/modules/access-control';
import {
  projectNotFound as blmProjectNotFound,
  unknownError as blmUnknownError,
} from '../blm';
import { Response } from 'express';
import {
  ImplementsAcl,
  IsMissingAclImplementation,
} from '@marxan-api/decorators/acl.decorator';
import { ScenarioLockResultPlural } from '@marxan-api/modules/access-control/scenarios-acl/locks/dto/scenario.lock.dto';
import { ProxyService } from '@marxan-api/modules/proxy/proxy.service';
import { TilesOpenApi } from '@marxan/tiles';
import { mapAclDomainToHttpError } from '@marxan-api/utils/acl.utils';
import { deleteProjectFailed } from './delete-project/delete-project.command';
import { outputProjectSummaryResource } from './output-project-summaries/output-project-summary.api.entity';
import { UploadShapefileDto } from '@marxan-api/modules/scenarios/dto/upload.shapefile.dto';
import {
  AsyncJobDto,
  JsonApiAsyncJobMeta,
} from '@marxan-api/dto/async-job.dto';
import { scenarioResource } from '@marxan-api/modules/scenarios/scenario.api.entity';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags(projectResource.className)
@Controller(`${apiGlobalPrefixes.v1}/projects`)
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly projectSerializer: ProjectSerializer,
    private readonly jobsStatusSerializer: JobStatusSerializer,
    private readonly proxyService: ProxyService,
  ) {}

  @ImplementsAcl()
  @ApiOperation({ description: 'Create project' })
  @ApiOkResponse({ type: ProjectResultSingular })
  @ApiTags(asyncJobTag)
  @Post()
  async create(
    @Body() dto: CreateProjectDTO,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<ProjectResultSingular> {
    const result = await this.projectsService.create(dto, {
      authenticatedUser: req.user,
    });

    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        userId: req.user.id,
        resourceType: projectResource.name.plural,
      });
    }

    return await this.projectSerializer.serialize(
      result.right,
      undefined,
      true,
    );
  }

  @ImplementsAcl()
  @ApiOperation({ description: 'Update project' })
  @ApiOkResponse({ type: ProjectResultSingular })
  @ApiTags(asyncJobTag)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDTO,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<ProjectResultSingular> {
    const result = await this.projectsService.update(id, dto, req.user.id);

    if (isLeft(result)) {
      throw new ForbiddenException();
    }
    return await this.projectSerializer.serialize(
      result.right,
      undefined,
      true,
    );
  }

  @ImplementsAcl()
  @ApiOperation({ description: 'Delete project' })
  @ApiOkResponse()
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<void> {
    const result = await this.projectsService.remove(id, req.user.id);

    if (isLeft(result)) {
      switch (result.left) {
        case deleteProjectFailed:
          throw new InternalServerErrorException();
        case false:
          throw new ForbiddenException();
      }
    }
    return;
  }

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
  @ApiOperation({
    description: `Find running jobs for each scenario under given project`,
  })
  @ApiOkResponse({ type: ProjectJobsStatusDto })
  @Get(`:id/scenarios/status`)
  async getJobsForProjectScenarios(
    @Param('id') projectId: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<ProjectJobsStatusDto> {
    const projectWithScenarios = await this.projectsService.getJobStatusFor(
      projectId,
      {
        authenticatedUser: req.user,
      },
    );
    return this.jobsStatusSerializer.serialize(projectId, projectWithScenarios);
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

  @ImplementsAcl()
  @ApiOperation({
    description: 'Updates the project BLM range and calculate its values',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the Project',
  })
  @ApiOkResponse({ type: ProjectBlmValuesResponseDto })
  @ApiTags(inlineJobTag)
  @Patch(':id/calibration')
  async updateBlmRange(
    @Param('id') id: string,
    @Body() { range }: UpdateProjectBlmRangeDTO,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<ProjectBlmValuesResponseDto> {
    const result = await this.projectsService.updateBlmValues(
      id,
      req.user.id,
      range,
    );

    if (isLeft(result)) {
      switch (result.left) {
        case invalidRange:
          throw new BadRequestException(`Invalid range: ${range}`);
        case planningUnitAreaNotFound:
          throw new NotFoundException(
            `Could not find project BLM values for project with ID: ${id}`,
          );
        case updateFailure:
          throw new InternalServerErrorException(
            `Could not update with range ${range} project BLM values for project with ID: ${id}`,
          );
        case forbiddenError:
          throw new ForbiddenException();
        default:
          throw new InternalServerErrorException();
      }
    }

    return result.right;
  }

  @ImplementsAcl()
  @ApiOperation({
    description: 'Shows the project BLM values of a project',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the Project',
  })
  @ApiOkResponse({ type: ProjectBlmValuesResponseDto })
  @ApiTags(inlineJobTag)
  @Get(':id/calibration')
  async getProjectBlmValues(
    @Param('id') id: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<ProjectBlmValuesResponseDto> {
    const result = await this.projectsService.findProjectBlm(id, req.user.id);

    if (isLeft(result))
      switch (result.left) {
        case blmProjectNotFound:
          throw new NotFoundException(
            `Could not find project BLM values for project with ID: ${id}`,
          );
        case forbiddenError:
          throw new ForbiddenException();
        case blmUnknownError:
          throw new InternalServerErrorException();
        default:
          const _exhaustiveCheck: never = result.left;
          throw _exhaustiveCheck;
      }
    return result.right;
  }

  @ImplementsAcl()
  @ApiOperation({
    description:
      "Returns a zip file containing CSVs with summary information for the execution of all the Project's Scenarios",
  })
  @ApiParam({ name: 'projectId', description: 'Id of the Project' })
  @ApiProduces('application/zip')
  @Header('Content-Type', 'application/zip')
  @Get(':projectId/output-summary')
  async getOutputSummary(
    @Param('projectId') projectId: string,
    @Req() req: RequestWithAuthenticatedUser,
    @Res() response: Response,
  ) {
    const result = await this.projectsService.getOutputSummary(
      req.user.id,
      projectId,
    );

    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        resourceType: outputProjectSummaryResource.name.singular,
        projectId,
        userId: req.user.id,
      });
    }

    response.set(
      'Content-Disposition',
      `attachment; filename="output-summary-${projectId}"`,
    );

    response.send(result.right); // @debt should refactored to use StreameableFile or at least use streams, but doesn't seem to work right away
  }

  @ImplementsAcl()
  @Get(':projectId/editing-locks')
  @ApiOperation({ summary: 'Get all locks by project' })
  async findLocksForProject(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<ScenarioLockResultPlural> {
    const result = await this.projectsService.findAllLocks(
      projectId,
      req.user.id,
    );
    if (isLeft(result)) {
      throw new ForbiddenException();
    }

    return result.right;
  }

  @ImplementsAcl()
  @ApiConsumesShapefile({ withGeoJsonResponse: false })
  @ApiOperation({
    description: 'Upload shapefile with protected areas for project',
  })
  @GeometryFileInterceptor(GeometryKind.Complex)
  @ApiTags(asyncJobTag)
  @Post(':id/protected-areas/shapefile')
  async shapefileForProtectedArea(
    @Param('id') projectId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithAuthenticatedUser,
    @Body() dto: UploadShapefileDto,
  ): Promise<JsonApiAsyncJobMeta> {
    const outcome = await this.projectsService.addProtectedAreaFor(
      projectId,
      file,
      { authenticatedUser: req.user },
      dto,
    );
    if (isLeft(outcome)) {
      if (isLeft(outcome)) {
        throw mapAclDomainToHttpError(outcome.left, {
          projectId,
          userId: req.user.id,
          resourceType: scenarioResource.name.plural,
        });
      }
    }

    return AsyncJobDto.forProject().asJsonApiMetadata();
  }
}
