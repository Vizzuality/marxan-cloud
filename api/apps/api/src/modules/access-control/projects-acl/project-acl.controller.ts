import { apiGlobalPrefixes } from '@marxan-api/api.config';
import {
  Controller,
  Get,
  Req,
  Param,
  ParseUUIDPipe,
  UseGuards,
  Delete,
  Patch,
  Body,
} from '@nestjs/common';
import { JwtAuthGuard } from '@marxan-api/guards/jwt-auth.guard';
import { ProjectAclService } from './project-acl.service';
import { RequestWithAuthenticatedUser } from '@marxan-api/app.controller';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRoleInProjectDto } from './dto/user-role-project.dto';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Projects-Users Roles')
@Controller(`${apiGlobalPrefixes.v1}/roles/projects`)
export class ProjectAclController {
  constructor(private readonly projectAclService: ProjectAclService) {}

  @Get(':projectId/users')
  async findUsersInProject(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<UserRoleInProjectDto[]> {
    await this.projectAclService.checkUserIsOwner(req.user.id, projectId);

    return await this.projectAclService.findUsersInProject(projectId);
  }

  @Patch('/users')
  async updateUserInProject(
    @Body() dto: UserRoleInProjectDto,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<void> {
    await this.projectAclService.checkUserIsOwner(req.user.id, dto.projectId);

    await this.projectAclService.updateUserInProject(dto);
  }

  @Delete(':projectId/users/:userId')
  async deleteUserFromProject(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<void> {
    await this.projectAclService.checkUserIsOwner(req.user.id, projectId);

    await this.projectAclService.revokeAccess(projectId, userId);
  }
}
