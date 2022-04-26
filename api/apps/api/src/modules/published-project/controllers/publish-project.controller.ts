import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  ForbiddenException,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseBoolPipe,
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
  internalError,
  notFound,
  notPublished,
  PublishedProjectService,
  sameUnderModerationStatus,
  underModerationError,
} from '../published-project.service';
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
import {
  PublishedProjectResultPlural,
  PublishedProjectResultSingular,
} from '../dto/read-result.dtos';
import { JSONAPIQueryParams } from '@marxan-api/decorators/json-api-parameters.decorator';
import { publishedProjectResource } from '../published-project.resource';
import {
  FetchSpecification,
  ProcessFetchSpecification,
} from 'nestjs-base-service';
import { PublishedProjectSerializer } from '../published-project.serializer';
import { CreatePublishProjectDto } from '../dto/publish-project.dto';
import { RequestPublishedProjectCloneResponseDto } from '@marxan-api/modules/projects/dto/export.project.dto';
import { ProjectsService } from '@marxan-api/modules/projects/projects.service';
import { ExportId } from '@marxan-api/modules/clone';
import { UserId } from '@marxan/domain-ids';
import { mapAclDomainToHttpError } from '@marxan-api/utils/acl.utils';
import { AppSessionTokenCookie } from '@marxan-api/decorators/app-session-token-cookie.decorator';

@IsMissingAclImplementation()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags(projectResource.className)
@Controller(`${apiGlobalPrefixes.v1}/projects`)
export class PublishProjectController {
  constructor(
    private readonly publishedProjectService: PublishedProjectService,
    private readonly serializer: PublishedProjectSerializer,
    private readonly projectsService: ProjectsService,
  ) {}

  @Post(':id/publish')
  @ApiNoContentResponse()
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  @ApiInternalServerErrorResponse()
  async publish(
    @Param('id') id: string,
    @Body() dto: CreatePublishProjectDto,
    @Request() req: RequestWithAuthenticatedUser,
    @AppSessionTokenCookie() appSessionTokenCookie: string,
  ): Promise<void> {
    const { config } = dto;
    /**
     * If a frontend app session token was provided via cookie, use this to let
     * the webshot service authenticate to the app, otherwise fall back to
     * looking for the relevant cookies in the body of the request.
     *
     * @todo Remove this once the new auth workflow via `Cookie` header is
     * stable.
     */
    const configForWebshot = appSessionTokenCookie
      ? {
          ...config,
          cookie: appSessionTokenCookie,
        }
      : config;
    const dtoWithUpdatedConfig = {
      ...dto,
      config: configForWebshot || config,
    };
    const result = await this.publishedProjectService.publish(
      id,
      req.user.id,
      dtoWithUpdatedConfig,
    );

    if (isLeft(result)) {
      switch (result.left) {
        case accessDenied:
          throw new ForbiddenException();
        case alreadyPublished:
          throw new BadRequestException('This project was already published.');
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

  @Post(':id/unpublish')
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
        case notPublished:
          throw new BadRequestException('This project is not published yet.');
        case notFound:
          throw new NotFoundException();
        case internalError:
          throw new InternalServerErrorException();
        case underModerationError:
          throw new BadRequestException(
            'This project is under moderation and it can not be unpublished.',
          );
        default:
          const _exhaustiveCheck: never = result.left;
          throw _exhaustiveCheck;
      }
    }

    return;
  }

  @Patch(':id/moderation-status/set')
  @ApiNoContentResponse()
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  @ApiInternalServerErrorResponse()
  async setUnderModeration(
    @Param('id') id: string,
    @Request() req: RequestWithAuthenticatedUser,
  ): Promise<void> {
    const result = await this.publishedProjectService.changeModerationStatus(
      id,
      req.user.id,
      true,
    );

    if (isLeft(result)) {
      switch (result.left) {
        case accessDenied:
          throw new ForbiddenException();
        case notFound:
          throw new NotFoundException();
        case internalError:
          throw new InternalServerErrorException();
        case sameUnderModerationStatus:
          throw new BadRequestException(
            'The project is already under moderation.',
          );
        default:
          const _exhaustiveCheck: never = result.left;
          throw _exhaustiveCheck;
      }
    }

    return;
  }

  @Patch(':id/moderation-status/clear')
  @ApiNoContentResponse()
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  @ApiInternalServerErrorResponse()
  async clearUnderModeration(
    @Param('id') id: string,
    @Request() req: RequestWithAuthenticatedUser,
    @Query('alsoUnpublish', new DefaultValuePipe(false), ParseBoolPipe)
    alsoUnpublish: boolean,
  ): Promise<void> {
    const result = await this.publishedProjectService.changeModerationStatus(
      id,
      req.user.id,
      false,
      alsoUnpublish,
    );

    if (isLeft(result)) {
      switch (result.left) {
        case accessDenied:
          throw new ForbiddenException();
        case notFound:
          throw new NotFoundException();
        case internalError:
          throw new InternalServerErrorException();
        case sameUnderModerationStatus:
          throw new BadRequestException(
            'The project is already not under moderation.',
          );
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
  async findAllByAdmin(
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
  @ApiOperation({ description: 'Find public project by id for admins.' })
  @ApiOkResponse({ type: PublishedProjectResultSingular })
  @Get('published-projects/:id/by-admin')
  async findOneByAdmin(
    @Req() req: RequestWithAuthenticatedUser,
    @Param('id') id: string,
  ): Promise<PublishedProjectResultSingular> {
    const result = await this.publishedProjectService.findOne(id, {
      authenticatedUser: req.user,
    });

    if (isLeft(result)) {
      switch (result.left) {
        case notFound:
          throw new NotFoundException();
        case accessDenied:
          throw new ForbiddenException();
        default:
          const _exhaustiveCheck: never = result.left;
          throw _exhaustiveCheck;
      }
    }

    return await this.serializer.serialize(result.right);
  }

  @ApiNotFoundResponse()
  @ApiOperation({
    description:
      'Clones a public project and makes the user the owner of the new project.',
  })
  @ApiOkResponse({ type: RequestPublishedProjectCloneResponseDto })
  @Post('published-projects/:exportId/clone')
  async clone(
    @Req() req: RequestWithAuthenticatedUser,
    @Param('exportId') exportId: string,
  ): Promise<RequestPublishedProjectCloneResponseDto> {
    const cloneResult = await this.projectsService.clone(
      new ExportId(exportId),
      new UserId(req.user.id),
    );

    if (isLeft(cloneResult)) {
      throw mapAclDomainToHttpError(cloneResult.left, {
        userId: req.user.id,
        resourceType: projectResource.name.plural,
        exportId,
      });
    }

    return {
      importId: cloneResult.right.importId,
      projectId: cloneResult.right.projectId,
    };
  }
}
