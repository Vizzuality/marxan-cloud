import { Job } from 'bullmq';
import { PlanningUnitsJob } from '../src/modules/planning-units/dto/create.regular.planning-units.dto';
import createPlanningUnitGridFromJobSpec from '../src/modules/planning-units/planning-units.job';

import { E2E_CONFIG } from './e2e.config';

function delay(ms: number) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, ms);
  });
}
/**
 * @TODO
 * we need to add a couple of test that cath errors on invalid user input.
 */
describe('planning units jobs (e2e)', () => {
  jest.setTimeout(5 * 1000);
  it('executes the child job processor with mock data', async () => {
    const createPlanningUnitsDTO: Pick<
      Job<PlanningUnitsJob>,
      'data' | 'id' | 'name'
    > = {
      id: '1',
      name: 'create-regular-pu',
      data: E2E_CONFIG.planningUnits.creationJob.valid.customArea({
        countryCode: 'NAM',
      }),
    };
    const value = await createPlanningUnitGridFromJobSpec(
      createPlanningUnitsDTO,
    );

    expect(value).toBeDefined();
    await Promise.all([delay(4 * 1000)]);
  });
});
