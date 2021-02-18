import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { Organization, OrganizationResult } from './organization.api.entity';
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
import { apiGlobalPrefixes } from 'api.config';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { Post } from '@nestjs/common';

import { JSONAPIQueryParams } from 'decorators/json-api-parameters.decorator';
import { CreateOrganizationDTO } from './dto/create.organization.dto';
import { BaseServiceResource } from 'types/resource.interface';
import { UpdateOrganizationDTO } from './dto/update.organization.dto';
import { RequestWithAuthenticatedUser } from 'app.controller';
import { FetchSpecification, Pagination } from 'nestjs-base-service';

const resource: BaseServiceResource = {
  className: 'Organization',
  name: {
    singular: 'organization',
    plural: 'organizations',
  },
};

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags(resource.className)
@Controller(`${apiGlobalPrefixes.v1}/organizations`)
export class OrganizationsController {
  constructor(public readonly service: OrganizationsService) {}

  @ApiOperation({
    description: 'Find all organizations',
  })
  @ApiOkResponse({
    type: OrganizationResult,
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
    @Pagination() pagination: FetchSpecification,
  ): Promise<OrganizationResult> {
    const results = await this.service.findAllPaginated(pagination);
    return this.service.serialize(results.data, results.metadata);
  }

  @ApiOperation({ description: 'Find organization by id' })
  @ApiOkResponse({ type: OrganizationResult })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<OrganizationResult> {
    return await this.service.serialize(await this.service.getById(id));
  }

  @ApiOperation({ description: 'Create organization' })
  @ApiCreatedResponse({ type: OrganizationResult })
  @Post()
  async create(
    @Body(new ValidationPipe()) dto: CreateOrganizationDTO,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<OrganizationResult> {
    return await this.service.serialize([
      await this.service.create(dto, { authenticatedUser: req.user }),
    ]);
  }

  @ApiOperation({ description: 'Update organization' })
  @ApiOkResponse({ type: OrganizationResult })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) dto: UpdateOrganizationDTO,
  ): Promise<OrganizationResult> {
    return await this.service.serialize([await this.service.update(id, dto)]);
  }

  @ApiOperation({ description: 'Delete organization' })
  @ApiOkResponse()
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.service.remove(id);
  }
}
