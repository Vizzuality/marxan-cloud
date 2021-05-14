import { Job } from 'bullmq';

const exampleWorkerJobProcessor = async (
  job: Pick<Job<Record<string, unknown>>, 'data' | 'id' | 'name'>,
) => {
  return {
    inputCopy: job.data,
  };
};

export default exampleWorkerJobProcessor;
