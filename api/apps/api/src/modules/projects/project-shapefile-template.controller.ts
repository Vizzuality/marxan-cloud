import {
  Controller,
  Get,
  Header,
  HttpStatus,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';
import * as express from 'express';
import {
  ApiAcceptedResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { apiGlobalPrefixes } from '@marxan-api/api.config';
import { JwtAuthGuard } from '@marxan-api/guards/jwt-auth.guard';

import { IsMissingAclImplementation } from '@marxan-api/decorators/acl.decorator';
import {
  FileNotReady,
  ScenarioCostSurfaceTemplateService,
} from '@marxan-api/modules/scenarios/cost-surface-template/scenario-cost-surface-template.service';

@IsMissingAclImplementation()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags()
@Controller(`${apiGlobalPrefixes.v1}/projects`)
export class ProjectShapefileTemplateController {
  constructor(
    private readonly scenarioCostSurfaceTemplateService: ScenarioCostSurfaceTemplateService,
  ) {}

  @Get(':projectId/shapefile-template')
  @ApiAcceptedResponse()
  @ApiOkResponse({
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @Header('Content-Type', 'application/zip')
  async shapefileTemplate(
    @Param('id') id: string,
    @Res() res: express.Response,
  ): Promise<void> {
    const shapefileStatus = await this.scenarioCostSurfaceTemplateService.getTemplateShapefile(
      id,
      res,
    );

    if (shapefileStatus === FileNotReady) {
      res.status(HttpStatus.GATEWAY_TIMEOUT).send();
      return;
    }
  }
}
