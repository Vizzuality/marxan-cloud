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
  ProjectTemplateService,
} from '@marxan-api/modules/projects/shapefile-template/project-template.service';

@IsMissingAclImplementation()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags()
@Controller(`${apiGlobalPrefixes.v1}/projects`)
export class ProjectTemplateController {
  constructor(
    private readonly projectTemplateService: ProjectTemplateService,
  ) {}

  @Get(':projectId/cost-surface/shapefile-template')
  @ApiAcceptedResponse()
  @ApiOkResponse({
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @Header('Content-Type', 'application/zip')
  async costSurfaceShapefileTemplate(
    @Param('projectId') projectId: string,
    @Res() res: express.Response,
  ): Promise<void> {
    const shapefileStatus = await this.projectTemplateService.getTemplateShapefile(
      projectId,
      res,
    );

    if (shapefileStatus === FileNotReady) {
      res.status(HttpStatus.GATEWAY_TIMEOUT).send();
      return;
    }
  }

  @Get(':projectId/project-shapefile-template')
  @ApiAcceptedResponse()
  @ApiOkResponse({
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @Header('Content-Type', 'application/zip')
  async projectShapefileTemplate(
    @Param('id') id: string,
    @Res() res: express.Response,
  ): Promise<void> {
    const shapefileStatus = await this.projectTemplateService.getTemplateShapefile(
      id,
      res,
    );

    if (shapefileStatus === FileNotReady) {
      res.status(HttpStatus.GATEWAY_TIMEOUT).send();
      return;
    }
  }
}
