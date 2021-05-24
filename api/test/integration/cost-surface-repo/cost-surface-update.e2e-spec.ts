import { INestApplication } from '@nestjs/common';
import { TypeormCostSurface } from '../../../src/modules/analysis/providers/cost-surface/adapters/typeorm-cost-surface';
import { bootstrapApplication } from '../../utils/api-application';
import { CostSurfaceUpdateWorld, createWorld } from './world';
import { CostSurfaceRepo } from '../../../src/modules/analysis/providers/cost-surface/cost-surface-repo';

let app: INestApplication;
let sut: TypeormCostSurface;
let world: CostSurfaceUpdateWorld;

beforeAll(async () => {
  app = await bootstrapApplication();
  world = await createWorld(app);
  sut = app.get(CostSurfaceRepo);
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
    const sameCostId = puCostDataIds[2];

    await sut.applyCostSurface(world.scenarioId, [
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
      pu_id: costOf9999Id,
    });

    expect(afterChanges).toContainEqual({
      scenario_id: world.scenarioId,
      cost: 1,
      pu_id: costOf1Id,
    });

    expect(afterChanges).toContainEqual({
      scenario_id: world.scenarioId,
      cost: expect.any(Number),
      pu_id: sameCostId,
    });
  });
});
