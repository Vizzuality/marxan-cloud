import { Body, Controller, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { apiGlobalPrefixes } from '@marxan-api/api.config';
import { JwtAuthGuard } from '@marxan-api/guards/jwt-auth.guard';

import { IsMissingAclImplementation } from '@marxan-api/decorators/acl.decorator';
import { WebshotService, WebshotSummaryReportConfig } from './webshot.service';

@IsMissingAclImplementation()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Webshot')
@Controller(`${apiGlobalPrefixes.v1}`)
export class WebshotController {
  constructor(public readonly service: WebshotService) {}

  @ApiOperation({ description: 'Get PDF summary report for scenario' })
  @ApiOkResponse({ type: 'application/pdf' })
  @Post('/projects/:projectId/summary-report')
  async getSummaryReportForProject(
    @Body() config: WebshotSummaryReportConfig,
    @Param('projectId', ParseUUIDPipe) projectId: string,
  ): Promise<any> {
    return await this.service.getSummaryReportForProject(projectId, config);
  }
}
