import { INestApplication } from '@nestjs/common';
import { bootstrapApplication } from '../utils/api-application';

import { ScenariosPlanningUnitService } from '../../src/modules/scenarios-planning-unit/scenarios-planning-unit.service';
import { GivenScenarioPuDataExists } from './steps/given-scenario-pu-data-exists';
import { LockStatus } from '../../src/modules/scenarios-planning-unit/lock-status.enum';

let app: INestApplication;
let service: ScenariosPlanningUnitService;

beforeAll(async () => {
  app = await bootstrapApplication();
  service = app.get(ScenariosPlanningUnitService);
});

describe(`scenarios-pu-data fetch`, () => {
  let result: unknown;
  let count: number;

  beforeEach(async () => {
    // Asset
    count = (await GivenScenarioPuDataExists(app)).rows.length;

    // Act
    result = await service.findAll();
  });

  it(`returns valid data`, () => {
    expect(result).toEqual([
      expect.arrayContaining([
        {
          lockStatus: LockStatus.LockedOut,
        },
        {
          lockStatus: LockStatus.Unstated,
        },
        {
          lockStatus: LockStatus.LockedIn,
        },
      ]),
      count,
    ]);
  });
});
