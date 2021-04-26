import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import {
  Project,
  ProjectResultSingular,
  ProjectResultPlural,
} from './project.api.entity';
import { ProjectsService } from './projects.service';

import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { apiGlobalPrefixes } from 'api.config';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { Post } from '@nestjs/common';
import { UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { uploadOptions } from 'utils/file-uploads.utils';

import {
  JSONAPIQueryParams,
  JSONAPISingleEntityQueryParams,
} from 'decorators/json-api-parameters.decorator';
import { projectResource } from './project.api.entity';
import { UpdateProjectDTO } from './dto/update.project.dto';
import { CreateProjectDTO } from './dto/create.project.dto';
import { RequestWithAuthenticatedUser } from 'app.controller';
import {
  FetchSpecification,
  ProcessFetchSpecification,
} from 'nestjs-base-service';
import { GeoFeatureResult } from 'modules/geo-features/geo-feature.api.entity';
import { GeoFeaturesService } from 'modules/geo-features/geo-features.service';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags(projectResource.className)
@Controller(`${apiGlobalPrefixes.v1}/projects`)
export class ProjectsController {
  constructor(
    public readonly service: ProjectsService,
    private readonly geoFeaturesService: GeoFeaturesService,
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
    @Param() params: { projectId: string; filterQuery?: string },
    @Query('q') filterQuery: string,
  ): Promise<GeoFeatureResult> {
    params.filterQuery = filterQuery;
    const results = await this.geoFeaturesService.findAllPaginated(
      fetchSpecification,
      { params },
    );
    return this.geoFeaturesService.serialize(results.data, results.metadata);
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
    return this.service.importLegacyProject(file);
  }

  @ApiOperation({
    description: 'Find all projects',
  })
  @ApiOkResponse({ type: ProjectResultPlural })
  @JSONAPIQueryParams({
    entitiesAllowedAsIncludes: projectResource.entitiesAllowedAsIncludes,
    availableFilters: [
      { name: 'name' },
      { name: 'organizationId' },
      { name: 'countryId' },
      { name: 'adminAreaLevel1Id' },
      { name: 'adminAreaLevel21Id' },
    ],
  })
  @Get()
  async findAll(
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
  ): Promise<ProjectResultPlural> {
    const results = await this.service.findAllPaginated(fetchSpecification);
    return await this.service.serialize(results.data, results.metadata);
  }

  @ApiOperation({ description: 'Find project by id' })
  @ApiOkResponse({ type: ProjectResultSingular })
  @JSONAPISingleEntityQueryParams({
    entitiesAllowedAsIncludes: projectResource.entitiesAllowedAsIncludes,
  })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ProjectResultSingular> {
    return await this.service.serialize(await this.service.getById(id));
  }

  @ApiOperation({ description: 'Create project' })
  @ApiOkResponse({ type: ProjectResultSingular })
  @Post()
  async create(
    @Body() dto: CreateProjectDTO,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<ProjectResultSingular> {
    return await this.service.serialize(
      await this.service.create(dto, { authenticatedUser: req.user }),
    );
  }

  @ApiOperation({ description: 'Update project' })
  @ApiOkResponse({ type: ProjectResultSingular })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDTO,
  ): Promise<ProjectResultSingular> {
    return await this.service.serialize(await this.service.update(id, dto));
  }

  @ApiOperation({ description: 'Delete project' })
  @ApiOkResponse()
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.service.remove(id);
  }
}
