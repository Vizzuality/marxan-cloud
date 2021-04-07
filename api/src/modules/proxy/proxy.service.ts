import { HttpStatus, Injectable, Logger } from '@nestjs/common';

import config from 'config';
import { Request, Response } from 'express';
import Server from 'http-proxy';

@Injectable()
export class ProxyService {
  private server: Server;

  constructor() {
    this.server = Server.createProxyServer();
  }

  proxyTileRequest(request: Request, response: Response) {
    /**
     * @todo change server name in config url
     */
    const tileTargetURL: string = config.get('geoprocessing.url');
    // Use `originalUrl` here, as the `/api/v1/geoprocessing` is otherwise stripped
    // away, but we need this because the backend microservice expects that as
    // part of its routes
    request.url = request.originalUrl;

    return this.server.web(
      request,
      response,
      { changeOrigin: true, target: tileTargetURL },
      (error) => {
        Logger.error(
          `Unexpected exception on proxy to tile service - ${error}`,
        );
        return response
          .status(HttpStatus.BAD_GATEWAY)
          .send({ message: 'Unexpected exception during request' });
      },
    );
  }
}
