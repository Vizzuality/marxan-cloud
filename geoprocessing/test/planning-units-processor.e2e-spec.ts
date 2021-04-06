import { Job } from 'bullmq';
import defaultExport from '../src/modules/planning-units/planning-units.job';

import { E2E_CONFIG } from './e2e.config';

function delay(ms: number) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, ms);
  });
}

describe('planning units jobs (e2e)', () => {
  jest.setTimeout(2 * 1000);
  it('executes the child job processor with mock data', async () => {
    const createPlanningUnitsDTO: Partial<Job> = {
      id: '1',
      name: 'create-pu',
      data: E2E_CONFIG.planningUnits.creationJob.valid.customArea({
        countryCode: 'NAM',
      }),
    };
    const value = await defaultExport(createPlanningUnitsDTO);

    expect(value).toBeDefined();
    await Promise.all([delay(1 * 1000)]);
  });
});
