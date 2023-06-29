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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { RequestWithAuthenticatedUser } from '@marxan-api/app.controller';
import { apiGlobalPrefixes } from '@marxan-api/api.config';

import { projectResource } from './project.api.entity';
import { ProjectsService } from './projects.service';
import { Response } from 'express';
import { AppSessionTokenCookie } from '@marxan-api/decorators/app-session-token-cookie.decorator';
import { isLeft } from 'fp-ts/Either';
import { mapAclDomainToHttpError } from '@marxan-api/utils/acl.utils';
import { WebshotBasicPdfConfig } from '@marxan/webshot/webshot.dto';
import { JwtAuthGuard } from '@marxan-api/guards/jwt-auth.guard';
import { ImplementsAcl } from '@marxan-api/decorators/acl.decorator';

@ApiTags(projectResource.className)
@Controller(`${apiGlobalPrefixes.v1}/projects`)
export class ProjectsProxyController {
  constructor(public readonly projectsService: ProjectsService) {}

  @ApiBearerAuth()
  @ImplementsAcl()
  @UseGuards(JwtAuthGuard)
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
  //@Get('comparison-map/:scenarioIdA/compare/:scenarioIdB')
  @Get('comparison-map/:scenarioIdA/compare/:scenarioIdB')
  async scenarioFrequencyComparisonMap(
    @Body() config: WebshotBasicPdfConfig,
    @Param('scenarioIdA', ParseUUIDPipe) scenarioIdA: string,
    @Param('scenarioIdB', ParseUUIDPipe) scenarioIdB: string,
    @Res() res: Response,
    @Req() req: RequestWithAuthenticatedUser,
    @AppSessionTokenCookie() appSessionTokenCookie: string,
  ): Promise<void> {
    const configForWebshot = appSessionTokenCookie
      ? {
          ...config,
          cookie: appSessionTokenCookie,
        }
      : config;

    const pdfStream = await this.projectsService.getScenarioFrequencyComparisonMap(
      scenarioIdA,
      scenarioIdB,
      req.user.id,
      configForWebshot,
    );

    if (isLeft(pdfStream)) {
      throw mapAclDomainToHttpError(pdfStream.left, {});
    }

    pdfStream.right.pipe(res);
  }
}