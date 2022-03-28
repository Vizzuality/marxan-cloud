import { apiGlobalPrefixes } from '@marxan-api/api.config';
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@marxan-api/guards/jwt-auth.guard';
import { ScenarioAclService } from '@marxan-api/modules/access-control/scenarios-acl/scenario-acl.service';
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
  UserRoleInScenarioDto,
  UsersInScenarioResult,
} from '@marxan-api/modules/access-control/scenarios-acl/dto/user-role-scenario.dto';
import { mapAclDomainToHttpError } from '@marxan-api/utils/acl.utils';
import { ImplementsAcl } from '@marxan-api/decorators/acl.decorator';

@ImplementsAcl()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Scenarios-Users Roles')
@Controller(`${apiGlobalPrefixes.v1}/roles/scenarios`)
export class ScenarioAclController {
  constructor(private readonly scenarioAclService: ScenarioAclService) {}

  @Get(':scenarioId/users')
  @ApiOperation({ summary: 'Get all users with roles in scenario' })
  @ApiOkResponse({
    description: 'User roles found',
    isArray: true,
    type: UserRoleInScenarioDto,
  })
  async findUsersInScenario(
    @Param('scenarioId', ParseUUIDPipe) scenarioId: string,
    @Req() req: RequestWithAuthenticatedUser,
    @Query('q') nameSearch?: string,
  ): Promise<UsersInScenarioResult> {
    const result = await this.scenarioAclService.findUsersInScenario(
      scenarioId,
      req.user.id,
      nameSearch,
    );

    if (isLeft(result)) {
      throw new ForbiddenException();
    }

    return { data: result.right };
  }

  @Patch(':scenarioId/users')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Add user and proper role to a scenario' })
  @ApiNoContentResponse({
    status: 204,
    description: 'User was updated correctly',
  })
  async updateUserInScenario(
    @Body() userAndRoleToChange: UserRoleInScenarioDto,
    @Param('scenarioId', ParseUUIDPipe) scenarioId: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<void> {
    const result = await this.scenarioAclService.updateUserInScenario(
      scenarioId,
      userAndRoleToChange,
      req.user.id,
    );

    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        userId: userAndRoleToChange.userId,
      });
    }
  }

  @Delete(':scenarioId/users/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke access to user from scenario' })
  @ApiNoContentResponse({
    status: 204,
    description: 'User was deleted correctly',
  })
  async deleteUserFromScenario(
    @Param('scenarioId', ParseUUIDPipe) scenarioId: string,
    @Param('userId', ParseUUIDPipe) userToDeleteId: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<void | boolean> {
    const result = await this.scenarioAclService.revokeAccess(
      scenarioId,
      userToDeleteId,
      req.user.id,
    );

    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left);
    }
  }
}
