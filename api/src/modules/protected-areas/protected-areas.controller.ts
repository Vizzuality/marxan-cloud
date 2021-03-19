import { Controller, Get, Query, UseGuards } from '@nestjs/common';
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
    @Query('filter') filter: Record<string, unknown>,
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
  ): Promise<IUCNProtectedAreaCategoryResult[]> {
    return await this.service.findAllProtectedAreaCategories(
      fetchSpecification,
      undefined,
      {
        adminAreaId: filter?.adminAreaId,
      },
    );
  }
}
