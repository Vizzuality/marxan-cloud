import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
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
}
