import { Request, Response } from 'express';
export declare class ProxyService {
    private geoprocessingServiceUrl;
    private server;
    private readonly logger;
    constructor();
    proxyTileRequest(request: Request, response: Response): void;
    proxyUploadShapeFile(request: Request, response: Response): Promise<any>;
}
