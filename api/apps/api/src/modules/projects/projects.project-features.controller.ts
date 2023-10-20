import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
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

import { projectResource } from './project.api.entity';
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
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
import { projectNotFound, ProjectsService } from './projects.service';
import { GeoFeatureSerializer } from './dto/geo-feature.serializer';
import { isLeft } from 'fp-ts/Either';
import { UploadShapefileDTO } from './dto/upload-shapefile.dto';
import { GeoFeaturesService } from '@marxan-api/modules/geo-features';
import { ShapefileService } from '@marxan/shapefile-converter';
import { isFeatureCollection } from '@marxan/utils';
import { inlineJobTag } from '@marxan-api/dto/inline-job-tag';
import {
  GeometryFileInterceptor,
  GeometryKind,
} from '@marxan-api/decorators/file-interceptors.decorator';
import {
  ImplementsAcl,
  IsMissingAclImplementation,
} from '@marxan-api/decorators/acl.decorator';
import { mapAclDomainToHttpError } from '@marxan-api/utils/acl.utils';
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
import { isNil } from 'lodash';
import { Response } from 'express';
import { ProxyService } from '@marxan-api/modules/proxy/proxy.service';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Project - Features')
@Controller(`${apiGlobalPrefixes.v1}/projects`)
export class ProjectFeaturesController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly geoFeatureSerializer: GeoFeatureSerializer,
    private readonly geoFeatureService: GeoFeaturesService,
    private readonly geoFeatureTagsService: GeoFeatureTagsService,
    private readonly shapefileService: ShapefileService,
    private readonly proxyService: ProxyService,
  ) {}

  @IsMissingAclImplementation()
  @ApiOperation({
    description: 'Find all geo features within a given project',
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

  @IsMissingAclImplementation()
  @ApiConsumesShapefile({ withGeoJsonResponse: false })
  @ApiOperation({
    description: `Upload shapefiles of species or bioregional features`,
  })
  @ApiOkResponse({ type: GeoFeature })
  @ApiTags(inlineJobTag)
  @ApiBody({
    description: 'Shapefile to upload',
    type: UploadShapefileDTO,
  })
  @Post(`:id/features/shapefile`)
  @GeometryFileInterceptor(GeometryKind.ComplexWithProperties)
  async uploadFeatures(
    @Param('id') projectId: string,
    @UploadedFile() shapefile: Express.Multer.File,
    @Body() body: UploadShapefileDTO,
  ): Promise<GeoFeature> {
    await ensureShapefileHasRequiredFiles(shapefile);

    const { data } = await this.shapefileService.transformToGeoJson(shapefile, {
      allowOverlaps: true,
    });

    if (!isFeatureCollection(data)) {
      throw new BadRequestException(`Only FeatureCollection is supported.`);
    }

    const newFeatureOrError = await this.geoFeatureService.createFeaturesForShapefile(
      projectId,
      body,
      data.features,
    );

    if (isLeft(newFeatureOrError)) {
      // @debt Use mapDomainToHttpException() instead
      throw new InternalServerErrorException(newFeatureOrError.left);
    } else {
      const result = await this.geoFeatureService.getById(
        newFeatureOrError.right.id,
      );
      if (isNil(result)) {
        // @debt Use mapDomainToHttpException() instead
        throw new NotFoundException();
      }

      return this.geoFeatureSerializer.serialize(result);
    }
  }

  @ImplementsAcl()
  @ApiConsumesCsv({
    description: 'Upload a csv with feature amounts for each puid',
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
    description: 'Deletes a feature that is related to the given projects',
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
    description: `Updates a feature's tag for a given project`,
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
  @ApiOkResponse({ type: GeoFeature })
  @Patch(':projectId/features/:featureId/tags')
  async updateGeoFeatureTag(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('featureId', ParseUUIDPipe) featureId: string,
    @Req() req: RequestWithAuthenticatedUser,
    @Body() dto: UpdateGeoFeatureTagDTO,
  ): Promise<GeoFeature> {
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

    return this.geoFeatureService.serialize(result.right);
  }

  @ImplementsAcl()
  @ApiOperation({
    description: `Deletes a feature's tag for a given project`,
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
    description: `Returns all the feature tags that match the filter, for the given project`,
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
    description: `Updates the label of a feature tag for a given project`,
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
    description: `Deletes a feature tag from a given project, untagging all features that were tagged with it`,
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
    description: 'Get tile for a project feature by project id and feature id.',
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
  @ApiParam({
    name: 'projectId',
    description: 'Id of the project',
    type: String,
    required: true,
  })
  @ApiParam({
    name: 'featureId',
    description: 'Id of the feature',
    type: String,
    required: true,
  })
  @ApiQuery({
    name: 'bbox',
    description: 'Bounding box of the project [xMin, xMax, yMin, yMax]',
    type: [Number],
    required: false,
    example: [-1, 40, 1, 42],
  })
  @Get(':projectId/features/:featureId/preview/tiles/:z/:x/:y.mvt')
  async proxyFeatureTile(
    @Req() req: RequestWithAuthenticatedUser,
    @Res() response: Response,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('featureId', ParseUUIDPipe) featureId: string,
  ): Promise<void> {
    const checkCostSurfaceForProject = await this.geoFeatureService.checkProjectFeatureVisibility(
      req.user.id,
      projectId,
      featureId,
    );
    if (isLeft(checkCostSurfaceForProject)) {
      throw mapAclDomainToHttpError(checkCostSurfaceForProject.left);
    }

    req.url = req.url.replace(
      `projects/${projectId}/features`,
      `geo-features/project-feature`,
    );

    return await this.proxyService.proxyTileRequest(req, response);
  }
}
