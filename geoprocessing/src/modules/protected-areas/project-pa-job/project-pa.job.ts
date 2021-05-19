import { Job } from 'bullmq';

const projectProtectedAreaShapefile = async (
  job: Pick<Job<Record<string, unknown>>, 'data' | 'id' | 'name'>,
) => {
  console.log(`job processor start...`, job.data, job.id, job.name);
  return {
    inputCopy: job.data,
  };
};

export default projectProtectedAreaShapefile;
