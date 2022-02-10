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
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  Project,
  projectResource,
  ProjectResultSingular,
} from './project.api.entity';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { apiGlobalPrefixes } from '@marxan-api/api.config';
import { JwtAuthGuard } from '@marxan-api/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { uploadOptions } from '@marxan-api/utils/file-uploads.utils';

import { JSONAPIQueryParams } from '@marxan-api/decorators/json-api-parameters.decorator';
import { UpdateProjectDTO } from './dto/update.project.dto';
import { CreateProjectDTO } from './dto/create.project.dto';
import { RequestWithAuthenticatedUser } from '@marxan-api/app.controller';
import {
  FetchSpecification,
  ProcessFetchSpecification,
} from 'nestjs-base-service';
import { GeoFeatureResult } from '@marxan-api/modules/geo-features/geo-feature.api.entity';
import { ApiConsumesShapefile } from '../../decorators/shapefile.decorator';
import {
  exportNotFound,
  notAllowed,
  projectNotFound,
  ProjectsService,
  validationFailed,
} from './projects.service';
import { GeoFeatureSerializer } from './dto/geo-feature.serializer';
import { ProjectSerializer } from './dto/project.serializer';
import { ProjectJobsStatusDto } from './dto/project-jobs-status.dto';
import { JobStatusSerializer } from './dto/job-status.serializer';
import { PlanningAreaResponseDto } from './dto/planning-area-response.dto';
import { isLeft } from 'fp-ts/Either';
import { ShapefileUploadResponse } from './dto/project-upload-shapefile.dto';
import { UploadShapefileDTO } from './dto/upload-shapefile.dto';
import { GeoFeaturesService } from '@marxan-api/modules/geo-features';
import { ShapefileService } from '@marxan/shapefile-converter';
import { isFeatureCollection } from '@marxan/utils';
import { asyncJobTag } from '@marxan-api/dto/async-job-tag';
import { inlineJobTag } from '@marxan-api/dto/inline-job-tag';
import { FeatureTags } from '@marxan-api/modules/geo-features/geo-feature-set.api.entity';
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
import { projectNotFound as blmProjectNotFound, unknownError } from '../blm';
import { Response } from 'express';
import {
  ImplementsAcl,
  IsMissingAclImplementation,
} from '@marxan-api/decorators/acl.decorator';
import { locationNotFound } from '@marxan-api/modules/clone/export/application/get-archive.query';
import { RequestProjectExportResponseDto } from './dto/export.project.response.dto';
import { ScenarioLockResultPlural } from '@marxan-api/modules/access-control/scenarios-acl/locks/dto/scenario.lock.dto';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags(projectResource.className)
@Controller(`${apiGlobalPrefixes.v1}/projects`)
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly geoFeatureSerializer: GeoFeatureSerializer,
    private readonly geoFeatureService: GeoFeaturesService,
    private readonly projectSerializer: ProjectSerializer,
    private readonly jobsStatusSerializer: JobStatusSerializer,
    private readonly shapefileService: ShapefileService,
  ) {}

  @IsMissingAclImplementation()
  @ApiOperation({
    description: 'Find all geo features',
  })
  @ApiOkResponse({
    type: GeoFeatureResult,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @JSONAPIQueryParams()
  @Get(':projectId/features')
  async findAllGeoFeaturesForProject(
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Req() req: RequestWithAuthenticatedUser,
    @Query('q') featureClassAndAliasFilter?: string,
    @Query('tag') featureTag?: FeatureTags,
  ): Promise<GeoFeatureResult> {
    const result = await this.projectsService.findAllGeoFeatures(
      fetchSpecification,
      {
        authenticatedUser: req.user,
        params: {
          projectId: projectId,
          featureClassAndAliasFilter: featureClassAndAliasFilter,
          featureTag,
        },
      },
    );
    if (isLeft(result)) {
      throw new NotFoundException();
    }
    const { data, metadata } = result.right;

    return this.geoFeatureSerializer.serialize(data, metadata);
  }

  /**
   * Import a Marxan legacy project via file upload
   *
   * @debt We may want to use a custom interceptor to process import files
   */
  @ImplementsAcl()
  @ApiOperation({
    description: 'Import a Marxan project via file upload',
    summary: 'Import a Marxan project',
  })
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  @Post('legacy')
  async importLegacyProject(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<Project> {
    const result = await this.projectsService.importLegacyProject(
      file,
      req.user.id,
    );

    if (isLeft(result)) {
      throw new ForbiddenException();
    }

    return result.right;
  }

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
      throw new ForbiddenException();
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
      throw new ForbiddenException();
    }
    return result.right;
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

  @IsMissingAclImplementation()
  @ApiConsumesShapefile({ withGeoJsonResponse: false })
  @ApiOperation({
    description: `Upload shapefiles of species or bioregional features.`,
  })
  @ApiOkResponse({ type: ShapefileUploadResponse })
  @ApiTags(inlineJobTag)
  @Post(`:id/features/shapefile`)
  @GeometryFileInterceptor(GeometryKind.ComplexWithProperties)
  async uploadFeatures(
    @Param('id') projectId: string,
    @UploadedFile() shapefile: Express.Multer.File,
    @Body() body: UploadShapefileDTO,
  ): Promise<ShapefileUploadResponse> {
    const { data } = await this.shapefileService.transformToGeoJson(shapefile);

    if (!isFeatureCollection(data)) {
      throw new BadRequestException(`Only FeatureCollection is supported.`);
    }

    await this.geoFeatureService.createFeaturesForShapefile(
      projectId,
      body,
      data.features,
    );

    return { success: true };
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
        case unknownError:
          throw new InternalServerErrorException();
        default:
          const _exhaustiveCheck: never = result.left;
          throw _exhaustiveCheck;
      }
    return result.right;
  }

  @ImplementsAcl()
  @ApiParam({
    name: 'projectId',
    description: 'ID of the Project',
  })
  @ApiOkResponse({ type: RequestProjectExportResponseDto })
  @Post(`:projectId/export`)
  async requestProjectExport(
    @Param('projectId') projectId: string,
    @Req() req: RequestWithAuthenticatedUser,
  ) {
    const result = await this.projectsService.requestExport(
      projectId,
      req.user.id,
    );

    if (isLeft(result)) {
      switch (result.left) {
        case forbiddenError:
          throw new ForbiddenException();
        case projectNotFound:
          throw new NotFoundException(
            `Could not find project with ID: ${projectId}`,
          );

        default:
          throw new InternalServerErrorException();
      }
    }
    return {
      id: result.right,
    };
  }

  @ImplementsAcl()
  @ApiParam({
    name: 'projectId',
    description: 'ID of the Project',
  })
  @ApiParam({
    name: 'exportId',
    description: 'ID of the Export',
  })
  @Get(`:projectId/export/:exportId`)
  @Header(`Content-Type`, `application/zip`)
  @Header('Content-Disposition', 'attachment; filename="export.zip"')
  async getProjectExportArchive(
    @Param('projectId') projectId: string,
    @Param('exportId') exportId: string,
    @Res() response: Response,
    @Req() req: RequestWithAuthenticatedUser,
  ) {
    const result = await this.projectsService.getExportedArchive(
      projectId,
      req.user.id,
      exportId,
    );

    if (isLeft(result)) {
      switch (result.left) {
        case locationNotFound:
          throw new NotFoundException(
            `Could not find export .zip location for export with ID: ${exportId} for project with ID: ${projectId}`,
          );
        case notAllowed:
          throw new ForbiddenException(
            `Your role cannot retrieve export .zip files for project with ID: ${projectId}`,
          );
        case projectNotFound:
          throw new NotFoundException(
            `Could not find project with ID: ${projectId}`,
          );

        default:
          throw new InternalServerErrorException();
      }
    }

    result.right.pipe(response);
  }

  @ImplementsAcl()
  @ApiOperation({
    description: 'Returns the latest exportId of a given project',
  })
  @ApiParam({
    name: 'projectId',
    description: 'ID of the Project',
  })
  @ApiOkResponse({ type: RequestProjectExportResponseDto })
  @Get(`:projectId/export`)
  async getLatestExportId(
    @Param('projectId') projectId: string,
    @Req() req: RequestWithAuthenticatedUser,
  ) {
    const exportIdOrError = await this.projectsService.getLatestExportForProject(
      projectId,
      req.user.id,
    );

    if (isLeft(exportIdOrError)) {
      switch (exportIdOrError.left) {
        case exportNotFound:
          throw new NotFoundException(
            `Export for project with id ${projectId} not found`,
          );
        case forbiddenError:
          throw new ForbiddenException();
        default:
          throw new InternalServerErrorException();
      }
    }
    return { id: exportIdOrError.right };
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
}
