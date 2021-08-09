import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
  Req,
  Res,
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
  ProtectedAreasService,
} from './protected-areas.service';
import { IUCNProtectedAreaCategoryResult } from './dto/iucn-protected-area-category.dto';
import { Request, Response } from 'express';
import { ProxyService } from '@marxan-api/modules/proxy/proxy.service';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags(protectedAreaResource.className)
@Controller(`${apiGlobalPrefixes.v1}/protected-areas`)
export class ProtectedAreasController {
  constructor(
    public readonly service: ProtectedAreasService,
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

  @ApiOperation({
    description: 'Get tile for protected areas.',
  })
  /**
   *@todo Change ApiOkResponse mvt type
   */
  @ApiOkResponse({
    description: 'Binary protobuffer mvt tile',
    type: String,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiParam({
    name: 'z',
    description: 'The zoom level ranging from 0 - 20',
    type: Number,
    required: true,
  })
  @ApiParam({
    name: 'x',
    description: 'The tile x offset on Mercator Projection',
    type: Number,
    required: true,
  })
  @ApiParam({
    name: 'y',
    description: 'The tile y offset on Mercator Projection',
    type: Number,
    required: true,
  })
  @ApiQuery({
    name: 'id',
    description: 'Id of WDPA area',
    type: String,
    required: false,
    example: 'e5c3b978-908c-49d3-b1e3-89727e9f999c',
  })
  @ApiQuery({
    name: 'bbox',
    description: 'Bounding box of the project [xMin, xMax, yMin, yMax]',
    type: [Number],
    required: false,
    example: [-1, 40, 1, 42],
  })
  @Get('/preview/tiles/:z/:x/:y.mvt')
  async proxyProtectedAreaTile(
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
      ? fetchSpecification.filter!.adminAreaId[0]
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
}
