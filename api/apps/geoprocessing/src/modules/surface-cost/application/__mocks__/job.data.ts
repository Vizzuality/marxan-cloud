import { Job } from 'bullmq';
import { CostSurfaceJobInput } from '../../cost-surface-job-input';

export const getJob = (scenarioId: string): Job<CostSurfaceJobInput, true> => {
  const input: CostSurfaceJobInput = {
    shapefile: {
      filename: '',
      path: '',
    } as Express.Multer.File,
    scenarioId,
  };
  return ({
    data: input,
  } as unknown) as Job<CostSurfaceJobInput, true>;
};
