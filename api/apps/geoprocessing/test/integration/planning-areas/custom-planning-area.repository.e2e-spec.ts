import { INestApplication } from '@nestjs/common';
import { PromiseType } from 'utility-types';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { assertDefined } from '@marxan/utils';
import { PlanningArea } from '@marxan/planning-area-repository/planning-area.geo.entity';
import {
  CustomPlanningAreaRepository,
  SaveGeoJsonResult,
} from '@marxan/planning-area-repository';
import { bootstrapApplication } from '../../utils';
import { PlanningAreaGarbageCollector } from '../../../src/modules/planning-area/planning-area-garbage-collector.service';

let fixtures: PromiseType<ReturnType<typeof getFixtures>>;
let repository: CustomPlanningAreaRepository;
let paGarbageCollector: PlanningAreaGarbageCollector;

beforeEach(async () => {
  fixtures = await getFixtures();
  repository = fixtures.getRepository();
  paGarbageCollector = fixtures.getPlanningAreaGarbageCollector();
});

afterEach(async () => {
  await fixtures.cleanup();
});

describe(`when entity created`, () => {
  let result: SaveGeoJsonResult;
  beforeEach(async () => {
    // given
    result = await repository.saveGeoJson(fixtures.sampleGeoJSON);
    fixtures.createdEntities.push(result.id);
  });

  it(`should confirm existence of newly created entity `, async () => {
    // when
    const hasResult = await repository.has(result.id);

    // then
    expect(hasResult).toBe(true);
  });

  it(`should return id, bbox, max and min pu size in insert`, async () => {
    expect(result).toStrictEqual({
      bbox: [
        -30.146484374999996, -40.341796875, 38.20365531807149,
        29.22889003019423,
      ],
      id: result.id,
      maxPuAreaSize: 940152,
      minPuAreaSize: 103,
    });
  });

  it('should have equal id and project_id', async () => {
    const [planning_area] = await fixtures
      .getTypeormRepository()
      .find({ id: result.id });

    expect(planning_area).toBeDefined();

    expect(planning_area.id).toEqual(planning_area.projectId);
  });

  it(`should find a bbox of entity`, async () => {
    // when
    const bbox = await repository.getBBox(result.id);

    // then
    expect(bbox).toStrictEqual([
      -30.146484374999996, -40.341796875, 38.20365531807149, 29.22889003019423,
    ]);
  });
});

it(`should deny existence of unknown entity`, async () => {
  // when
  const hasResult = await repository.has(
    `32ce1a52-51cb-4f50-ab41-92c4c5a71f31`,
  );

  // then
  expect(hasResult).toBe(false);
});

it(`should replace planning area assignment and delete the old one`, async () => {
  // given
  const { id: firstId } = await repository.saveGeoJson(fixtures.sampleGeoJSON);
  fixtures.createdEntities.push(firstId);
  // and
  const { id: secondId } = await repository.saveGeoJson(fixtures.sampleGeoJSON);
  fixtures.createdEntities.push(secondId);
  // and
  await repository.assignProject(
    firstId,
    '32ce1a52-51cb-4f50-ab41-92c4c5a71f31',
  );
  // when
  await repository.assignProject(
    secondId,
    '32ce1a52-51cb-4f50-ab41-92c4c5a71f31',
  );
  // then
  expect(await repository.has(firstId)).toBe(false);
  // and
  await fixtures.areaShouldBeAssignedTo(
    secondId,
    '32ce1a52-51cb-4f50-ab41-92c4c5a71f31',
  );
});

describe(`when there is an entity created in 2021-03-03T12:00:00Z and gc time is 5000ms`, () => {
  let gcAge: number;
  let id: string;
  beforeEach(async () => {
    // given
    id = await fixtures.createEntityWithCreatedAtDate(
      new Date(`2021-03-03T12:00:00Z`),
    );
    // and
    gcAge = 5000;
  });

  it(`should garbage collect entity when now is 2021-03-03T12:00:06Z`, async () => {
    // when
    await paGarbageCollector.collectGarbage(
      gcAge,
      new Date('2021-03-03T12:00:06Z'),
    );

    // then
    expect(await repository.has(id)).toBe(false);
  });

  it(`should not garbage collect entity when now is 2021-03-03T12:00:04Z`, async () => {
    // when
    await paGarbageCollector.collectGarbage(
      gcAge,
      new Date('2021-03-03T12:00:04Z'),
    );

    // then
    expect(await repository.has(id)).toBe(true);
  });

  it(`should not garbage collect entity when now is 2021-03-03T12:00:06Z but has a project assigned`, async () => {
    // given
    await repository.assignProject(id, '32ce1a52-51cb-4f50-ab41-92c4c5a71f31');

    // when
    await paGarbageCollector.collectGarbage(
      gcAge,
      new Date('2021-03-03T12:00:06Z'),
    );

    // then
    expect(await repository.has(id)).toBe(true);
  });
});

async function getFixtures() {
  const app: INestApplication = await bootstrapApplication();
  const fixtures = {
    createdEntities: [] as string[],
    sampleGeoJSON: {
      type: 'FeatureCollection' as const,
      features: [
        {
          type: 'Feature' as const,
          properties: {},
          geometry: {
            type: 'Polygon' as const,
            coordinates: [
              [
                [-40.341796875, 29.22889003019423],
                [-30.146484374999996, 29.22889003019423],
                [-30.146484374999996, 38.20365531807149],
                [-40.341796875, 38.20365531807149],
                [-40.341796875, 29.22889003019423],
              ],
            ],
          },
        },
      ],
    },
    getRepository() {
      return app.get(CustomPlanningAreaRepository);
    },
    getPlanningAreaGarbageCollector() {
      return app.get(PlanningAreaGarbageCollector);
    },
    getTypeormRepository() {
      return app.get<Repository<PlanningArea>>(
        getRepositoryToken(PlanningArea),
      );
    },
    async cleanup() {
      await Promise.all(
        fixtures.createdEntities.map((id) =>
          fixtures.getTypeormRepository().delete(id),
        ),
      );
    },
    async createEntityWithCreatedAtDate(date: Date) {
      const { id } = await repository.saveGeoJson(this.sampleGeoJSON);
      await fixtures.getTypeormRepository().update(
        {
          id,
        },
        {
          createdAt: date,
        },
      );
      return id;
    },
    async areaShouldNotExist(id: string) {
      const area = await fixtures.getTypeormRepository().findOne(id);
      expect(area).toBeUndefined();
    },
    async areaShouldBeAssignedTo(id: string, projectId: string | null) {
      const area = await fixtures.getTypeormRepository().findOne(id);
      assertDefined(area);
      expect(area.projectId).toStrictEqual(projectId);
    },
  };
  return fixtures;
}
