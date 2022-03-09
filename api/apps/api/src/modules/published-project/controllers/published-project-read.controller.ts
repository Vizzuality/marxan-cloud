import {
  Controller,
  ForbiddenException,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import {
  accessDenied,
  PublishedProjectService,
  notFound,
  internalError,
} from '../published-project.service';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { apiGlobalPrefixes } from '@marxan-api/api.config';
import {
  FetchSpecification,
  ProcessFetchSpecification,
} from 'nestjs-base-service';
import { JSONAPIQueryParams } from '@marxan-api/decorators/json-api-parameters.decorator';
import { publishedProjectResource } from '@marxan-api/modules/published-project/published-project.resource';
import { PublishedProjectSerializer } from '@marxan-api/modules/published-project/published-project.serializer';
import {
  PublishedProjectResultPlural,
  PublishedProjectResultSingular,
} from '@marxan-api/modules/published-project/dto/read-result.dtos';
import { RequestWithAuthenticatedUser } from '@marxan-api/app.controller';
import { isLeft } from 'fp-ts/lib/Either';

@ApiBearerAuth()
@ApiTags(publishedProjectResource.className)
@Controller(`${apiGlobalPrefixes.v1}/published-projects`)
export class PublishedProjectReadController {
  constructor(
    private readonly publishedProjectService: PublishedProjectService,
    private readonly serializer: PublishedProjectSerializer,
  ) {}

  @ApiOperation({
    description: 'Find all published projects',
  })
  @ApiOkResponse({ type: PublishedProjectResultPlural })
  @JSONAPIQueryParams({
    entitiesAllowedAsIncludes:
      publishedProjectResource.entitiesAllowedAsIncludes,
    availableFilters: [
      { name: 'name' },
      { name: 'organizationId' },
      { name: 'countryId' },
      { name: 'adminAreaLevel1Id' },
      { name: 'adminAreaLevel21Id' },
    ],
  })
  @ApiQuery({
    name: 'q',
    required: false,
    description: `A free search over names`,
  })
  @Get()
  async findAll(
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
    @Req() req: RequestWithAuthenticatedUser,
    @Query('q') namesSearch?: string,
  ): Promise<PublishedProjectResultPlural> {
    const results = await this.publishedProjectService.findAll(
      fetchSpecification,
      {
        params: {
          namesSearch,
        },
        authenticatedUser: req.user,
      },
    );
    return this.serializer.serializeAll(results.data, results.metadata);
  }

  @ApiNotFoundResponse()
  @ApiOperation({ description: 'Find project by id' })
  @ApiOkResponse({ type: PublishedProjectResultSingular })
  @Get(':id')
  async getPublishedOne(
    @Req() req: RequestWithAuthenticatedUser,
    @Param('id') id: string,
  ): Promise<PublishedProjectResultSingular> {
    const result = await this.publishedProjectService.findOne(id, {
      authenticatedUser: req.user,
    });

    if (isLeft(result)) {
      switch (result.left) {
        case accessDenied:
          throw new ForbiddenException();
        case notFound:
          throw new NotFoundException();
        case internalError:
          throw new InternalServerErrorException();
        default:
          const _exhaustiveCheck: never = result.left;
          throw _exhaustiveCheck;
      }
    }

    return await this.serializer.serialize(result.right);
  }
}
