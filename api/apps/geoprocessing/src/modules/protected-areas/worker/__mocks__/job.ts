import { Job } from 'bullmq';
import { ProtectedAreasJobInput } from '../worker-input';

export const createJob = (projectId: string, fileName: string): Job => {
  const input: ProtectedAreasJobInput = {
    file: ({
      filename: fileName,
    } as unknown) as Express.Multer.File,
    projectId,
  };

  return ({
    data: input,
  } as unknown) as Job;
};
