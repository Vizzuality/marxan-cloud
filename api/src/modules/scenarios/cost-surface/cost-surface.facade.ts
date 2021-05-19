import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AdjustCostSurface } from '../../analysis/entry-points/adjust-cost-surface';
import { ResolvePuWithCost } from './resolve-pu-with-cost';
import {
  CostSurfaceEventsPort,
  CostSurfaceState,
} from './cost-surface-events.port';
import { CostSurfaceInputDto } from '../../analysis/entry-points/adjust-cost-surface-input';

@Injectable()
export class CostSurfaceFacade {
  constructor(
    private readonly adjustCostSurfaceService: AdjustCostSurface,
    private readonly shapefileConverter: ResolvePuWithCost,
    private readonly events: CostSurfaceEventsPort,
  ) {}

  /**
   * Performs potentially long-lasting operation. No result is returned directly.
   * The status of the job is handled by another module which aggregates such.
   */
  async convert(scenarioId: string, request: Request): Promise<void> {
    await this.events.event(scenarioId, CostSurfaceState.Submitted);
    let costSurface: CostSurfaceInputDto;

    try {
      costSurface = await this.shapefileConverter.fromShapefile(request.file);
    } catch (error) {
      await this.events.event(
        scenarioId,
        CostSurfaceState.ShapefileConversionFailed,
      );
      return;
    }

    await this.events.event(scenarioId, CostSurfaceState.ShapefileConverted);
    return this.adjustCostSurfaceService
      .update(scenarioId, costSurface)
      .then(() => this.events.event(scenarioId, CostSurfaceState.Finished))
      .catch(async () => {
        await this.events.event(scenarioId, CostSurfaceState.CostUpdateFailed);
      });
  }
}
