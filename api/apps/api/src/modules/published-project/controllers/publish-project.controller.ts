import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  accessDenied,
  alreadyPublished,
  alreadyUnderModeration,
  internalError,
  notFound,
  PublishedProjectService,
} from '../published-project.service';
import { PublishProjectDto } from '../dto/publish-project.dto';
import { JwtAuthGuard } from '@marxan-api/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { projectResource } from '@marxan-api/modules/projects/project.api.entity';
import { apiGlobalPrefixes } from '@marxan-api/api.config';
import { RequestWithAuthenticatedUser } from '@marxan-api/app.controller';
import { isLeft } from 'fp-ts/Either';
import { IsMissingAclImplementation } from '@marxan-api/decorators/acl.decorator';
import { PublishedProjectResultPlural } from '../dto/read-result.dtos';
import { JSONAPIQueryParams } from '@marxan-api/decorators/json-api-parameters.decorator';
import { publishedProjectResource } from '../published-project.resource';
import {
  FetchSpecification,
  ProcessFetchSpecification,
} from 'nestjs-base-service';
import { PublishedProjectSerializer } from '../published-project.serializer';

@IsMissingAclImplementation()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags(projectResource.className)
@Controller(`${apiGlobalPrefixes.v1}/projects`)
export class PublishProjectController {
  constructor(
    private readonly publishedProjectService: PublishedProjectService,
    private readonly serializer: PublishedProjectSerializer,
  ) {}

  @Post(':id/publish')
  @ApiNoContentResponse()
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  @ApiInternalServerErrorResponse()
  async publish(
    @Param('id') id: string,
    @Body() createPublishedProjectDto: PublishProjectDto,
    @Request() req: RequestWithAuthenticatedUser,
  ): Promise<void> {
    const result = await this.publishedProjectService.publish(id, req.user.id);

    if (isLeft(result)) {
      switch (result.left) {
        case accessDenied:
          throw new ForbiddenException();
        case alreadyPublished:
          throw new BadRequestException();
        case notFound:
          throw new NotFoundException();
        case internalError:
          throw new InternalServerErrorException();
        default:
          const _exhaustiveCheck: never = result.left;
          throw _exhaustiveCheck;
      }
    }

    return;
  }

  @Patch(':id/unpublish')
  @ApiNoContentResponse()
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  @ApiInternalServerErrorResponse()
  async unpublish(
    @Param('id') id: string,
    @Request() req: RequestWithAuthenticatedUser,
  ): Promise<void> {
    const result = await this.publishedProjectService.unpublish(
      id,
      req.user.id,
    );

    if (isLeft(result)) {
      switch (result.left) {
        case accessDenied:
          throw new ForbiddenException();
        case notFound:
          throw new NotFoundException();
        case internalError:
          throw new InternalServerErrorException();
        case alreadyUnderModeration:
          throw new BadRequestException();
        default:
          const _exhaustiveCheck: never = result.left;
          throw _exhaustiveCheck;
      }
    }

    return;
  }

  @ApiOperation({
    description: 'Find all published projects by admin',
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
  @Get('published-projects/by-admin')
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
}
