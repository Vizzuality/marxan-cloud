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
        "totalItems": 11,
        "totalPages": 1,
      }
    `);

    expect(response.body.data.length).toEqual(11);
    expect(response.body.data[0].attributes).toMatchInlineSnapshot(
      {
        costValue: expect.any(Number),
        id: expect.any(String),
        missingValues: expect.any(Number),
        planningUnits: expect.any(Number),
        runId: expect.any(Number),
        scoreValue: expect.any(Number),
      },
      `
      Object {
        "costValue": Any<Number>,
        "id": Any<String>,
        "missingValues": Any<Number>,
        "planningUnits": Any<Number>,
        "runId": Any<Number>,
        "scoreValue": Any<Number>,
      }
    `,
    );
  });
});

afterAll(async () => {
  await world?.cleanup();
});
