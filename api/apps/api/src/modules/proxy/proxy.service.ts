import { HttpStatus, Injectable, Logger } from '@nestjs/common';

import { AppConfig } from 'utils/config.utils';
import { Request, Response } from 'express';
/**
 * @debt i think this is not properly imported, but it was the only way for it to work
 */
import * as Server from 'http-proxy';

@Injectable()
export class ProxyService {
  private geoprocessingServiceUrl: string = AppConfig.get(
    'geoprocessing.url',
  ) as string;
  private server: Server;
  private readonly logger = new Logger(ProxyService.name);
  constructor() {
    this.server = Server.createProxyServer();
  }
  /**
   *
   * @todo refactor to a more general function for the parts that can change for the other proxied URL's
   */

  proxyTileRequest(request: Request, response: Response) {
    return this.server.web(
      request,
      response,
      { changeOrigin: true, target: this.geoprocessingServiceUrl },
      (error) => {
        this.logger.error(
          `Unexpected exception on proxy to tile service - ${error}`,
        );
        return response
          .status(HttpStatus.BAD_GATEWAY)
          .send({ message: `Unexpected exception during request - ${error}` });
      },
    );
  }

  async proxyUploadShapeFile(
    request: Request,
    response: Response,
  ): Promise<any> {
    request.url = request.originalUrl.replace(
      'api/v1/scenarios',
      'api/v1/planning-units',
    );

    return this.server.web(
      request,
      response,
      {
        changeOrigin: true,
        target: this.geoprocessingServiceUrl,
      },
      (error) => {
        this.logger.error(
          `Unexpected exception on proxy for shapefile upload service - ${error}`,
        );
        return response
          .status(HttpStatus.BAD_GATEWAY)
          .send({ message: `Unexpected exception during request - ${error}` });
      },
    );
  }
}
