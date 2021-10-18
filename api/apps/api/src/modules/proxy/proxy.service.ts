import { Injectable, Logger } from '@nestjs/common';

import { AppConfig } from '@marxan-api/utils/config.utils';
import { Request, Response } from 'express';
import { get } from 'http';

@Injectable()
export class ProxyService {
  private geoprocessingServiceUrl: string = AppConfig.get(
    'geoprocessing.url',
  ) as string;
  private readonly logger = new Logger(ProxyService.name);

  async proxyTileRequest(req: Request, res: Response) {
    const url =
      this.geoprocessingServiceUrl +
      req.path +
      new URL(req.originalUrl, this.geoprocessingServiceUrl).search;
    get(url, { headers: req.headers }, (response) => {
      // As we're proxying, set status code/message and headers from upstream
      res.statusCode = response.statusCode!;
      res.statusMessage = response.statusMessage!;
      res.header(response.headers);
      response.pipe(res);
    });
  }
}
