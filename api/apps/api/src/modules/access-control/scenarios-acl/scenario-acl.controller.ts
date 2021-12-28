import { apiGlobalPrefixes } from '@marxan-api/api.config';
import {
  Controller,
  Req,
  Param,
  ParseUUIDPipe,
  UseGuards,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  Delete,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtAuthGuard } from '@marxan-api/guards/jwt-auth.guard';
import { ScenarioAclService } from '@marxan-api/modules/access-control/scenarios-acl/scenario-acl.service';
import { RequestWithAuthenticatedUser } from '@marxan-api/app.controller';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { isLeft } from 'fp-ts/lib/These';
import { lastOwner, forbiddenError } from '@marxan-api/modules/access-control';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Scenarios-Users Roles')
@Controller(`${apiGlobalPrefixes.v1}/roles/scenarios`)
export class ScenarioAclController {
  constructor(private readonly scenarioAclService: ScenarioAclService) {}

  @Delete(':scenarioId/users/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke access to user from project' })
  @ApiNoContentResponse({
    status: 204,
    description: 'User was deleted correctly',
  })
  async deleteUserFromProject(
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
      switch (result.left) {
        case lastOwner:
          throw new ForbiddenException(
            `There must be at least one owner of scenario ${scenarioId}`,
          );
        case forbiddenError:
          throw new ForbiddenException(`
            User is not authorized,
          `);
        default:
          throw new InternalServerErrorException();
      }
    }
  }
}
