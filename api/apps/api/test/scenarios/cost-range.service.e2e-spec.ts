import { Repository } from 'typeorm';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';

import {
  PlanningUnitsGeom,
  ShapeType,
} from '@marxan-jobs/planning-unit-geometry';
import { assertDefined } from '@marxan/utils';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import {
  ScenariosPuCostDataGeo,
  ScenariosPuPaDataGeo,
} from '@marxan/scenarios-planning-unit';

import { CostRangeService } from '@marxan-api/modules/scenarios/cost-range-service';
import { DbConnections } from '@marxan-api/ormconfig.connections';

import { bootstrapApplication } from '../utils/api-application';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

afterEach(async () => {
  await fixtures.cleanup();
});

it(`should return defaults when no data`, async () => {
  // given
  const rangeService = fixtures.getRangeService();
  // and no data
  // when
  const range = await rangeService.getRange(
    '00000000-0000-0000-0000-000000000001',
  );
  // then
  expect(range).toStrictEqual({
    min: 1,
    max: 1,
  });
});

it(`should return valid min/max while data available`, async () => {
  // given
  const rangeService = fixtures.getRangeService();
  // and
  await fixtures.GivenCostDataInDbForMultipleScenarios();
  // when
  const range = await rangeService.getRange(
    '00000000-0000-0000-0000-000000000001',
  );
  // then
  expect(range).toStrictEqual({
    min: -1,
    max: 634,
  });
});

async function getFixtures() {
  const app = await bootstrapApplication([
    TypeOrmModule.forFeature(
      [ScenariosPuPaDataGeo],
      DbConnections.geoprocessingDB,
    ),
  ]);
  const cleanups: (() => Promise<unknown>)[] = [() => app.close()];
  const planningUnitsGeoms: Repository<PlanningUnitsGeom> = app.get(
    getRepositoryToken(PlanningUnitsGeom, DbConnections.geoprocessingDB),
  );
  const scenariosPuDatas: Repository<ScenariosPuPaDataGeo> = app.get(
    getRepositoryToken(ScenariosPuPaDataGeo, DbConnections.geoprocessingDB),
  );
  const scenarioPuCostDatas: Repository<ScenariosPuCostDataGeo> = app.get(
    getRepositoryToken(ScenariosPuCostDataGeo, DbConnections.geoprocessingDB),
  );
  return {
    async GivenCostDataInDbForMultipleScenarios() {
      const pu = await planningUnitsGeoms.save(
        planningUnitsGeoms.create({
          theGeom: {
            type: 'Point',
            coordinates: [20.545450150966644, 52.08397788419048],
          },
          type: ShapeType.Square,
          size: 100,
        }),
      );
      assertDefined(pu);
      cleanups.push(async () => {
        await planningUnitsGeoms.remove(pu);
      });
      let planningUnitMarxanId = 0;
      const puDatas = await scenariosPuDatas.save(
        [
          '00000000-0000-0000-0000-000000000001',
          '00000000-0000-0000-0000-000000000002',
          '00000000-0000-0000-0000-000000000001',
          '00000000-0000-0000-0000-000000000002',
          '00000000-0000-0000-0000-000000000001',
          '00000000-0000-0000-0000-000000000002',
        ].map((scenarioId) => ({
          puGeometryId: pu.id,
          planningUnitMarxanId: planningUnitMarxanId++,
          scenarioId,
          protectedByDefault: true,
        })),
      );
      cleanups.push(async () => {
        for (const puData of puDatas) {
          await scenariosPuDatas.remove(puData);
        }
      });
      const puCosts = await scenarioPuCostDatas.save([
        scenarioPuCostDatas.create({
          scenariosPuDataId: puDatas[0].id,
          cost: -1,
        }),
        scenarioPuCostDatas.create({
          scenariosPuDataId: puDatas[1].id,
          cost: 5,
        }),
        scenarioPuCostDatas.create({
          scenariosPuDataId: puDatas[2].id,
          cost: 634,
        }),
        scenarioPuCostDatas.create({
          scenariosPuDataId: puDatas[3].id,
          cost: -5323,
        }),
        scenarioPuCostDatas.create({
          scenariosPuDataId: puDatas[4].id,
          cost: 4,
        }),
        scenarioPuCostDatas.create({
          scenariosPuDataId: puDatas[5].id,
          cost: 6,
        }),
      ]);
      cleanups.push(async () => {
        for (const puCost of puCosts) {
          await scenarioPuCostDatas.delete(puCost);
        }
      });
    },
    async cleanup() {
      for (const cleanup of cleanups.reverse()) {
        await cleanup();
      }
    },
    getRangeService(): CostRangeService {
      return app.get(CostRangeService);
    },
  };
}
