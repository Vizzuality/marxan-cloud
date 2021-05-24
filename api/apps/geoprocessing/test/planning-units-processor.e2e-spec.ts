import { Job } from 'bullmq';
import { PlanningUnitsJob } from '../src/modules/planning-units/dto/create.regular.planning-units.dto';
import createPlanningUnitGridFromJobSpec from '../src/modules/planning-units/planning-units.job';

import { E2E_CONFIG } from './e2e.config';

/**
 * @TODO
 * we need to add a couple of test that cath errors on invalid user input.
 */
describe('planning units jobs (e2e)', () => {
  it(
    'executes the child job processor with mock data',
    async () => {
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

      // TODO do actual verification & cleanup (table: planning_units_geom) after test
      expect(value).toEqual([]);
    },
    50 * 1000,
  );
});
