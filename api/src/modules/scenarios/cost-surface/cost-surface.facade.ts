import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { AdjustCostSurface } from '../../analysis/entry-points/adjust-cost-surface';
import { ProxyService } from '../../proxy/proxy.service';

@Injectable()
export class CostSurfaceFacade {
  constructor(
    private readonly adjustCostSurfaceService: AdjustCostSurface,
    private readonly proxyService: ProxyService,
  ) {}

  /**
   * non blocking - will do job in "background"
   *
   * @param scenarioId
   * @param request
   */
  convert(scenarioId: string, request: Request) {
    // TODO #0 Generate & Dispatch Api Event (some wrapping service for /dummy/"terminating" if already running)

    // TODO #1 Call Proxy Service to get GeoJSON
    // this.proxyService.... - modify this to send back data, not act on Response

    // TODO #2 Call Analysis-module with scenario id & GeoJson from above
    this.adjustCostSurfaceService
      .update(scenarioId, {
        geo: {
          features: [],
          type: 'FeatureCollection',
        },
      })
      .then(() => {
        // dispatch ApiEvent - Done
      })
      .catch(() => {
        // dispatch ApiEvent - Failed
      });
  }
}
