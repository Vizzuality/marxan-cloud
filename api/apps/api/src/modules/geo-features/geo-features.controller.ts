import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { geoFeatureResource, GeoFeatureResult } from './geo-feature.geo.entity';
import {
  GeoFeaturesService,
  featureNameAlreadyInUse,
  featureNotEditable,
  featureNotFound,
} from './geo-features.service';
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
import { JSONAPIQueryParams } from '@marxan-api/decorators/json-api-parameters.decorator';
import {
  FetchSpecification,
  ProcessFetchSpecification,
} from 'nestjs-base-service';
import { Request, Response } from 'express';
import { ProxyService } from '@marxan-api/modules/proxy/proxy.service';
import {
  ImplementsAcl,
  IsMissingAclImplementation,
} from '@marxan-api/decorators/acl.decorator';
import { GeoFeatureTagsService } from '@marxan-api/modules/geo-feature-tags/geo-feature-tags.service';
import { inlineJobTag } from '@marxan-api/dto/inline-job-tag';
import { RequestWithAuthenticatedUser } from '@marxan-api/app.controller';
import { UpdateFeatureNameDto } from './dto/update-feature-name.dto';
import { isLeft } from 'fp-ts/Either';
import { mapAclDomainToHttpError } from '@marxan-api/utils/acl.utils';

@IsMissingAclImplementation()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags(geoFeatureResource.className)
@Controller(
  `${apiGlobalPrefixes.v1}/${geoFeatureResource.moduleControllerPrefix}`,
)
export class GeoFeaturesController {
  constructor(
    private readonly geoFeatureService: GeoFeaturesService,
    public readonly geoFeaturesTagService: GeoFeatureTagsService,
    private readonly proxyService: ProxyService,
  ) {}

  @ApiOperation({
    description: 'Find all geo features',
  })
  @ApiOkResponse({
    type: GeoFeatureResult,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @JSONAPIQueryParams()
  @Get()
  async findAll(
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
  ): Promise<GeoFeatureResult> {
    const results = await this.geoFeatureService.findAllPaginated(
      fetchSpecification,
    );
    return this.geoFeatureService.serialize(results.data, results.metadata);
  }

  @ImplementsAcl()
  @ApiOperation({
    description: `Updates the name of a feature with the given id`,
  })
  @ApiParam({
    name: 'featureId',
    description: 'Id of the feature to be edited',
  })
  @ApiTags(inlineJobTag)
  @Patch(`:featureId`)
  async updateGeoFeature(
    @Param('featureId') featureId: string,
    @Req() req: RequestWithAuthenticatedUser,
    @Body() body: UpdateFeatureNameDto,
  ) {
    const result = await this.geoFeatureService.updateFeatureForProject(
      req.user.id,
      featureId,
      body,
    );

    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        featureId,
        featureClassName: body.featureClassName,
      });
    } else {
      return this.geoFeatureService.serialize(result.right);
    }
  }

  @ApiOperation({
    description: 'Get tile for a feature by id.',
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
  @ApiParam({
    name: 'id',
    description: 'Specific id of the feature',
    type: String,
    required: true,
  })
  @ApiQuery({
    name: 'bbox',
    description: 'Bounding box of the project [xMin, xMax, yMin, yMax]',
    type: [Number],
    required: false,
    example: [-1, 40, 1, 42],
  })
  @Get(':id/preview/tiles/:z/:x/:y.mvt')
  async proxyFeaturesTile(@Req() request: Request, @Res() response: Response) {
    return this.proxyService.proxyTileRequest(request, response);
  }
}
