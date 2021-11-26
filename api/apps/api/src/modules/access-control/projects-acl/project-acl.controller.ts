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
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '@marxan-api/guards/jwt-auth.guard';
import { ProjectAclService } from './project-acl.service';
import { RequestWithAuthenticatedUser } from '@marxan-api/app.controller';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRoleInProjectDto } from './dto/user-role-project.dto';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Projects-Users Roles')
@Controller(`${apiGlobalPrefixes.v1}/roles/projects`)
export class ProjectAclController {
  constructor(private readonly projectAclService: ProjectAclService) {}

  @Get(':projectId/users')
  @ApiOperation({ summary: 'Get all users with roles in project' })
  @ApiOkResponse({
    status: 200,
    description: 'User roles found',
    isArray: true,
    type: UserRoleInProjectDto,
  })
  async findUsersInProject(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<UserRoleInProjectDto[] | boolean> {
    const result = await this.projectAclService.findUsersInProject(
      projectId,
      req.user.id,
    );

    if (result === false) {
      throw new ForbiddenException();
    }

    return result;
  }

  @Patch(':projectId/users')
  @HttpCode(204)
  @ApiOperation({ summary: 'Add user and proper role to a project' })
  @ApiResponse({ status: 204, description: 'User was updated correctly' })
  async updateUserInProject(
    @Body() dto: UserRoleInProjectDto,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<void | boolean> {
    const result = await this.projectAclService.updateUserInProject(
      projectId,
      dto,
      req.user.id,
    );

    if (result === false) {
      throw new ForbiddenException();
    }
  }

  @Delete(':projectId/users/:userId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Revoke access to user from project' })
  @ApiResponse({ status: 204, description: 'User was deleted correctly' })
  async deleteUserFromProject(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<void | boolean> {
    const result = await this.projectAclService.revokeAccess(
      projectId,
      userId,
      req.user.id,
    );

    if (result === false) {
      throw new ForbiddenException();
    }
  }
}
