import { INestApplication } from '@nestjs/common';
import { bootstrapApplication } from '../utils/api-application';

import { ScenariosPlanningUnitService } from '../../src/modules/scenarios-planning-unit/scenarios-planning-unit.service';
import { LockStatus } from '@marxan/scenarios-planning-unit';
import { createWorld, World } from './steps/world';
import { tearDown } from '../utils/tear-down';

let app: INestApplication;
let service: ScenariosPlanningUnitService;

let world: World;

beforeAll(async () => {
  app = await bootstrapApplication();
  service = app.get(ScenariosPlanningUnitService);
  world = await createWorld(app);
});

afterAll(async () => {
  await tearDown();
});

describe(`scenarios-pu-data fetch`, () => {
  let result: unknown;
  let count: number;

  beforeEach(async () => {
    // Asset
    count = (await world.GivenScenarioPuDataExists()).length;

    // Act
    result = await service.findAll(undefined, {
      params: {
        scenarioId: world.scenarioId,
      },
    });
  });

  afterEach(async () => {
    await world.cleanup();
  });

  it(`returns valid data`, () => {
    expect(result).toEqual([
      expect.arrayContaining([
        expect.objectContaining({ lockStatus: LockStatus.Unstated }),
        expect.objectContaining({ lockStatus: LockStatus.LockedOut }),
        expect.objectContaining({ lockStatus: LockStatus.LockedIn }),
      ]),
      count,
    ]);
  });
});
