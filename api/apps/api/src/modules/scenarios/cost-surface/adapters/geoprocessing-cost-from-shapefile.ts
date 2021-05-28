import { Injectable } from '@nestjs/common';
import { ResolvePuWithCost } from '../resolve-pu-with-cost';
import { CostSurfaceInputDto } from '../../../analysis/entry-points/adjust-cost-surface-input';

@Injectable()
export class GeoprocessingCostFromShapefile implements ResolvePuWithCost {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async fromShapefile(file: Express.Multer.File): Promise<CostSurfaceInputDto> {
    return {
      planningUnits: [],
    };
  }
}
