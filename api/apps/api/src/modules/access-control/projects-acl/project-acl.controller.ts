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
  HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from '@marxan-api/guards/jwt-auth.guard';
import { ProjectAclService } from './project-acl.service';
import { RequestWithAuthenticatedUser } from '@marxan-api/app.controller';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
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
    return await this.projectAclService.findUsersInProject(
      projectId,
      req.user.id,
    );
  }

  @Patch(':projectId/users')
  @ApiOkResponse({ status: 204 })
  @HttpCode(204)
  async updateUserInProject(
    @Body() dto: UserRoleInProjectDto,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<void> {
    await this.projectAclService.updateUserInProject(
      projectId,
      dto,
      req.user.id,
    );
  }

  @Delete(':projectId/users/:userId')
  @ApiOkResponse({ status: 204 })
  @HttpCode(204)
  async deleteUserFromProject(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<void> {
    await this.projectAclService.revokeAccess(projectId, userId, req.user.id);
  }
}
