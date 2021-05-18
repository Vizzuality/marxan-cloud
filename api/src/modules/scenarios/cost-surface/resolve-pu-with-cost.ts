import { CostSurfaceInputDto } from '../../analysis/entry-points/adjust-cost-surface-input';

export abstract class ResolvePuWithCost {
  abstract fromShapefile(
    file: Express.Multer.File,
  ): Promise<CostSurfaceInputDto>;
}
