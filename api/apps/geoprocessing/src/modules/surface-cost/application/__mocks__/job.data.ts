import {
  FromShapefileJobInput,
  InitialCostJobInput,
  JobInput,
} from '@marxan/project-template-file';
import { PlanningUnitGridShape } from '@marxan/scenarios-planning-unit';
import { Job } from 'bullmq';

export const getFromShapeFileJob = (
  projectId: string,
): Job<FromShapefileJobInput, true> => {
  const input: FromShapefileJobInput = {
    shapefile: {
      filename: '',
      path: '',
    } as Express.Multer.File,
    projectId,
  };
  return ({
    data: input,
  } as unknown) as Job<FromShapefileJobInput, true>;
};

export const getInitialCostJob = (
  projectId: string,
): Job<InitialCostJobInput, true> => {
  const input: InitialCostJobInput = {
    projectId,
  };
  return ({
    data: input,
  } as unknown) as Job<InitialCostJobInput, true>;
};

export const getUnknownJob = (): Job<JobInput, true> => {
  return ({ data: {} } as unknown) as Job<JobInput, true>;
};
