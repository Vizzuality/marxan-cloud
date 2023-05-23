import { INestApplication } from '@nestjs/common';
import { PromiseType } from 'utility-types';
import { createWorld, ForCase } from './world';
import { bootstrapApplication } from '../../utils';

import { ScenarioPlanningUnitsInclusionProcessor } from '@marxan-geoprocessing/modules/scenario-planning-units-inclusion/scenario-planning-units-inclusion-processor';
import { JobInput } from '@marxan-jobs/planning-unit-geometry';
import {
  areaUnitsSample,
  excludeSample,
  excludeSampleWithSingleFeature,
  includeSample,
  includeSampleWithSingleFeature,
  includeSampleOverlappingWithExclude,
  makeAvailableSampleWithSingleFeature,
  makeAvailableSampleOverlappingWithExclude,
} from '@marxan-geoprocessing/modules/scenario-planning-units-inclusion/__mocks__/include-sample';
import { Job } from 'bullmq';

let app: INestApplication;
let world: PromiseType<ReturnType<typeof createWorld>>;

let sut: ScenarioPlanningUnitsInclusionProcessor;

beforeAll(async () => {
  app = await bootstrapApplication();
  world = await createWorld(app);
  sut = app.get(ScenarioPlanningUnitsInclusionProcessor);
});

afterAll(async () => {
  await app.close();
});

describe(`when planning units exist for a scenario`, () => {
  describe(`when changing lock status via GeoJSON with one single feature per feature collection`, () => {
    const forCase: ForCase = 'singleFeature';
    beforeEach(async () => {
      await world.GivenPlanningUnitsExist(forCase, areaUnitsSample(forCase));
    });

    afterEach(async () => {
      await world?.cleanup('singleFeature');
    });

    it(`marks relevant pu in desired state`, async () => {
      await sut.process(({
        data: {
          scenarioId: world.scenarioId,
          include: {
            geo: [includeSampleWithSingleFeature()],
          },
          exclude: {
            geo: [excludeSampleWithSingleFeature()],
          },
          makeAvailable: {
            geo: [makeAvailableSampleWithSingleFeature()],
          },
        },
      } as unknown) as Job<JobInput>);

      expect(await world.GetLockedInPlanningUnits()).toEqual(
        world.planningUnitsToBeIncluded(forCase),
      );
      expect(await world.GetLockedOutPlanningUnits()).toEqual(
        world.planningUnitsToBeExcluded(forCase),
      );
      expect(await world.GetAvailablePlanningUnitsChangedByUser()).toEqual(
        world.planningUnitsToBeMadeAvailable(forCase),
      );
      expect(await world.GetAvailablePlanningUnits()).toEqual(
        world.planningUnitsToBeUntouched(forCase),
      );
    }, 10000);
  });

  describe(`when changing lock status via GeoJSON with multiple features per feature collection`, () => {
    const forCase: ForCase = 'multipleFeatures';
    beforeEach(async () => {
      await world.GivenPlanningUnitsExist(forCase, areaUnitsSample(forCase));
    });

    afterEach(async () => {
      await world?.cleanup('multipleFeatures');
    });

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

      expect(await world.GetLockedInPlanningUnits()).toEqual(
        world.planningUnitsToBeIncluded(forCase),
      );
      expect(await world.GetLockedOutPlanningUnits()).toEqual(
        world.planningUnitsToBeExcluded(forCase),
      );
      expect(await world.GetAvailablePlanningUnits()).toEqual(
        world.planningUnitsToBeUntouched(forCase),
      );
    }, 10000);
    it(`marks pu initially excluded in available status after using makeAvailbale claims`, async () => {
      /**
       * First step - excluding selected PUs
       **/

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

      expect(await world.GetLockedOutPlanningUnits()).toEqual(
        world.planningUnitsToBeExcluded(forCase),
      );

      /**
       * Second step - making available PUs initially excluded
       **/
      await sut.process(({
        data: {
          scenarioId: world.scenarioId,
          makeAvailable: {
            geo: [excludeSample()],
          },
        },
      } as unknown) as Job<JobInput>);

      expect(await world.GetLockedOutPlanningUnits()).toEqual([]);
      // PUs initially excluded are must now be available, with status changed by user equals to true

      expect(await world.GetAvailablePlanningUnitsChangedByUser()).toEqual(
        world.planningUnitsToBeMadeAvailableAfterExclusion(forCase),
      );
    }, 10000);
  });

  describe('When there are contrasting claims on one or more planning units', () => {
    const forCase: ForCase = 'multipleFeatures';
    beforeEach(async () => {
      await world.GivenPlanningUnitsExist(forCase, areaUnitsSample(forCase));
    });

    afterEach(async () => {
      await world?.cleanup('multipleFeatures');
    });

    it(`the operation should be rejected with an error when include and exclude PUs overlap`, async () => {
      await expect(
        sut.process(({
          data: {
            scenarioId: world.scenarioId,
            include: {
              geo: [includeSampleOverlappingWithExclude()],
            },
            exclude: {
              geo: [excludeSample()],
            },
          },
        } as unknown) as Job<JobInput>),
      ).rejects.toThrow(/Contrasting claims/);
    }, 10000);

    it(`the operation should be rejected with an error when makeAvailable and exclude PUs overlap`, async () => {
      await expect(
        sut.process(({
          data: {
            scenarioId: world.scenarioId,
            makeAvailable: {
              geo: [makeAvailableSampleOverlappingWithExclude()],
            },
            exclude: {
              geo: [excludeSample()],
            },
          },
        } as unknown) as Job<JobInput>),
      ).rejects.toThrow(/Contrasting claims/);
    }, 10000);
  });
});
