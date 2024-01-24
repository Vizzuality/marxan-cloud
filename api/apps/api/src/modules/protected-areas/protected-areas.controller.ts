import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ProtectedAreaResult } from './protected-area.geo.entity';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { apiGlobalPrefixes } from '@marxan-api/api.config';
import { JwtAuthGuard } from '@marxan-api/guards/jwt-auth.guard';
import {
  JSONAPIQueryParams,
  JSONAPISingleEntityQueryParams,
} from '@marxan-api/decorators/json-api-parameters.decorator';
import {
  FetchSpecification,
  ProcessFetchSpecification,
} from 'nestjs-base-service';
import {
  protectedAreaResource,
  ProtectedAreasCrudService,
} from './protected-areas-crud.service';
import { IUCNProtectedAreaCategoryResult } from './dto/iucn-protected-area-category.dto';
import { Request, Response } from 'express';
import { ProxyService } from '@marxan-api/modules/proxy/proxy.service';
import { TilesOpenApi } from '@marxan/tiles';
import {
  ImplementsAcl,
  IsMissingAclImplementation,
} from '@marxan-api/decorators/acl.decorator';
import { inlineJobTag } from '@marxan-api/dto/inline-job-tag';
import { RequestWithAuthenticatedUser } from '@marxan-api/app.controller';
import { UpdateFeatureNameDto } from '@marxan-api/modules/geo-features/dto/update-feature-name.dto';
import { UpdateProtectedAreaNameDto } from '@marxan-api/modules/protected-areas/dto/rename.protected-area.dto';
import { isLeft } from 'fp-ts/Either';
import { mapAclDomainToHttpError } from '@marxan-api/utils/acl.utils';
import { projectNotFound } from '@marxan-api/modules/projects/projects.service';
import {
  featureIsLinkedToOneOrMoreScenarios,
  featureNotDeletable,
  featureNotFound,
} from '@marxan-api/modules/geo-features/geo-features.service';

@IsMissingAclImplementation()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags(protectedAreaResource.className)
@Controller(`${apiGlobalPrefixes.v1}/protected-areas`)
export class ProtectedAreasController {
  constructor(
    public readonly service: ProtectedAreasCrudService,
    private readonly proxyService: ProxyService,
  ) {}

  @ApiOperation({
    description: 'Find all protected areas',
  })
  @ApiOkResponse({
    type: ProtectedAreaResult,
  })
  @JSONAPIQueryParams({
    entitiesAllowedAsIncludes: protectedAreaResource.entitiesAllowedAsIncludes,
    availableFilters: [
      { name: 'fullName' },
      { name: 'wdpaId' },
      { name: 'iucnCategory' },
      { name: 'status' },
      { name: 'designation' },
      { name: 'countryId' },
    ],
  })
  @Get()
  async findAll(
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
  ): Promise<ProtectedAreaResult> {
    const results = await this.service.findAllPaginated(fetchSpecification, {});
    return this.service.serialize(results.data, results.metadata);
  }

  @TilesOpenApi()
  @ApiOperation({
    description: 'Get tile for protected areas.',
  })
  @Get('/preview/tiles/:z/:x/:y.mvt')
  async proxyProtectedAreaTile(
    @Req() request: Request,
    @Res() response: Response,
  ) {
    return this.proxyService.proxyTileRequest(request, response);
  }

  @TilesOpenApi()
  @ApiOperation({
    description: 'Get tile for protected areas.',
  })
  @ApiParam({
    name: 'projectId',
    description: 'Project ID to include its Protected Areas',
    type: Number,
    required: true,
  })
  @Get(':projectId/preview/tiles/:z/:x/:y.mvt')
  async proxyProtectedAreaTileForProject(
    @Req() request: Request,
    @Res() response: Response,
  ) {
    return this.proxyService.proxyTileRequest(request, response);
  }

  @ApiOperation({
    description:
      'Find unique IUCN categories among protected areas in a single given administrative area.',
  })
  @ApiQuery({
    name: 'filter[adminAreaId]',
    description:
      'Only protected areas within the given admin area will be considered.',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'filter[customAreaId]',
    description:
      'Only protected areas within the given admin area will be considered.',
    type: String,
    required: false,
  })
  @ApiOkResponse({
    type: IUCNProtectedAreaCategoryResult,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @JSONAPIQueryParams()
  @Get('iucn-categories')
  async listIUCNProtectedAreaCategories(
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
  ): Promise<IUCNProtectedAreaCategoryResult[]> {
    /**
     * @debt This reshaping of filters should likely not be here (or at the very
     * least should be encapsulated in a utility function that abstracts the
     * implementation details away from the controller handler).
     * `fetchSpecification.filter.adminAreaId` will be an array, even if we
     * expect a single value (this is the shape of all the filter values for
     * each filter key as processed via `FetchSpecificationMiddleware`).
     */
    const adminAreaId = Array.isArray(fetchSpecification?.filter?.adminAreaId)
      ? fetchSpecification.filter!.adminAreaId[0]
      : undefined;

    const customAreaId = Array.isArray(fetchSpecification?.filter?.customAreaId)
      ? fetchSpecification.filter!.customAreaId[0]
      : undefined;

    return await this.service.findAllProtectedAreaCategories({
      ...fetchSpecification,
      filter: { ...fetchSpecification.filter, adminAreaId, customAreaId },
    });
  }

  @ApiOperation({
    description: 'Get protected area by id',
  })
  @ApiOkResponse({
    type: ProtectedAreaResult,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @JSONAPISingleEntityQueryParams()
  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
  ): Promise<ProtectedAreaResult> {
    return await this.service.serialize(
      await this.service.getById(id, fetchSpecification),
    );
  }

  @ApiOperation({
    description: `Updates the name of a protected by id`,
  })
  @ApiParam({
    name: 'id',
    description: 'Id of the protected area to be renamed',
  })
  @ApiOkResponse({
    type: ProtectedAreaResult,
  })
  @ApiTags(inlineJobTag)
  @Patch(`:id`)
  async updateName(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: RequestWithAuthenticatedUser,
    @Body() body: UpdateProtectedAreaNameDto,
  ): Promise<ProtectedAreaResult> {
    const result = await this.service.updateProtectedAreaName(
      req.user.id,
      id,
      body,
    );

    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left);
    } else {
      return this.service.serialize(result.right);
    }
  }

  @ApiOperation({
    description: 'Deletes a custom protected area by id',
  })
  @ApiParam({
    name: 'protectedAreaId',
    description: 'ID of the Protected Area to be deleted',
  })
  @ApiTags(inlineJobTag)
  @Delete(':id')
  async deleteFeature(
    @Param('id') protectedAreaId: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<void> {
    const result = await this.service.deleteProtectedArea(
      req.user.id,
      protectedAreaId,
    );

    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left);
    } else {
      return;
    }
  }
}
