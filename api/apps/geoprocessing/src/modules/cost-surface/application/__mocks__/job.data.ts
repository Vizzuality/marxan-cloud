import {
  FromShapefileJobInput,
  InitialCostJobInput,
  JobInput,
} from '@marxan/artifact-cache';
import { PlanningUnitGridShape } from '@marxan/scenarios-planning-unit';
import { Job } from 'bullmq';

export const getFromShapeFileJob = (
  scenarioId: string,
): Job<FromShapefileJobInput, true> => {
  const input: FromShapefileJobInput = {
    shapefile: {
      filename: '',
      path: '',
    } as Express.Multer.File,
    scenarioId,
  };
  return {
    data: input,
  } as unknown as Job<FromShapefileJobInput, true>;
};

export const getInitialCostJob = (
  scenarioId: string,
): Job<InitialCostJobInput, true> => {
  const input: InitialCostJobInput = {
    scenarioId,
  };
  return {
    data: input,
  } as unknown as Job<InitialCostJobInput, true>;
};

export const getUnknownJob = (): Job<JobInput, true> => {
  return { data: {} } as unknown as Job<JobInput, true>;
};
