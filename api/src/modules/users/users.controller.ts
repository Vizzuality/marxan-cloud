import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { apiGlobalPrefixes } from 'api.config';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { RequestWithAuthenticatedUser } from 'app.controller';
import { JSONAPIQueryParams } from 'decorators/json-api-parameters.decorator';
import {
  FetchSpecification,
  ProcessFetchSpecification,
} from 'nestjs-base-service';
import { UpdateUserDTO } from './dto/update.user.dto';
import { UpdateUserPasswordDTO } from './dto/update.user-password';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags(userResource.className)
@Controller(`${apiGlobalPrefixes.v1}/users`)
export class UsersController {
  constructor(public readonly service: UsersService) {}

  @ApiOperation({
    description: 'Find all users',
  })
  @ApiResponse({
    type: User,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized.',
  })
  @ApiForbiddenResponse({
    description:
      'The current user does not have suitable permissions for this request.',
  })
  @JSONAPIQueryParams()
  @Get()
  async findAll(
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
  ): Promise<User[]> {
    const results = await this.service.findAllPaginated(fetchSpecification);
    return this.service.serialize(results.data, results.metadata);
  }

  @ApiOperation({ description: 'Update a user.' })
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
  @ApiResponse({
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
}
