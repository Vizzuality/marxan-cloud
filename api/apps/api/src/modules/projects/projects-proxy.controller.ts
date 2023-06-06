import {
  Body,
  Controller,
  Get,
  Header,
  InternalServerErrorException,
  Param,
  ParseUUIDPipe,
  Req,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { RequestWithAuthenticatedUser } from '@marxan-api/app.controller';
import { apiGlobalPrefixes } from '@marxan-api/api.config';

import { projectResource } from './project.api.entity';
import { ProjectsService } from './projects.service';
import { Response } from 'express';
import { AppSessionTokenCookie } from '@marxan-api/decorators/app-session-token-cookie.decorator';
import { WebshotSFComparisonMapPdfConfig } from '@marxan/webshot';
import { isLeft } from 'fp-ts/Either';
import { mapAclDomainToHttpError } from '@marxan-api/utils/acl.utils';

@ApiTags(projectResource.className)
@Controller(`${apiGlobalPrefixes.v1}/projects`)
export class ProjectsProxyController {
  constructor(public readonly projectsService: ProjectsService) {}

  @ApiParam({
    name: 'scenarioIdA',
    description: 'First scenario to be compare',
    type: String,
    required: true,
    example: 'e5c3b978-908c-49d3-b1e3-89727e9f999c',
  })
  @ApiParam({
    name: 'scenarioIdB',
    description: 'Second scenario to be compare with the first',
    type: String,
    required: true,
    example: 'e5c3b978-908c-49d3-b1e3-89727e9f999c',
  })
  @ApiOperation({
    description: 'Get comparison map for two scenarios in PDF format',
  })
  @Header('content-type', 'application/pdf')
  @Get('comparison-map/:scenarioIdA/compare/:scenarioIdB')
  async proxyProtectedAreaTile(
    @Body() config: WebshotSFComparisonMapPdfConfig,
    @Param('scenarioIdA', ParseUUIDPipe) scenarioIdA: string,
    @Param('scenarioIdB', ParseUUIDPipe) scenarioIdB: string,
    @Res() res: Response,
    @Req() req: RequestWithAuthenticatedUser,
    @AppSessionTokenCookie() appSessionTokenCookie: string,
  ) {
    const configForWebshot = appSessionTokenCookie
      ? {
          ...config,
          cookie: appSessionTokenCookie,
        }
      : config;

    // @debt Refactor to use @nestjs/common's StreamableFile
    // (https://docs.nestjs.com/techniques/streaming-files#streamable-file-class)
    // after upgrading NestJS to v8.
    const pdfStream = await this.projectsService.getScenarioFrequencyComparisonMap(
      scenarioIdA,
      scenarioIdB,
      req.user.id,
      configForWebshot,
    );

    if (isLeft(pdfStream)) {
      throw mapAclDomainToHttpError(pdfStream.left, {});
    }

    if (isLeft(pdfStream)) {
      return new InternalServerErrorException(
        'Unexpected error while preparing scenario frequency comparison map.',
      );
    }

    pdfStream.right.pipe(res);
  }
}
