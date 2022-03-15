import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  organizationResource,
  OrganizationResultPlural,
  OrganizationResultSingular,
} from './organization.api.entity';
import { OrganizationsService } from './organizations.service';

import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { apiGlobalPrefixes } from '@marxan-api/api.config';
import { JwtAuthGuard } from '@marxan-api/guards/jwt-auth.guard';

import {
  JSONAPIQueryParams,
  JSONAPISingleEntityQueryParams,
} from '@marxan-api/decorators/json-api-parameters.decorator';
import { CreateOrganizationDTO } from './dto/create.organization.dto';
import { UpdateOrganizationDTO } from './dto/update.organization.dto';
import { RequestWithAuthenticatedUser } from '@marxan-api/app.controller';
import {
  FetchSpecification,
  ProcessFetchSpecification,
} from 'nestjs-base-service';
import { IsMissingAclImplementation } from '@marxan-api/decorators/acl.decorator';
import { isLeft } from 'fp-ts/Either';

@IsMissingAclImplementation()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags(organizationResource.className)
@Controller(`${apiGlobalPrefixes.v1}/organizations`)
export class OrganizationsController {
  constructor(public readonly service: OrganizationsService) {}

  @ApiOperation({
    description: 'Find all organizations',
  })
  @ApiOkResponse({
    type: OrganizationResultPlural,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized.',
  })
  @ApiForbiddenResponse({
    description:
      'The current user does not have suitable permissions for this request.',
  })
  @JSONAPIQueryParams({
    entitiesAllowedAsIncludes: organizationResource.entitiesAllowedAsIncludes,
    availableFilters: [{ name: 'name' }],
  })
  @Get()
  async findAll(
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
  ): Promise<OrganizationResultPlural> {
    const results = await this.service.findAllPaginated(fetchSpecification);
    return this.service.serialize(results.data, results.metadata);
  }

  @ApiOperation({ description: 'Find organization by id' })
  @ApiOkResponse({ type: OrganizationResultSingular })
  @JSONAPISingleEntityQueryParams({
    entitiesAllowedAsIncludes: organizationResource.entitiesAllowedAsIncludes,
    availableFilters: [{ name: 'name' }],
  })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<OrganizationResultSingular> {
    const result = await this.service.findOne(id);
    if (isLeft(result))
      throw new NotFoundException(
        `Could not find an organization with ID: ${id}`,
      );

    return await this.service.serialize(result.right);
  }

  @ApiOperation({ description: 'Create organization' })
  @ApiCreatedResponse({ type: OrganizationResultSingular })
  @Post()
  async create(
    @Body() dto: CreateOrganizationDTO,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<OrganizationResultSingular> {
    return await this.service.serialize(
      await this.service.create(dto, { authenticatedUser: req.user }),
    );
  }

  @ApiOperation({ description: 'Update organization' })
  @ApiOkResponse({ type: OrganizationResultSingular })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationDTO,
  ): Promise<OrganizationResultSingular> {
    return await this.service.serialize(await this.service.update(id, dto));
  }

  @ApiOperation({ description: 'Delete organization' })
  @ApiOkResponse()
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.service.remove(id);
  }
}
