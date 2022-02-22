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
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { apiGlobalPrefixes } from '@marxan-api/api.config';
import { JwtAuthGuard } from '@marxan-api/guards/jwt-auth.guard';

import { WebshotService, WebshotSummaryReportConfig } from './webshot.service';
import { Response } from 'express';
import { RequestWithAuthenticatedUser } from '@marxan-api/app.controller';
import { isLeft } from 'fp-ts/lib/Either';
import { mapAclDomainToHttpError } from '@marxan-api/utils/acl.utils';
import { scenarioResource } from '../scenarios/scenario.api.entity';
import { ImplementsAcl } from '@marxan-api/decorators/acl.decorator';

@ImplementsAcl()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Webshot')
@Controller(`${apiGlobalPrefixes.v1}`)
export class WebshotController {
  constructor(public readonly service: WebshotService) {}

  @ApiOperation({ description: 'Get PDF summary report for scenario' })
  @ApiOkResponse()
  @Header('content-type', 'application/pdf')
  @Post('/scenarios/:scenarioId/solutions/report')
  async getSummaryReportForProject(
    @Body() config: WebshotSummaryReportConfig,
    @Param('scenarioId', ParseUUIDPipe) scenarioId: string,
    @Res() res: Response,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<any> {
    // @debt Refactor to use @nestjs/common's StreamableFile
    // (https://docs.nestjs.com/techniques/streaming-files#streamable-file-class)
    // after upgrading NestJS to v8.
    const pdfStream = await this.service.getSummaryReportForScenario(
      scenarioId,
      req.user,
      config,
    );
    if (isLeft(pdfStream)) {
      throw mapAclDomainToHttpError(pdfStream.left, {
        scenarioId,
        userId: req.user.id,
        resourceType: scenarioResource.name.plural,
      });
    }
    pdfStream.right.pipe(res);
  }
}
