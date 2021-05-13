import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { AdjustCostSurface } from '../../analysis/entry-points/adjust-cost-surface';
import { ProxyService } from '../../proxy/proxy.service';
import { ApiEventsService } from '../../api-events/api-events.service';
import { WrapInEvents } from './cost-surface-events.decorator';

@Injectable()
export class CostSurfaceFacade {
  constructor(
    private readonly adjustCostSurfaceService: AdjustCostSurface,
    private readonly proxyService: ProxyService,
    protected readonly apiEvents: ApiEventsService,
  ) {}

  /**
   * non blocking - will do job in "background"
   *
   * @param scenarioId
   * @param request
   */
  @WrapInEvents
  async convert(scenarioId: string, request: Request) {
    console.log(`----- call original stuff`);
    // TODO #0 Generate & Dispatch Api Event (some wrapping service for /dummy/"terminating" if already running)

    // TODO #1 Call Proxy Service to get GeoJSON
    // this.proxyService.... - modify this to send back data, not act on Response

    // TODO #2 Call Analysis-module with scenario id & GeoJson from above
    await this.adjustCostSurfaceService.update(scenarioId, {
      geo: {
        features: [],
        type: 'FeatureCollection',
      },
    });

    return;
  }
}
