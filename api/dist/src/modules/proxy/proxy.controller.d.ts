import { ProxyService } from './proxy.service';
import { Request, Response } from 'express';
export declare class ProxyController {
    private readonly proxyService;
    constructor(proxyService: ProxyService);
    proxyAdminAreaTile(request: Request, response: Response): Promise<void>;
    proxyProtectedAreaTile(request: Request, response: Response): Promise<void>;
    proxyFeaturesTile(request: Request, response: Response): Promise<void>;
}
