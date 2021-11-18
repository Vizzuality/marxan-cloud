import { apiGlobalPrefixes } from '@marxan-api/api.config';
import {
  Controller,
  Get,
  Req,
  Param,
  ParseUUIDPipe,
  UseGuards,
  ForbiddenException,
  Delete,
  Patch,
  Body,
} from '@nestjs/common';
import { JwtAuthGuard } from '@marxan-api/guards/jwt-auth.guard';
import { ProjectAclService } from './project-acl.service';
import { RequestWithAuthenticatedUser } from '@marxan-api/app.controller';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersProjectsApiEntity } from '@marxan-api/modules/projects/control-level/users-projects.api.entity';
import { UpdateUserRoleinProject } from './dto/update-user-role-project.dto';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Projects Users')
@Controller(`${apiGlobalPrefixes.v1}/projects`)
export class ProjectAclController {
  constructor(private readonly projectAclService: ProjectAclService) {}

  @Get(':projectId/users')
  async findUsersInProject(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<UsersProjectsApiEntity[]> {
    const isOwner = await this.projectAclService.checkUserIsOwner(
      req.user.id,
      projectId,
    );

    if (!isOwner) {
      throw new ForbiddenException();
    }

    return await this.projectAclService.findUsersInProject(projectId);
  }

  @Patch(':projectId/users')
  async updateUserInProject(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: UpdateUserRoleinProject,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<void> {
    const isOwner = await this.projectAclService.checkUserIsOwner(
      req.user.id,
      projectId,
    );

    if (!isOwner) {
      throw new ForbiddenException();
    }

    await this.projectAclService.updateUserInProject(projectId, dto);
  }

  @Delete(':projectId/users/:userId')
  async deleteUserFromProject(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<void> {
    const isOwner = await this.projectAclService.checkUserIsOwner(
      req.user.id,
      projectId,
    );

    if (!isOwner) {
      throw new ForbiddenException();
    }

    await this.projectAclService.deleteUserFromProject(projectId, userId);
  }
}
