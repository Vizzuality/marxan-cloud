import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { PlanningUnitsJob } from '@marxan-jobs/planning-unit-geometry/create.regular.planning-units.dto';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import { PlanningUnitsJobProcessor } from '../src/modules/planning-units/planning-units.job';
import { E2E_CONFIG } from './e2e.config';

/**
 * @TODO
 * we need to add a couple of test that cath errors on invalid user input.
 */
describe('planning units jobs (e2e)', () => {
  let sut: PlanningUnitsJobProcessor;

  beforeEach(async () => {
    const sandbox = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...geoprocessingConnections.default,
          keepConnectionAlive: true,
          logging: false,
        }),
      ],
      providers: [PlanningUnitsJobProcessor],
    }).compile();

    sut = sandbox.get(PlanningUnitsJobProcessor);
  });

  it(
    'executes the child job processor with mock data',
    async () => {
      const createPlanningUnitsDTO = {
        id: '1',
        name: 'create-regular-pu',
        data: E2E_CONFIG.planningUnits.creationJob.valid.customArea({
          countryCode: 'NAM',
        }),
      } as Job<PlanningUnitsJob>;

      // TODO do actual verification & cleanup (table: planning_units_geom) after test
      await expect(sut.process(createPlanningUnitsDTO)).resolves.not.toThrow();
    },
    50 * 1000,
  );
});
