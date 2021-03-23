import { Controller, Get, Logger, Query, UseGuards } from '@nestjs/common';
import { ProtectedAreaResult } from './protected-area.geo.entity';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { apiGlobalPrefixes } from 'api.config';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { JSONAPIQueryParams } from 'decorators/json-api-parameters.decorator';
import {
  FetchSpecification,
  ProcessFetchSpecification,
} from 'nestjs-base-service';
import {
  protectedAreaResource,
  ProtectedAreasService,
} from './protected-areas.service';
import { IUCNProtectedAreaCategoryResult } from './dto/iucn-protected-area-category.dto';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags(protectedAreaResource.className)
@Controller(`${apiGlobalPrefixes.v1}/protected-areas`)
export class ProtectedAreasController {
  constructor(public readonly service: ProtectedAreasService) {}

  @ApiOperation({
    description:
      'Find unique IUCN categories among protected areas in a single given administrative area.',
  })
  @ApiQuery({
    name: 'filter[adminAreaId]',
    description:
      'Only protected areas within the given admin area will be considered.',
    type: String,
    required: true,
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
    return await this.service.findAllProtectedAreaCategories({
      ...fetchSpecification,
      filter: { ...fetchSpecification.filter, adminAreaId },
    });
  }
}
