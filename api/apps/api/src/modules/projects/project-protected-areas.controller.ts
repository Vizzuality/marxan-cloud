import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Req,
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
import {
  ImplementsAcl,
} from '@marxan-api/decorators/acl.decorator';

import { ProtectedArea } from '@marxan/protected-areas';
import { ProjectProtectedAreasService } from './project-protected-areas.service';
import { mapAclDomainToHttpError } from '@marxan-api/utils/acl.utils';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags(projectResource.className)
@Controller(`${apiGlobalPrefixes.v1}/projects`)
export class ProjectProtectedAreasController {
  constructor(
    private readonly projectProtectedAreasService: ProjectProtectedAreasService,
  ) {}

  @ImplementsAcl()
  @ApiOperation({
    description: 'List all protected areas for a project',
  })
  @ApiOkResponse({
    type: ProtectedArea,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @Get(':projectId/protected-areas')
  async findAllProtectedAreasForProject(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<ProtectedArea[]> {
    const result = await this.projectProtectedAreasService.listForProject(
      projectId,
      req.user?.id,
    );

    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        projectId,
      });
    } else {
      return result.right;
    }
  }
}
