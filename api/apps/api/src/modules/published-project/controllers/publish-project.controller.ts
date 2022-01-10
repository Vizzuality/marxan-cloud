import {
  Body,
  Controller,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  accessDenied,
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
  ApiTags,
} from '@nestjs/swagger';
import { projectResource } from '@marxan-api/modules/projects/project.api.entity';
import { apiGlobalPrefixes } from '@marxan-api/api.config';
import { RequestWithAuthenticatedUser } from '@marxan-api/app.controller';
import { isLeft } from 'fp-ts/Either';
import { IsMissingAclImplementation } from '@marxan-api/decorators/acl.decorator';

@IsMissingAclImplementation()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags(projectResource.className)
@Controller(`${apiGlobalPrefixes.v1}/projects`)
export class PublishProjectController {
  constructor(
    private readonly publishedProjectService: PublishedProjectService,
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
        case notFound:
          throw new NotFoundException();
        case internalError:
        default:
          throw new InternalServerErrorException();
      }
    }

    return;
  }
}
