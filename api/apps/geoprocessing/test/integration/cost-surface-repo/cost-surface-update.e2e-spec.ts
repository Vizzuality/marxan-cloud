import { INestApplication } from '@nestjs/common';
import { TypeormCostSurface } from '../../../src/modules/surface-cost/adapters/typeorm-cost-surface';
import { bootstrapApplication } from '../../utils/geo-application';
import { CostSurfaceUpdateWorld, createWorld } from './world';
import { CostSurfacePersistencePort } from '../../../src/modules/surface-cost/ports/persistence/cost-surface-persistence.port';

let app: INestApplication;
let sut: TypeormCostSurface;
let world: CostSurfaceUpdateWorld;

beforeAll(async () => {
  app = await bootstrapApplication();
  world = await createWorld(app);
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
    const sameCostId = puCostDataIds[2];

    await sut.save(world.scenarioId, [
      {
        cost: 9999,
        planningUnitId: costOf9999Id,
      },
      {
        cost: 1,
        planningUnitId: costOf1Id,
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
