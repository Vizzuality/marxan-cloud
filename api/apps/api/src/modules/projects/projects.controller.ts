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
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { projectResource, ProjectResultSingular } from './project.api.entity';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { apiGlobalPrefixes } from '@marxan-api/api.config';
import { JwtAuthGuard } from '@marxan-api/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ensureShapefileHasRequiredFiles,
  uploadOptions,
} from '@marxan-api/utils/file-uploads.utils';

import { JSONAPIQueryParams } from '@marxan-api/decorators/json-api-parameters.decorator';
import { UpdateProjectDTO } from './dto/update.project.dto';
import { CreateProjectDTO } from './dto/create.project.dto';
import { RequestWithAuthenticatedUser } from '@marxan-api/app.controller';
import {
  FetchSpecification,
  ProcessFetchSpecification,
} from 'nestjs-base-service';
import {
  GeoFeature,
  GeoFeatureResult,
} from '@marxan-api/modules/geo-features/geo-feature.api.entity';
import { ApiConsumesShapefile } from '../../decorators/shapefile.decorator';
import {
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
import {
  GetLatestExportResponseDto,
  GetLatestExportsResponseDto,
  RequestProjectCloneResponseDto,
  RequestProjectExportBodyDto,
  RequestProjectExportResponseDto,
  RequestProjectImportBodyDto,
  RequestProjectImportResponseDto,
} from './dto/cloning.project.dto';
import { ScenarioLockResultPlural } from '@marxan-api/modules/access-control/scenarios-acl/locks/dto/scenario.lock.dto';
import { ProxyService } from '@marxan-api/modules/proxy/proxy.service';
import { TilesOpenApi } from '@marxan/tiles';
import { mapAclDomainToHttpError } from '@marxan-api/utils/acl.utils';
import {
  cloningExportProvided,
  invalidExportZipFile,
} from '../clone/infra/import/generate-export-from-zip-file.command';
import {
  integrityCheckFailed,
  invalidSignature,
} from '../clone/export/application/manifest-file-service.port';
import {
  exportNotFound,
  unfinishedExport,
} from '../clone/export/application/get-archive.query';
import {
  AddFileToLegacyProjectImportBodyDto,
  AddFileToLegacyProjectImportResponseDto,
  DeleteFileFromLegacyProjectImportResponseDto,
  GetLegacyProjectImportErrorsResponseDto,
  RunLegacyProjectImportBodyDto,
  RunLegacyProjectImportResponseDto,
  StartLegacyProjectImportBodyDto,
  StartLegacyProjectImportResponseDto,
} from './dto/legacy-project-import.dto';
import {
  legacyProjectImportAlreadyFinished,
  legacyProjectImportAlreadyStarted,
  legacyProjectImportMissingRequiredFile,
} from '../legacy-project-import/domain/legacy-project-import/legacy-project-import';
import {
  legacyProjectImportNotFound,
  legacyProjectImportSaveError,
} from '../legacy-project-import/domain/legacy-project-import/legacy-project-import.repository';
import { deleteProjectFailed } from './delete-project/delete-project.command';
import { updateSolutionsAreLockFailed } from '../legacy-project-import/application/update-solutions-are-locked-to-legacy-project-import.command';
import { blmCreationFailure } from '../scenarios/blm-calibration/create-initial-scenario-blm.command';
import {
  featureIsLinkedToOneOrMoreScenarios,
  featureNotDeletable,
  featureNotFound,
} from '@marxan-api/modules/geo-features/geo-features.service';
import { ApiConsumesCsv } from '@marxan-api/decorators/csv.decorator';
import { UpdateGeoFeatureTagDTO } from '@marxan-api/modules/geo-feature-tags/dto/update-geo-feature-tag.dto';
import { GeoFeatureTagsService } from '@marxan-api/modules/geo-feature-tags/geo-feature-tags.service';
import { GetProjectTagsResponseDto } from '@marxan-api/modules/projects/dto/get-project-tags-response.dto';
import { UpdateProjectTagDTO } from '@marxan-api/modules/projects/dto/update-project-tag.dto';
import { outputProjectSummaryResource } from './output-project-summaries/output-project-summary.api.entity';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags(projectResource.className)
@Controller(`${apiGlobalPrefixes.v1}/projects`)
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly geoFeatureSerializer: GeoFeatureSerializer,
    private readonly geoFeatureService: GeoFeaturesService,
    private readonly geoFeatureTagsService: GeoFeatureTagsService,
    private readonly projectSerializer: ProjectSerializer,
    private readonly jobsStatusSerializer: JobStatusSerializer,
    private readonly shapefileService: ShapefileService,
    private readonly proxyService: ProxyService,
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
  ): Promise<GeoFeatureResult> {
    const result = await this.projectsService.findAllGeoFeatures(
      fetchSpecification,
      {
        authenticatedUser: req.user,
        params: {
          projectId: projectId,
          featureClassAndAliasFilter: featureClassAndAliasFilter,
        },
      },
    );
    if (isLeft(result)) {
      throw new NotFoundException();
    }
    const { data, metadata } = result.right;

    return this.geoFeatureSerializer.serialize(data, metadata);
  }

  @ImplementsAcl()
  @ApiOperation({
    description: 'Starts a legacy marxan project import process',
    summary: 'Starts a legacy marxan project import process',
  })
  @ApiOkResponse({ type: StartLegacyProjectImportResponseDto })
  @Post('import/legacy')
  async importLegacyProject(
    @Body() dto: StartLegacyProjectImportBodyDto,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<StartLegacyProjectImportResponseDto> {
    const result = await this.projectsService.startLegacyProjectImport(
      dto.projectName,
      req.user.id,
      dto.description,
    );

    if (isLeft(result)) {
      switch (result.left) {
        case forbiddenError:
          throw new ForbiddenException();
        default:
          throw new InternalServerErrorException();
      }
    }

    return {
      projectId: result.right.projectId.value,
      scenarioId: result.right.scenarioId.value,
    };
  }

  @ImplementsAcl()
  @ApiOperation({
    description: 'Cancel a legacy project import',
    summary: 'Cancel a legacy project import',
  })
  @ApiOkResponse({ type: RunLegacyProjectImportResponseDto })
  @Post('import/legacy/:projectId/cancel')
  async cancelLegacyProject(
    @Param('projectId') projectId: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<RunLegacyProjectImportResponseDto> {
    const result = await this.projectsService.cancelLegacyProject(
      projectId,
      req.user.id,
    );

    if (isLeft(result)) {
      switch (result.left) {
        case forbiddenError:
          throw new ForbiddenException();
        case legacyProjectImportNotFound:
          throw new NotFoundException();
        case legacyProjectImportAlreadyFinished:
          throw new BadRequestException(
            `legacy project import with ${projectId} has already finished`,
          );
        case legacyProjectImportSaveError:
        default:
          throw new InternalServerErrorException();
      }
    }

    return { projectId };
  }

  @ImplementsAcl()
  @ApiOperation({
    description: 'Runs a legacy project import',
    summary: 'Runs a legacy project import',
  })
  @ApiOkResponse({ type: RunLegacyProjectImportResponseDto })
  @Post('import/legacy/:projectId')
  async runLegacyProject(
    @Param('projectId') projectId: string,
    @Body() dto: RunLegacyProjectImportBodyDto,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<RunLegacyProjectImportResponseDto> {
    const result = await this.projectsService.runLegacyProject(
      projectId,
      dto.solutionsAreLocked,
      req.user.id,
    );

    if (isLeft(result)) {
      switch (result.left) {
        case forbiddenError:
          throw new ForbiddenException();
        case legacyProjectImportNotFound:
          throw new NotFoundException();
        case legacyProjectImportMissingRequiredFile:
          throw new BadRequestException(
            'missing required files for running a legacy project import',
          );
        case legacyProjectImportAlreadyStarted:
          throw new BadRequestException(
            'a run has already being made on this legacy project import',
          );
        case legacyProjectImportSaveError:
        case updateSolutionsAreLockFailed:
        case blmCreationFailure:
        default:
          throw new InternalServerErrorException();
      }
    }

    return { projectId };
  }

  @ImplementsAcl()
  @ApiOperation({
    description: 'Returns legacy project import errors and warnings',
    summary: 'Returns legacy project import errors and warnings',
  })
  @ApiOkResponse({ type: GetLegacyProjectImportErrorsResponseDto })
  @Get('import/legacy/:projectId/validation-results')
  async getLegacyProjectImportErrors(
    @Param('projectId') projectId: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<GetLegacyProjectImportErrorsResponseDto> {
    const result = await this.projectsService.getLegacyProjectImportErrors(
      projectId,
      req.user.id,
    );

    if (isLeft(result)) {
      switch (result.left) {
        case forbiddenError:
          throw new ForbiddenException();
        case legacyProjectImportNotFound:
          throw new NotFoundException();
        default:
          throw new InternalServerErrorException();
      }
    }

    return { errorsAndWarnings: result.right };
  }

  @ImplementsAcl()
  @ApiOperation({
    description: 'Adds a file to a legacy project import',
    summary: 'Adds a file to a legacy project import',
  })
  @Post('import/legacy/:projectId/data-file')
  @ApiOkResponse({ type: AddFileToLegacyProjectImportResponseDto })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { limits: uploadOptions().limits }))
  async addFileToLegacyProjectImport(
    @Body() dto: AddFileToLegacyProjectImportBodyDto,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<AddFileToLegacyProjectImportResponseDto> {
    const result = await this.projectsService.addFileToLegacyProjectImport(
      projectId,
      file,
      dto.fileType,
      req.user.id,
    );

    if (isLeft(result)) {
      switch (result.left) {
        case forbiddenError:
          throw new ForbiddenException();
        case legacyProjectImportNotFound:
          throw new NotFoundException();
        case legacyProjectImportAlreadyStarted:
          throw new BadRequestException(
            `Legacy project import with project ID ${projectId} has already started`,
          );
        case legacyProjectImportSaveError:
        default:
          throw new InternalServerErrorException();
      }
    }

    return { projectId, fileId: result.right.value };
  }

  @ImplementsAcl()
  @ApiOperation({
    description: 'Deletes a file from a legacy project import',
    summary: 'Deletes a file from a legacy project import',
  })
  @Delete('import/legacy/:projectId/data-file/:dataFileId')
  @ApiOkResponse({ type: DeleteFileFromLegacyProjectImportResponseDto })
  async deleteFileFromLegacyProjectImport(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('dataFileId', ParseUUIDPipe) dataFileId: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<DeleteFileFromLegacyProjectImportResponseDto> {
    const result = await this.projectsService.deleteFileFromLegacyProjectImport(
      projectId,
      dataFileId,
      req.user.id,
    );

    if (isLeft(result)) {
      switch (result.left) {
        case forbiddenError:
          throw new ForbiddenException();
        case legacyProjectImportNotFound:
          throw new NotFoundException();
        case legacyProjectImportAlreadyStarted:
          throw new BadRequestException(
            `Legacy project import with project ID ${projectId} has already started`,
          );
        default:
          throw new InternalServerErrorException();
      }
    }

    return { projectId };
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
    await ensureShapefileHasRequiredFiles(shapefile);

    const { data } = await this.shapefileService.transformToGeoJson(shapefile, {
      allowOverlaps: true,
    });

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
  @ApiConsumesCsv({
    description: 'Upload a csv with feature amount for each puid',
  })
  @ApiParam({
    name: 'projectId',
    description: 'Id of the Project the feature is part of',
  })
  @ApiOkResponse({ type: GeoFeature, isArray: true })
  @UseInterceptors(
    FileInterceptor('file', { limits: uploadOptions(50 * 1024 ** 2).limits }),
  )
  @Post(`:projectId/features/csv`)
  async setFeatureAmountFromCSV(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<GeoFeature[]> {
    const result = await this.geoFeatureService.saveFeaturesFromCsv(
      file.buffer,
      projectId,
      req.user.id,
    );

    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        userId: req.user.id,
        projectId,
        resourceType: projectResource.name.plural,
      });
    }
    return result.right;
  }

  @ImplementsAcl()
  @ApiOperation({
    description: 'Deletes a feature that is related to the given projectId',
  })
  @ApiParam({
    name: 'projectId',
    description: 'Id of the Project',
  })
  @ApiParam({
    name: 'featureId',
    description: 'ID of the Feature to be deleted',
  })
  @ApiTags(inlineJobTag)
  @Delete(':projectId/features/:featureId')
  async deleteFeature(
    @Param('projectId') projectId: string,
    @Param('featureId') featureId: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<void> {
    const result = await this.geoFeatureService.deleteFeature(
      req.user.id,
      projectId,
      featureId,
    );

    if (isLeft(result)) {
      switch (result.left) {
        case projectNotFound:
          throw new NotFoundException(`Project with id ${projectId} not found`);
        case featureNotFound:
          throw new NotFoundException(
            `Feature with id ${featureId}, for project with id ${projectId}, not found`,
          );
        case featureIsLinkedToOneOrMoreScenarios:
          throw new ForbiddenException(
            `Feature with id ${featureId}, for project with id ${projectId}, still has Scenarios linked to it`,
          );
        case featureNotDeletable:
          throw new ForbiddenException(
            `Feature with id ${featureId}, for project with id ${projectId}, cannot be deleted`,
          );
      }
    }

    return;
  }

  @ImplementsAcl()
  @ApiOperation({
    description: `Updates A GeoFeature's tag for a given Project`,
  })
  @ApiParam({
    name: 'projectId',
    description: 'Id of the Project that the Feature is part of',
  })
  @ApiParam({
    name: 'featureId',
    description: 'Id of the Feature whose tag will be patched',
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @Patch(':projectId/features/:featureId/tags')
  async updateGeoFeatureTag(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('featureId', ParseUUIDPipe) featureId: string,
    @Req() req: RequestWithAuthenticatedUser,
    @Body() dto: UpdateGeoFeatureTagDTO,
  ): Promise<void> {
    const result = await this.geoFeatureTagsService.setOrUpdateTagForFeature(
      req.user.id,
      projectId,
      featureId,
      dto.tagName,
    );

    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        userId: req.user.id,
        featureId,
        projectId,
      });
    }
  }

  @ImplementsAcl()
  @ApiOperation({
    description: `Deletes A GeoFeature's tag for a given Project`,
  })
  @ApiParam({
    name: 'projectId',
    description: 'Id of the Project that the Feature is part of',
  })
  @ApiParam({
    name: 'featureId',
    description: 'Id of the Feature whose tag will be deleted',
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @Delete(':projectId/features/:featureId/tags')
  async deleteGeoFeatureTag(
    @Param('featureId', ParseUUIDPipe) featureId: string,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<void> {
    const result = await this.geoFeatureTagsService.deleteTagForFeature(
      req.user.id,
      projectId,
      featureId,
    );

    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        userId: req.user.id,
        featureId,
        projectId,
      });
    }
  }

  @ImplementsAcl()
  @ApiOperation({
    description: `Returns all the tags for the given Project that match the filter`,
  })
  @ApiParam({
    name: 'projectId',
    description: 'Id of the Project that the tag to be removed pertains to',
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @Get(':projectId/tags')
  async getProjectTags(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Req() req: RequestWithAuthenticatedUser,
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
  ): Promise<GetProjectTagsResponseDto> {
    const tagFilters = Array.isArray(fetchSpecification.filter?.tag)
      ? fetchSpecification.filter?.tag
      : undefined;
    const result = await this.geoFeatureTagsService.getGeoFeatureTagsForProject(
      req.user.id,
      projectId,
      tagFilters,
      fetchSpecification.sort,
    );

    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        userId: req.user.id,
        projectId,
      });
    }

    return { data: result.right };
  }

  @ImplementsAcl()
  @ApiOperation({
    description: `Updates the label of a tag for a given Project`,
  })
  @ApiParam({
    name: 'projectId',
    description: 'Id of the Project that the tag to be updated pertains to',
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @Patch(':projectId/tags')
  async updateProjectTag(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Req() req: RequestWithAuthenticatedUser,
    @Body() body: UpdateProjectTagDTO,
  ): Promise<void> {
    const result = await this.geoFeatureTagsService.updateTagForProject(
      req.user.id,
      projectId,
      body,
    );

    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        userId: req.user.id,
        projectId,
      });
    }
  }

  @ImplementsAcl()
  @ApiOperation({
    description: `Deletes A Tag from a given Project, untagging all its features`,
  })
  @ApiParam({
    name: 'projectId',
    description: 'Id of the Project that the tag to be removed pertains to',
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @Delete(':projectId/tags')
  async deleteProjectTag(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Req() req: RequestWithAuthenticatedUser,
    @Body() dto: UpdateGeoFeatureTagDTO,
  ): Promise<void> {
    const result = await this.geoFeatureTagsService.deleteTagForProject(
      req.user.id,
      projectId,
      dto.tagName,
    );

    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        userId: req.user.id,
        projectId,
      });
    }
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
  @ApiParam({
    name: 'projectId',
    description: 'ID of the Project',
  })
  @ApiOkResponse({ type: RequestProjectExportResponseDto })
  @Post(`:projectId/export`)
  async requestProjectExport(
    @Param('projectId') projectId: string,
    @Req() req: RequestWithAuthenticatedUser,
    @Body() dto: RequestProjectExportBodyDto,
  ) {
    const result = await this.projectsService.requestExport(
      projectId,
      req.user.id,
      dto.scenarioIds,
      false,
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
      id: result.right.exportId.value,
    };
  }

  @ImplementsAcl()
  @ApiParam({
    name: 'projectId',
    description: 'ID of the Project',
  })
  @ApiOkResponse({ type: RequestProjectCloneResponseDto })
  @Post(`:projectId/clone`)
  async requestProjectClone(
    @Param('projectId') projectId: string,
    @Req() req: RequestWithAuthenticatedUser,
    @Body() dto: RequestProjectExportBodyDto,
  ): Promise<RequestProjectCloneResponseDto> {
    const result = await this.projectsService.requestExport(
      projectId,
      req.user.id,
      dto.scenarioIds,
      true,
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
      exportId: result.right.exportId.value,
      projectId: result.right.importResourceId!.value,
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
        case unfinishedExport:
          throw new BadRequestException(
            `Export with ID ${exportId} hasn't finished`,
          );
        case notAllowed:
          throw new ForbiddenException(
            `Your role cannot retrieve export .zip files for project with ID: ${projectId}`,
          );
        case projectNotFound:
          throw new NotFoundException(
            `Could not find project with ID: ${projectId}`,
          );
        case exportNotFound:
          throw new NotFoundException(
            `Could not find export with ID: ${exportId}`,
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
  @ApiOkResponse({ type: GetLatestExportResponseDto })
  @Get(`:projectId/export`)
  async getLatestExportId(
    @Param('projectId') projectId: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<GetLatestExportResponseDto> {
    const resultOrError = await this.projectsService.getLatestExportForProject(
      projectId,
      req.user.id,
    );

    if (isLeft(resultOrError)) {
      switch (resultOrError.left) {
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
    return resultOrError.right;
  }

  @ImplementsAcl()
  @ApiOperation({
    description: 'Returns the latest exports for a given project',
  })
  @ApiParam({
    name: 'projectId',
    description: 'ID of the Project',
  })
  @ApiOkResponse({ type: GetLatestExportsResponseDto })
  @Get(`:projectId/latest-exports`)
  async getLatestExports(
    @Param('projectId') projectId: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<GetLatestExportsResponseDto> {
    const resultOrError = await this.projectsService.getLatestExportsForProject(
      projectId,
      req.user.id,
    );

    if (isLeft(resultOrError)) {
      switch (resultOrError.left) {
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
    return { exports: resultOrError.right };
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
  @Post('import')
  @ApiOkResponse({ type: RequestProjectImportResponseDto })
  @ApiConsumes('multipart/form-data')
  /**
   * Marxan Cloud archives can get rather big. Let's aim for a limit of 50MB for
   * the time being. This may need to be raised in the future, but if doing so,
   * the system should be diligently stress-tested to make sure we can actually
   * handle bigger archives, which may came with their own set of additional
   * challenges.
   */
  @UseInterceptors(
    FileInterceptor('file', { limits: uploadOptions(50 * 1024 ** 2).limits }),
  )
  async importProject(
    @Body() dto: RequestProjectImportBodyDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<RequestProjectImportResponseDto> {
    const idsOrError = await this.projectsService.importProjectFromZipFile(
      file,
      req.user.id,
      dto.projectName,
    );

    if (isLeft(idsOrError)) {
      switch (idsOrError.left) {
        case forbiddenError:
          throw new ForbiddenException();
        case invalidSignature:
        case integrityCheckFailed:
        case cloningExportProvided:
        case invalidExportZipFile:
          throw new BadRequestException('Invalid export zip file');
        default:
          throw new InternalServerErrorException(idsOrError.left);
      }
    }

    return {
      importId: idsOrError.right.importId,
      projectId: idsOrError.right.projectId,
    };
  }
}
