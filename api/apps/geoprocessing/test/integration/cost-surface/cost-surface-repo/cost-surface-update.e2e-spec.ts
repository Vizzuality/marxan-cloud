import { INestApplication } from '@nestjs/common';
import { PromiseType } from 'utility-types';

import { TypeormCostSurface } from '../../../../src/modules/surface-cost/adapters/typeorm-cost-surface';
import { CostSurfacePersistencePort } from '../../../../src/modules/surface-cost/ports/persistence/cost-surface-persistence.port';

import { bootstrapApplication } from '../../../utils';
import { getFixtures } from '../planning-unit-fixtures';

let app: INestApplication;
let sut: TypeormCostSurface;
let world: PromiseType<ReturnType<typeof getFixtures>>;

beforeAll(async () => {
  app = await bootstrapApplication();
  world = await getFixtures(app);
  sut = app.get(CostSurfacePersistencePort);
});

afterAll(async () => {
  await world.cleanup();
  await app.close();
});

describe(`when updating some of the costs`, () => {
  let puCostDataIds: string[];
  beforeEach(async () => {
    puCostDataIds = await world.GivenPuCostDataExists();
  });

  it(`applies new costs to given PU`, async () => {
    const costOf9999Id = puCostDataIds[0];
    const costOf1Id = puCostDataIds[1];

    await sut.save(world.scenarioId, [
      {
        cost: 9999,
        puId: costOf9999Id,
      },
      {
        cost: 1,
        puId: costOf1Id,
      },
    ]);

    const afterChanges = await world.GetPuCostsData(world.scenarioId);

    expect(afterChanges).toContainEqual({
      scenario_id: world.scenarioId,
      cost: 9999,
      spud_id: expect.any(String),
    });

    expect(afterChanges).toContainEqual({
      scenario_id: world.scenarioId,
      cost: 1,
      spud_id: expect.any(String),
    });
  });
});
