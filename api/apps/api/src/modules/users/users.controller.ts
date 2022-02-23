import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { User, userResource, UserResult } from './user.api.entity';
import { UsersService } from './users.service';

import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { apiGlobalPrefixes } from '@marxan-api/api.config';
import { JwtAuthGuard } from '@marxan-api/guards/jwt-auth.guard';
import { RequestWithAuthenticatedUser } from '@marxan-api/app.controller';
import { JSONAPIQueryParams } from '@marxan-api/decorators/json-api-parameters.decorator';
import {
  FetchSpecification,
  ProcessFetchSpecification,
} from 'nestjs-base-service';
import { UpdateUserDTO } from './dto/update.user.dto';
import { UpdateUserPasswordDTO } from './dto/update.user-password';
import { IsMissingAclImplementation } from '@marxan-api/decorators/acl.decorator';
import { PlatformAdminEntity } from './platform-admin/admin.api.entity';
import { isLeft } from 'fp-ts/lib/Either';

@IsMissingAclImplementation()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags(userResource.className)
@Controller(`${apiGlobalPrefixes.v1}/users`)
export class UsersController {
  constructor(public readonly service: UsersService) {}

  @ApiOperation({
    description: 'Find all users',
  })
  @ApiOkResponse({
    type: User,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized.',
  })
  @ApiForbiddenResponse({
    description:
      'The current user does not have suitable permissions for this request.',
  })
  @JSONAPIQueryParams({
    entitiesAllowedAsIncludes: userResource.entitiesAllowedAsIncludes,
  })
  @Get()
  async findAll(
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
  ): Promise<User[]> {
    const results = await this.service.findAllPaginated(fetchSpecification);
    return this.service.serialize(results.data, results.metadata);
  }

  @ApiOperation({
    description:
      'Update the password of a user, if they can present the current one.',
  })
  @ApiOkResponse({ type: UserResult })
  @Patch('me/password')
  async updateOwnPassword(
    @Body(new ValidationPipe()) dto: UpdateUserPasswordDTO,
    @Request() req: RequestWithAuthenticatedUser,
  ): Promise<void> {
    return await this.service.updateOwnPassword(req.user.id, dto, {
      authenticatedUser: req.user,
    });
  }

  @ApiOperation({ description: 'Update a user.' })
  @ApiOkResponse({ type: UserResult })
  @Patch('me')
  async update(
    @Body(new ValidationPipe({ forbidNonWhitelisted: true }))
    dto: UpdateUserDTO,
    @Request() req: RequestWithAuthenticatedUser,
  ): Promise<UserResult> {
    return this.service.serialize(
      await this.service.update(req.user.id, dto, {
        authenticatedUser: req.user,
      }),
    );
  }

  @ApiOperation({
    description: 'Retrieve attributes of the current user',
  })
  @ApiOkResponse({
    type: UserResult,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized.',
  })
  @ApiForbiddenResponse({
    description:
      'The current user does not have suitable permissions for this request.',
  })
  @Get('me')
  async userMetadata(
    @Request() req: RequestWithAuthenticatedUser,
  ): Promise<UserResult> {
    return this.service.serialize(await this.service.getById(req.user.id));
  }

  @ApiOperation({
    description: 'Mark user as deleted.',
  })
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @Delete('me')
  async deleteOwnUser(
    @Request() req: RequestWithAuthenticatedUser,
  ): Promise<void> {
    return this.service.markAsDeleted(req.user.id);
  }

  @ApiOperation({
    description: 'Get list of admins in platform.',
  })
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @Get('admins')
  async getAdmins(
    @Request() req: RequestWithAuthenticatedUser,
  ): Promise<PlatformAdminEntity[]> {
    const result = await this.service.getPlatformAdmins(req.user.id);
    if (isLeft(result)) {
      throw new ForbiddenException();
    }
    return result.right;
  }

  @ApiOperation({
    description: 'Add user as admin.',
  })
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @Post('admins/:id')
  async addAdmin(
    @Request() req: RequestWithAuthenticatedUser,
    @Param('id', ParseUUIDPipe) userIdToAdd: string,
  ): Promise<void> {
    const result = await this.service.addAdmin(req.user.id, userIdToAdd);
    if (isLeft(result)) {
      throw new ForbiddenException();
    }
  }

  @ApiOperation({
    description: 'Revoke admin permissions from user.',
  })
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @Delete('admins/:id')
  async deleteAdmin(
    @Request() req: RequestWithAuthenticatedUser,
    @Param('id', ParseUUIDPipe) userIdToDelete: string,
  ): Promise<void> {
    const result = await this.service.deleteAdmin(req.user.id, userIdToDelete);
    if (isLeft(result)) {
      throw new ForbiddenException();
    }
  }
}
