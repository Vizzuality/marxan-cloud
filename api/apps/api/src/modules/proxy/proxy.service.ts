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
      response.pipe(res);
    });
  }

  async proxyUploadShapeFile(req: Request, res: Response): Promise<any> {
    req.url = req.originalUrl.replace(
      'api/v1/scenarios',
      'api/v1/planning-units',
    );

    const url =
      this.geoprocessingServiceUrl +
      req.path +
      new URL(req.originalUrl, this.geoprocessingServiceUrl).search;
    get(url, { headers: req.headers }, (response) => {
      response.pipe(res);
    });
  }
}
