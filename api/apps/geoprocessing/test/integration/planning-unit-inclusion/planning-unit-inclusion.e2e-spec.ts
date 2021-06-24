import { INestApplication } from '@nestjs/common';
import { PromiseType } from 'utility-types';
import { createWorld } from './world';
import { bootstrapApplication } from '../../utils';

import { ScenarioPlanningUnitsInclusionProcessor } from '@marxan-geoprocessing/modules/scenario-planning-units-inclusion/scenario-planning-units-inclusion-processor';
import { JobInput } from '@marxan-jobs/planning-unit-geometry';
import {
  areaUnitsSample,
  excludeSample,
  includeSample,
} from '@marxan-geoprocessing/modules/scenario-planning-units-inclusion/__mocks__/include-sample';
import { Job } from 'bullmq';

let app: INestApplication;
let world: PromiseType<ReturnType<typeof createWorld>>;

let sut: ScenarioPlanningUnitsInclusionProcessor;

beforeAll(async (done) => {
  app = await bootstrapApplication();
  world = await createWorld(app);
  sut = app.get(ScenarioPlanningUnitsInclusionProcessor);
  done();
});

afterAll(async () => {
  await world?.cleanup();
  await app.close();
});

describe(`When planning units exist for a scenario`, () => {
  beforeEach(async () => {
    await world.GivenPlanningUnitsExist(areaUnitsSample());
  });

  describe(`when changing lock status`, () => {
    it(`marks relevant pu in desired state`, async () => {
      await sut.process(({
        data: {
          scenarioId: world.scenarioId,
          include: {
            geo: [includeSample()],
          },
          exclude: {
            geo: [excludeSample()],
          },
        },
      } as unknown) as Job<JobInput>);

      expect(await world.GetLockedInGeometries()).toEqual(
        world.geoToBeIncluded(),
      );
      expect(await world.GetLockedOutGeometries()).toEqual(
        world.geoToBeExcluded(),
      );
      expect(await world.GetUnstatedGeometries()).toEqual(
        world.geoToBeUntouched(),
      );
    }, 10000);
  });
});
