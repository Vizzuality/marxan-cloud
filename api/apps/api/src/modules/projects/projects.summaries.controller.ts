import {
  Controller,
  Get,
  Header,
  Param,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import { apiGlobalPrefixes } from '@marxan-api/api.config';
import { JwtAuthGuard } from '@marxan-api/guards/jwt-auth.guard';

import { RequestWithAuthenticatedUser } from '@marxan-api/app.controller';
import { ProjectsService } from './projects.service';
import { isLeft } from 'fp-ts/Either';
import { Response } from 'express';
import { ImplementsAcl } from '@marxan-api/decorators/acl.decorator';
import { mapAclDomainToHttpError } from '@marxan-api/utils/acl.utils';
import { outputProjectSummaryResource } from './output-project-summaries/output-project-summary.api.entity';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Project - Marxan summaries')
@Controller(`${apiGlobalPrefixes.v1}/projects`)
export class ProjectSummariesController {
  constructor(private readonly projectsService: ProjectsService) {}

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
}
