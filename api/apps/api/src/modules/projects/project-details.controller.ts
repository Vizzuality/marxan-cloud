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
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JSONAPISingleEntityQueryParams } from '@marxan-api/decorators/json-api-parameters.decorator';
import { JwtAuthGuard } from '@marxan-api/guards/jwt-auth.guard';
import { apiGlobalPrefixes } from '@marxan-api/api.config';
import { RequestWithAuthenticatedUser } from '@marxan-api/app.controller';

import { projectResource, ProjectResultSingular } from './project.api.entity';
import { projectNotFound, ProjectsService } from './projects.service';
import { ProjectSerializer } from './dto/project.serializer';
import { isLeft } from 'fp-ts/lib/Either';
import { forbiddenError } from '../access-control';
import { ImplementsAcl } from '@marxan-api/decorators/acl.decorator';

@ApiTags(projectResource.className)
@Controller(`${apiGlobalPrefixes.v1}/projects`)
export class ProjectDetailsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly projectSerializer: ProjectSerializer,
  ) {}

  @ApiBearerAuth()
  @ImplementsAcl()
  @UseGuards(JwtAuthGuard)
  @SingleProject()
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<ProjectResultSingular> {
    const result = await this.projectsService.findOne(id, {
      authenticatedUser: req.user,
    });

    if (isLeft(result)) {
      switch (result.left) {
        case forbiddenError:
          throw new ForbiddenException();
        case projectNotFound:
          throw new NotFoundException(`Project ${id} could not be found`);
        default:
          const _exhaustiveCheck: never = result.left;
          throw _exhaustiveCheck;
      }
    }

    return await this.projectSerializer.serialize(result.right);
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
