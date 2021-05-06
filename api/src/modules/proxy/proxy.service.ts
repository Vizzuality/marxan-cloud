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
    // Use `originalUrl` here, as the `/api/v1/geoprocessing` is otherwise stripped
    // away, but we need this because the backend microservice expects that as
    // part of its routes
    request.url = request.originalUrl.replace('api/v1/', 'api/v1/geodata/');

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

  async proxyUploadShapeFile(request: Request, response: Response) {
    this.logger.log('REACH PROXY SERVICE');
    this.logger.log(this.geoprocessingServiceUrl);
    request.url = request.originalUrl.replace('api/v1/', 'api/v1/geodata/');
    this.logger.log(request.url);
    this.logger.log(request.method);
    const summin = this.server.web(
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
