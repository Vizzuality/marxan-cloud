import { apiGlobalPrefixes } from '@marxan-api/api.config';
import {
  Controller,
  Get,
  Req,
  Param,
  ParseUUIDPipe,
  UseGuards,
  ForbiddenException,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '@marxan-api/guards/jwt-auth.guard';
import { ScenarioAclService } from '@marxan-api/modules/access-control/scenarios-acl/scenario-acl.service';
import { RequestWithAuthenticatedUser } from '@marxan-api/app.controller';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { isLeft } from 'fp-ts/lib/These';
import {
  UserRoleInScenarioDto,
  UsersInScenarioResult,
} from '@marxan-api/modules/access-control/scenarios-acl/dto/user-role-scenario.dto';

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
  async findUsersInProject(
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
  };
}
