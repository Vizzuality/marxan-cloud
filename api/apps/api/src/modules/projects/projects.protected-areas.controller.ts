import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';

import { projectResource } from './project.api.entity';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { apiGlobalPrefixes } from '@marxan-api/api.config';
import { JwtAuthGuard } from '@marxan-api/guards/jwt-auth.guard';

import { RequestWithAuthenticatedUser } from '@marxan-api/app.controller';

import { isLeft } from 'fp-ts/Either';
import { ImplementsAcl } from '@marxan-api/decorators/acl.decorator';

import { ProtectedArea } from '@marxan/protected-areas';
import { ProjectProtectedAreasService } from './project-protected-areas.service';
import { mapAclDomainToHttpError } from '@marxan-api/utils/acl.utils';
import { assertDefined } from '@marxan/utils';
import {
  FetchSpecification,
  ProcessFetchSpecification,
} from 'nestjs-base-service';
import {
  JSONAPIProtectedAreasListQueryParams,
} from '@marxan-api/decorators/json-api-parameters.decorator';
import { ProtectedAreaResult } from '@marxan-api/modules/protected-areas/protected-area.geo.entity';
import { ApiConsumesShapefile } from '@marxan-api/decorators/shapefile.decorator';
import { GeometryFileInterceptor, GeometryKind } from '@marxan-api/decorators/file-interceptors.decorator';
import { asyncJobTag } from '@marxan-api/dto/async-job-tag';
import { UploadShapefileDto } from '../scenarios/dto/upload.shapefile.dto';
import { AsyncJobDto, JsonApiAsyncJobMeta } from '@marxan-api/dto/async-job.dto';
import { ProjectsService } from './projects.service';
import { scenarioResource } from '../scenarios/scenario.api.entity';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags(projectResource.className)
@Controller(`${apiGlobalPrefixes.v1}/projects`)
export class ProjectProtectedAreasController {
  constructor(
    private readonly projectProtectedAreasService: ProjectProtectedAreasService,
    private readonly projectsService: ProjectsService,
  ) {}

  @ImplementsAcl()
  @ApiOperation({
    description: 'List all protected areas for a project',
  })
  @ApiOkResponse({
    type: ProtectedAreaResult,
    isArray: true,
  })
  @ApiUnauthorizedResponse()
  @JSONAPIProtectedAreasListQueryParams()
  @ApiForbiddenResponse()
  @Get(':projectId/protected-areas')
  async findAllProtectedAreasForProject(
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
    @Req() req: RequestWithAuthenticatedUser,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query('q') protectedAreaNameFilter?: string,
  ): Promise<ProtectedArea[]> {
    assertDefined(req.user);

    const result = await this.projectProtectedAreasService.listForProject(
      projectId,
      req.user.id,
      fetchSpecification,
      {
        params: {
          fullNameAndCategoryFilter: protectedAreaNameFilter,
        },
      },
    );

    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        projectId,
      });
    } else {
      return result.right;
    }
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
