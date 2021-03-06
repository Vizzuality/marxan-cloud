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
import { scenarioResource } from '../scenario.api.entity';
import {
  FileNotFound,
  FileNotReady,
  ScenarioCostSurfaceTemplateService,
} from './scenario-cost-surface-template.service';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags(scenarioResource.className)
@Controller(`${apiGlobalPrefixes.v1}/scenarios/:id/cost-surface`)
export class CostSurfaceTemplateController {
  constructor(
    private readonly scenarioCostSurfaceTemplateService: ScenarioCostSurfaceTemplateService,
  ) {}

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
    const shapefileStatus = await this.scenarioCostSurfaceTemplateService.getTemplateShapefile(
      id,
      res,
    );

    if (shapefileStatus === FileNotReady) {
      res.status(HttpStatus.ACCEPTED).send();
      return;
    }

    if (shapefileStatus === FileNotFound) {
      this.scenarioCostSurfaceTemplateService.scheduleTemplateShapefileCreation(
        id,
      );
      res.status(HttpStatus.ACCEPTED).send();
      return;
    }
  }
}
