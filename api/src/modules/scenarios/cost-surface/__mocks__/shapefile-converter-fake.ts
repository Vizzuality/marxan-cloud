import { Injectable } from '@nestjs/common';
import { ResolvePuWithCost } from '../resolve-pu-with-cost';
import { CostSurfaceInputDto } from '../../../analysis/entry-points/adjust-cost-surface-input';

@Injectable()
export class ShapefileConverterFake implements ResolvePuWithCost {
  mock = jest.fn();

  async fromShapefile(file: Express.Multer.File): Promise<CostSurfaceInputDto> {
    return this.mock(file);
  }
}
