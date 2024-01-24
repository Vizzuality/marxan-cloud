import {
  Body,
  Controller,
  Header,
  Param,
  ParseUUIDPipe,
  Post,
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

import { ProjectsService } from './projects.service';
import { Response } from 'express';
import { AppSessionTokenCookie } from '@marxan-api/decorators/app-session-token-cookie.decorator';
import { isLeft } from 'fp-ts/Either';
import { mapAclDomainToHttpError } from '@marxan-api/utils/acl.utils';
import { WebshotBasicPdfConfig } from '@marxan/webshot/webshot.dto';
import { JwtAuthGuard } from '@marxan-api/guards/jwt-auth.guard';
import { ImplementsAcl } from '@marxan-api/decorators/acl.decorator';

@ApiTags('Project - scenario comparison')
@Controller(`${apiGlobalPrefixes.v1}/projects`)
export class ProjectScenarioComparisonController {
  constructor(public readonly projectsService: ProjectsService) {}

  @ApiBearerAuth()
  @ImplementsAcl()
  @UseGuards(JwtAuthGuard)
  @ApiParam({
    name: 'scenarioIdA',
    description: 'First of two scenarios to compare',
    type: String,
    required: true,
    example: 'e5c3b978-908c-49d3-b1e3-89727e9f999c',
  })
  @ApiParam({
    name: 'scenarioIdB',
    description: 'Second of two scenarios to compare',
    type: String,
    required: true,
    example: 'e5c3b978-908c-49d3-b1e3-89727e9f999c',
  })
  @ApiOperation({
    description: 'Get comparison map for two scenarios in PDF format',
  })
  @Header('content-type', 'application/pdf')
  @Post('comparison-map/:scenarioIdA/compare/:scenarioIdB')
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

    const pdfStream =
      await this.projectsService.getScenarioFrequencyComparisonMap(
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
