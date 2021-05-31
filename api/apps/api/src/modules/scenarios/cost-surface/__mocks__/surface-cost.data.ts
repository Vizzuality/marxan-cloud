import { CostSurfaceInputDto } from '../../../analysis/entry-points/adjust-cost-surface-input';

export const getValidSurfaceCost = (): CostSurfaceInputDto => ({
  planningUnits: [
    {
      id: 'pu-id-1',
      cost: 300,
    },
    {
      id: 'pu-id-2',
      cost: 2000,
    },
  ],
});
