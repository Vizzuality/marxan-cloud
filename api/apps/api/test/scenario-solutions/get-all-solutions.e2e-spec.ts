import { PromiseType } from 'utility-types';
import { createWorld } from './world';

let world: PromiseType<ReturnType<typeof createWorld>>;

beforeAll(async () => {
  world = await createWorld();
});

describe(`When getting scenario solution results`, () => {
  beforeAll(async () => {
    await world.GivenScenarioHasSolutionsReady();
  });

  it(`should resolve solutions`, async () => {
    const response = await world.WhenGettingSolutions();
    expect(response.body.meta).toMatchInlineSnapshot(`
      Object {
        "page": 1,
        "size": 25,
        "totalItems": 1,
        "totalPages": 1,
      }
    `);

    expect(response.body.data.length).toEqual(1);
    expect(response.body.data[0].attributes).toMatchInlineSnapshot(
      {
        id: expect.any(String),
      },
      `
      Object {
        "cost": 400,
        "id": Any<String>,
        "missingValues": 13,
        "planningUnits": 17,
        "run": 1,
        "score": 999,
      }
    `,
    );
  });
});

afterAll(async () => {
  await world?.cleanup();
});
