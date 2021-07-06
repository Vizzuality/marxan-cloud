import { INestApplication } from '@nestjs/common';
import { PromiseType } from 'utility-types';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PlanningArea } from '@marxan/planning-area-repository/planning-area.geo.entity';
import { CustomPlanningAreaRepository } from '@marxan/planning-area-repository';
import { bootstrapApplication } from '../../utils';

let fixtures: PromiseType<ReturnType<typeof getFixtures>>;
let repository: CustomPlanningAreaRepository;

beforeEach(async () => {
  fixtures = await getFixtures();
  repository = fixtures.getRepository();
});

afterEach(async () => {
  await fixtures.cleanup();
});

describe(`when entity created`, () => {
  let id: string;
  beforeEach(async () => {
    // given
    ({ id } = (await repository.saveGeoJson(fixtures.sampleGeoJSON))[0]);
    fixtures.createdEntities.push(id);
  });

  it(`should confirm existence of newly created entity `, async () => {
    // when
    const hasResult = await repository.has(id);

    // then
    expect(hasResult).toBe(true);
  });

  it(`should return a bbox of entity`, async () => {
    // when
    const bbox = await repository.getBBox(id);

    // then
    expect(bbox).toStrictEqual([
      -30.146484374999996,
      -40.341796875,
      38.20365531807149,
      29.22889003019423,
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
    await repository.deleteUnassignedOldEntries(
      gcAge,
      new Date('2021-03-03T12:00:06Z'),
    );

    // then
    expect(await repository.has(id)).toBe(false);
  });

  it(`should not garbage collect entity when now is 2021-03-03T12:00:04Z`, async () => {
    // when
    await repository.deleteUnassignedOldEntries(
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
    await repository.deleteUnassignedOldEntries(
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
      const { id } = (await repository.saveGeoJson(this.sampleGeoJSON))[0];
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
  };
  return fixtures;
}
