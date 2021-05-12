import { Job } from 'bullmq';

export const HasRelevantJobName = (job: Job, scenarioId: string) =>
  expect(job.name).toEqual(`calculate-planning-units-geo-update-${scenarioId}`);
