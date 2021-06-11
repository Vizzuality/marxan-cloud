import { PromiseType } from 'utility-types';
import { createWorld } from './world';

let world: PromiseType<ReturnType<typeof createWorld>>;

beforeAll(async () => {
  world = await createWorld();
});

describe(`When scenario has PUs with cost and lock status`, () => {
  beforeAll(async () => {
    await world.GivenScenarioWithPuAndLocks();
  });

  it(`returns relevant data`, async () => {
    const result = await world.WhenGettingMarxanData();
    expect(result).toMatchInlineSnapshot(`
      "id	cost	status
      0
      1
      2
      3		"
    `);
  });
});

afterAll(async () => {
  await world?.cleanup();
});
