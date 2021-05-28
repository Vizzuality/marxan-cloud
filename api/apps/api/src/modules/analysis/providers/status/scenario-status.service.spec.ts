import { Test } from '@nestjs/testing';

import { ScenarioStatusService } from './scenario-status.service';

const scenarioId = 'fake-scenario-id';
let sut: ScenarioStatusService;

beforeEach(async () => {
  const sandbox = await Test.createTestingModule({
    providers: [ScenarioStatusService],
  }).compile();

  sut = sandbox.get(ScenarioStatusService);
});

describe(`when asking for a status`, () => {
  it(`resolves to state`, async () => {
    expect(await sut.status(scenarioId)).toMatchInlineSnapshot(`
      Object {
        "id": "fake-scenario-id",
        "status": "done",
      }
    `);
  });
});
