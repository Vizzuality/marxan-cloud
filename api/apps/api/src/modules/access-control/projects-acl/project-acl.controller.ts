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
  HttpStatus,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '@marxan-api/guards/jwt-auth.guard';
import { ProjectAclService } from './project-acl.service';
import { RequestWithAuthenticatedUser } from '@marxan-api/app.controller';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { isLeft } from 'fp-ts/lib/These';
import {
  UserRoleInProjectDto,
  UsersInProjectResult,
} from './dto/user-role-project.dto';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Projects-Users Roles')
@Controller(`${apiGlobalPrefixes.v1}/roles/projects`)
export class ProjectAclController {
  constructor(private readonly projectAclService: ProjectAclService) {}

  @Get(':projectId/users')
  @ApiOperation({ summary: 'Get all users with roles in project' })
  @ApiOkResponse({
    description: 'User roles found',
    isArray: true,
    type: UserRoleInProjectDto,
  })
  async findUsersInProject(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Req() req: RequestWithAuthenticatedUser,
    @Query('q') nameSearch?: string,
  ): Promise<UsersInProjectResult> {
    const result = await this.projectAclService.findUsersInProject(
      projectId,
      req.user.id,
      nameSearch,
    );

    if (isLeft(result)) {
      throw new ForbiddenException();
    }

    return { data: result.right };
  }

  @Patch(':projectId/users')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Add user and proper role to a project' })
  @ApiNoContentResponse({
    status: 204,
    description: 'User was updated correctly',
  })
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

    if (isLeft(result)) {
      throw new ForbiddenException();
    }
  }

  @Delete(':projectId/users/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke access to user from project' })
  @ApiNoContentResponse({
    status: 204,
    description: 'User was deleted correctly',
  })
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

    if (isLeft(result)) {
      throw new ForbiddenException();
    }
  }
}
