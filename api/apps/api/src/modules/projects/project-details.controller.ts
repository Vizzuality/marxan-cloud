import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  applyDecorators,
  Controller,
  Get,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JSONAPISingleEntityQueryParams } from '@marxan-api/decorators/json-api-parameters.decorator';
import { JwtAuthGuard } from '@marxan-api/guards/jwt-auth.guard';
import { apiGlobalPrefixes } from '@marxan-api/api.config';
import { RequestWithAuthenticatedUser } from '@marxan-api/app.controller';

import { projectResource, ProjectResultSingular } from './project.api.entity';
import { ProjectsService } from './projects.service';
import { ProjectSerializer } from './dto/project.serializer';

@ApiTags(projectResource.className)
@Controller(`${apiGlobalPrefixes.v1}/projects`)
export class ProjectDetailsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly projectSerializer: ProjectSerializer,
  ) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @SingleProject()
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<ProjectResultSingular> {
    return await this.projectSerializer.serialize(
      await this.projectsService.findOne(id, {
        authenticatedUser: req.user,
      }),
    );
  }
}

function SingleProject() {
  return applyDecorators(
    ...[
      ApiNotFoundResponse(),
      ApiOperation({ description: 'Find project by id' }),
      ApiOkResponse({ type: ProjectResultSingular }),
      JSONAPISingleEntityQueryParams({
        entitiesAllowedAsIncludes: projectResource.entitiesAllowedAsIncludes,
      }),
    ],
  );
}
