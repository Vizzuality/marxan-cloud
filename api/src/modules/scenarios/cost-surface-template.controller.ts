import { Controller, Get, Header, Param, Res, UseGuards } from '@nestjs/common';
import * as express from 'express';
import {
  ApiAcceptedResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { apiGlobalPrefixes } from '../../api.config';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { scenarioResource } from './scenario.api.entity';
import {
  FileNotFound,
  FileNotReady,
  CostTemplateService,
} from './cost-template.service';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags(scenarioResource.className)
@Controller(`${apiGlobalPrefixes.v1}/scenarios/:id/cost-surface`)
export class CostSurfaceTemplateController {
  constructor(private readonly shapefileTemplates: CostTemplateService) {}

  @Get('shapefile-template')
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
    const shapefileStatus = await this.shapefileTemplates.getShapefileCostTemplate(
      id,
      res,
    );

    if (shapefileStatus === FileNotReady) {
      res.status(202).send();
      return;
    }

    if (shapefileStatus === FileNotFound) {
      this.shapefileTemplates.scheduleShapefileCostTemplateCreation(id);
      res.status(202).send();
      return;
    }
  }
}
