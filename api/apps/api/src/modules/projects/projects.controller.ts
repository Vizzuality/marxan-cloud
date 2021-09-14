import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
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
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
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
import { ProjectsService, validationFailed } from './projects.service';
import { GeoFeatureSerializer } from './dto/geo-feature.serializer';
import { ProjectSerializer } from './dto/project.serializer';
import { ProjectJobsStatusDto } from './dto/project-jobs-status.dto';
import { JobStatusSerializer } from './dto/job-status.serializer';
import { PlanningAreaResponseDto } from './dto/planning-area-response.dto';
import { isLeft } from 'fp-ts/Either';
import { ShapefileUploadResponse } from './dto/project-upload-shapefile.dto';
import { UploadShapefileDTO } from './dto/upload-shapefile.dto';
import { ProjectGridRequestDto } from './dto/project-grid-request.dto';
import { GeoFeaturesService } from '../geo-features/geo-features.service';
import { AppConfig } from '@marxan-api/utils/config.utils';
import { ShapefileService } from '@marxan/shapefile-converter';
import { isFeatureCollection } from '@marxan/utils';
import { plainToClass } from 'class-transformer';

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
    private readonly jobsStatusSerizalizer: JobStatusSerializer,
    private readonly shapefileService: ShapefileService,
  ) {}

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
    @Param() params: { projectId: string },
    @Query('q') featureClassAndAliasFilter: string,
  ): Promise<GeoFeatureResult> {
    const { data, metadata } = await this.projectsService.findAllGeoFeatures(
      fetchSpecification,
      {
        params: {
          ...params,
          featureClassAndAliasFilter: featureClassAndAliasFilter,
        },
      },
    );

    return this.geoFeatureSerializer.serialize(data, metadata);
  }

  /**
   * Import a Marxan legacy project via file upload
   *
   * @debt We may want to use a custom interceptor to process import files
   */
  @ApiOperation({
    description: 'Import a Marxan project via file upload',
    summary: 'Import a Marxan project',
  })
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  @Post('legacy')
  async importLegacyProject(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Project> {
    return this.projectsService.importLegacyProject(file);
  }

  @ApiOperation({ description: 'Create project' })
  @ApiOkResponse({ type: ProjectResultSingular })
  @Post()
  async create(
    @Body() dto: CreateProjectDTO,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<ProjectResultSingular> {
    return await this.projectSerializer.serialize(
      await this.projectsService.create(dto, { authenticatedUser: req.user }),
    );
  }

  @ApiOperation({ description: 'Update project' })
  @ApiOkResponse({ type: ProjectResultSingular })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDTO,
  ): Promise<ProjectResultSingular> {
    return await this.projectSerializer.serialize(
      await this.projectsService.update(id, dto),
    );
  }

  @ApiOperation({ description: 'Delete project' })
  @ApiOkResponse()
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.projectsService.remove(id);
  }

  @ApiConsumesShapefile({ withGeoJsonResponse: false })
  @ApiOperation({
    description: 'Upload shapefile for project-specific planning unit grid',
  })
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  @ApiCreatedResponse({ type: ProjectGridRequestDto })
  @Post(`:id/grid`)
  async setProjectGrid(
    @Param('id') projectId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.projectsService.setGrid(projectId, file);
    if (isLeft(result)) {
      throw new InternalServerErrorException(result.left);
    }
    return plainToClass<ProjectGridRequestDto, ProjectGridRequestDto>(
      ProjectGridRequestDto,
      {
        id: result.right.value,
      },
    );
  }

  @ApiOperation({
    description: `Find running jobs for each scenario under given project`,
  })
  @ApiOkResponse({ type: ProjectJobsStatusDto })
  @Get(`:id/scenarios/status`)
  async getJobsForProjectScenarios(
    @Param('id') projectId: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<ProjectJobsStatusDto> {
    const scenarios = await this.projectsService.getJobStatusFor(projectId, {
      authenticatedUser: req.user,
    });
    return this.jobsStatusSerizalizer.serialize(projectId, scenarios);
  }

  @ApiConsumesShapefile({ withGeoJsonResponse: false })
  @ApiOperation({
    description: 'Upload shapefile for project-specific protected areas',
  })
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  @ApiNoContentResponse()
  @Post(':id/protected-areas/shapefile')
  async shapefileForProtectedArea(
    @Param('id') projectId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<void> {
    const outcome = await this.projectsService.addShapeFor(projectId, file, {
      authenticatedUser: req.user,
    });
    if (outcome) {
      throw new NotFoundException();
    }
    return;
  }

  @ApiConsumesShapefile({
    withGeoJsonResponse: true,
    type: PlanningAreaResponseDto,
    description: 'Upload shapefile with project planning-area',
  })
  @UseInterceptors(FileInterceptor('file', uploadOptions))
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

  @ApiConsumesShapefile({ withGeoJsonResponse: false })
  @ApiOperation({
    description: `Upload shapefiles of species or bioregional features.`,
  })
  @ApiOkResponse({ type: ShapefileUploadResponse })
  @Post(`:id/features/shapefile`)
  @UseInterceptors(
    FileInterceptor('file', {
      ...uploadOptions,
      limits: {
        fileSize: (() =>
          AppConfig.get<number>(
            'fileUploads.limits.shapefileMaxSize',
            100 * 1024e2,
          ))(),
      },
    }),
  )
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
}
