import { INestApplication } from '@nestjs/common';
import { PromiseType } from 'utility-types';

import { TypeormCostSurface } from '@marxan-geoprocessing/modules/cost-surface/adapters/typeorm-cost-surface';
import { CostSurfacePersistencePort } from '@marxan-geoprocessing/modules/cost-surface/ports/persistence/cost-surface-persistence.port';

import { bootstrapApplication } from '../../../utils';
import { getFixtures } from '../planning-unit-fixtures';

let app: INestApplication;
let sut: TypeormCostSurface;
let world: PromiseType<ReturnType<typeof getFixtures>>;

describe(`when updating some of the costs`, () => {
  beforeAll(async () => {
    app = await bootstrapApplication();
    sut = app.get(CostSurfacePersistencePort);
  });
  let puCostDataIds: string[];
  beforeEach(async () => {
    world = await getFixtures(app);
    puCostDataIds = await world.GivenPuCostDataExists();
  });
  afterAll(async () => {
    await world.cleanup();
    await app.close();
  });

  it(`applies new costs to given PU`, async () => {
    const costOf9999Id = puCostDataIds[0];
    const costOf1Id = puCostDataIds[1];

    await sut.save([
      {
        cost: 9999,
        id: costOf9999Id,
      },
      {
        cost: 1,
        id: costOf1Id,
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
