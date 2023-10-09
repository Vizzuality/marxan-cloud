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
  ApiParam,
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

// @todo:use Either for error handing,return a stream to the the controller
export class ProjectTemplateController {
  constructor(
    private readonly projectTemplateService: ProjectTemplateService,
  ) {}

  @Get(':id/cost-surfaces/shapefile-template')
  @ApiAcceptedResponse()
  @ApiOkResponse({
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @ApiParam({
    name: 'id',
    description: 'project id',
    type: String,
    required: true,
    example: 'e5c3b978-908c-49d3-b1e3-89727e9f999c',
  })
  @Header('Content-Type', 'application/zip')
  async costSurfaceShapefileTemplate(
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

  @Get(':id/project-grid/shapefile-template')
  @ApiAcceptedResponse()
  @ApiOkResponse({
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @ApiParam({
    name: 'id',
    description: 'project id',
    type: String,
    required: true,
    example: 'e5c3b978-908c-49d3-b1e3-89727e9f999c',
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
