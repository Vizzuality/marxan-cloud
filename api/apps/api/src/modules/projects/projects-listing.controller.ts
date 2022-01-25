import {
  applyDecorators,
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  FetchSpecification,
  ProcessFetchSpecification,
} from 'nestjs-base-service';

import { JSONAPIQueryParams } from '@marxan-api/decorators/json-api-parameters.decorator';
import { RequestWithAuthenticatedUser } from '@marxan-api/app.controller';
import { apiGlobalPrefixes } from '@marxan-api/api.config';
import { JwtAuthGuard } from '@marxan-api/guards/jwt-auth.guard';

import { projectResource, ProjectResultPlural } from './project.api.entity';
import { ProjectsService } from './projects.service';
import { ProjectSerializer } from './dto/project.serializer';
import { ImplementsAcl } from '@marxan-api/decorators/acl.decorator';

@ApiTags(projectResource.className)
@Controller(`${apiGlobalPrefixes.v1}/projects`)
export class ProjectsListingController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly projectSerializer: ProjectSerializer,
  ) {}

  @ApiBearerAuth()
  @ImplementsAcl()
  @UseGuards(JwtAuthGuard)
  @ProjectsListing()
  @Get()
  async findAll(
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
    @Req() req: RequestWithAuthenticatedUser,
    @Query('q') namesSearch?: string,
  ): Promise<ProjectResultPlural> {
    const results = await this.projectsService.findAll(fetchSpecification, {
      params: {
        namesSearch,
      },
      authenticatedUser: req.user,
    });
    return this.projectSerializer.serializeAll(results.data, results.metadata);
  }
}

function ProjectsListing() {
  return applyDecorators(
    ...[
      ApiOperation({
        description: 'Find all projects',
      }),
      ApiOkResponse({ type: ProjectResultPlural }),
      JSONAPIQueryParams({
        entitiesAllowedAsIncludes: projectResource.entitiesAllowedAsIncludes,
        availableFilters: [
          { name: 'name' },
          { name: 'organizationId' },
          { name: 'countryId' },
          { name: 'adminAreaLevel1Id' },
          { name: 'adminAreaLevel21Id' },
        ],
      }),
      ApiQuery({
        name: 'q',
        required: false,
        description: `A free search over names`,
      }),
    ],
  );
}
