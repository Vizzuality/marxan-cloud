import { All, Controller, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';

import { ProxyService } from './proxy.service';
import { Request, Response } from 'express';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Microservice Proxy Controllet')
@Controller('/api/v1')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @All('geoprocessing')
  @ApiOperation({ summary: 'Proxy to geoprocessing tile service' })
  proxyTile(@Req() request: Request, @Res() response: Response) {
    return this.proxyService.proxyTileRequest(request, response);
  }
}
