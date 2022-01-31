import { FromShapefileJobInput } from '@marxan/scenarios-planning-unit';
import { Job } from 'bullmq';

export const getJob = (
  scenarioId: string,
): Job<FromShapefileJobInput, true> => {
  const input: FromShapefileJobInput = {
    shapefile: {
      filename: '',
      path: '',
    } as Express.Multer.File,
    scenarioId,
  };
  return ({
    data: input,
  } as unknown) as Job<FromShapefileJobInput, true>;
};
