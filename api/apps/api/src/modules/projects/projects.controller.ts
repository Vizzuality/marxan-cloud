import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get, InternalServerErrorException, Param, ParseUUIDPipe,
  Patch,
  Post,
  Req, UseGuards
} from '@nestjs/common';

import { projectResource, ProjectResultSingular } from './project.api.entity';
import {
  ApiBearerAuth, ApiOkResponse,
  ApiOperation, ApiTags
} from '@nestjs/swagger';
import { apiGlobalPrefixes } from '@marxan-api/api.config';
import { JwtAuthGuard } from '@marxan-api/guards/jwt-auth.guard';

import { UpdateProjectDTO } from './dto/update.project.dto';
import { CreateProjectDTO } from './dto/create.project.dto';
import { RequestWithAuthenticatedUser } from '@marxan-api/app.controller';
import {
  ProjectsService
} from './projects.service';
import { ProjectSerializer } from './dto/project.serializer';
import { ProjectJobsStatusDto } from './dto/project-jobs-status.dto';
import { JobStatusSerializer } from './dto/job-status.serializer';
import { isLeft } from 'fp-ts/Either';
import { asyncJobTag } from '@marxan-api/dto/async-job-tag';
import {
  ImplementsAcl,
  IsMissingAclImplementation,
} from '@marxan-api/decorators/acl.decorator';
import { ScenarioLockResultPlural } from '@marxan-api/modules/access-control/scenarios-acl/locks/dto/scenario.lock.dto';
import { mapAclDomainToHttpError } from '@marxan-api/utils/acl.utils';
import { deleteProjectFailed } from './delete-project/delete-project.command';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags(projectResource.className)
@Controller(`${apiGlobalPrefixes.v1}/projects`)
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly projectSerializer: ProjectSerializer,
    private readonly jobsStatusSerializer: JobStatusSerializer,
  ) {}

  @ImplementsAcl()
  @ApiOperation({ description: 'Create project' })
  @ApiOkResponse({ type: ProjectResultSingular })
  @ApiTags(asyncJobTag)
  @Post()
  async create(
    @Body() dto: CreateProjectDTO,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<ProjectResultSingular> {
    const result = await this.projectsService.create(dto, {
      authenticatedUser: req.user,
    });

    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        userId: req.user.id,
        resourceType: projectResource.name.plural,
      });
    }

    return await this.projectSerializer.serialize(
      result.right,
      undefined,
      true,
    );
  }

  @ImplementsAcl()
  @ApiOperation({ description: 'Update project' })
  @ApiOkResponse({ type: ProjectResultSingular })
  @ApiTags(asyncJobTag)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDTO,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<ProjectResultSingular> {
    const result = await this.projectsService.update(id, dto, req.user.id);

    if (isLeft(result)) {
      throw new ForbiddenException();
    }
    return await this.projectSerializer.serialize(
      result.right,
      undefined,
      true,
    );
  }

  @ImplementsAcl()
  @ApiOperation({ description: 'Delete project' })
  @ApiOkResponse()
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<void> {
    const result = await this.projectsService.remove(id, req.user.id);

    if (isLeft(result)) {
      switch (result.left) {
        case deleteProjectFailed:
          throw new InternalServerErrorException();
        case false:
          throw new ForbiddenException();
      }
    }
    return;
  }

  @IsMissingAclImplementation()
  @ApiOperation({
    description: `Find running jobs for each scenario under given project`,
  })
  @ApiOkResponse({ type: ProjectJobsStatusDto })
  @Get(`:id/scenarios/status`)
  async getJobsForProjectScenarios(
    @Param('id') projectId: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<ProjectJobsStatusDto> {
    const projectWithScenarios = await this.projectsService.getJobStatusFor(
      projectId,
      {
        authenticatedUser: req.user,
      },
    );
    return this.jobsStatusSerializer.serialize(projectId, projectWithScenarios);
  }

  @ImplementsAcl()
  @Get(':projectId/editing-locks')
  @ApiOperation({ summary: 'Get all locks by project' })
  async findLocksForProject(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<ScenarioLockResultPlural> {
    const result = await this.projectsService.findAllLocks(
      projectId,
      req.user.id,
    );
    if (isLeft(result)) {
      throw new ForbiddenException();
    }

    return result.right;
  }
}
