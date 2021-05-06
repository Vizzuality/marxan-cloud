import { HttpStatus, Injectable, Logger } from '@nestjs/common';

import { AppConfig } from 'utils/config.utils';
import { Request, Response } from 'express';
/**
 * @debt i think this is not properly imported, but it was the only way for it to work
 */
import * as Server from 'http-proxy';

@Injectable()
export class ProxyService {
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
    const tileTargetURL: string = AppConfig.get('geoprocessing.url') as string;
    // Use `originalUrl` here, as the `/api/v1/geoprocessing` is otherwise stripped
    // away, but we need this because the backend microservice expects that as
    // part of its routes
    request.url = request.originalUrl.replace('api/v1/', 'api/v1/geodata/');

    return this.server.web(
      request,
      response,
      { changeOrigin: true, target: tileTargetURL },
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

  async proxyUloadShapeFile(request: any) {
    console.log('THIS IS PROXY SERVICE', request.body);
  }
}
