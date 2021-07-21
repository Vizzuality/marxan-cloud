import { UpdatePlanningUnitsService } from './update-planning-units.service';
import { Test } from '@nestjs/testing';

import { ArePuidsAllowedPort } from '../shared/are-puids-allowed.port';
import { RequestJobPort } from './request-job.port';
import { UpdatePlanningUnitsEventsPort } from './update-planning-units-events.port';

import { ArePuidsAllowedMock } from '../shared/__mocks__/are-puuids-allowed.mock';
import { RequestJobPortMock } from './__mocks__/request-job-port.mock';
import { validGeoJson } from './__mocks__/geojson';
import { ApiEventsMock } from './__mocks__/api-events.mock';

let sut: UpdatePlanningUnitsService;

let puIdValidator: ArePuidsAllowedMock;
let apiEvents: ApiEventsMock;
let jobRequester: RequestJobPortMock;

const scenarioId = 'fake-scenario-id';

beforeEach(async () => {
  const sandbox = await Test.createTestingModule({
    providers: [
      {
        provide: ArePuidsAllowedPort,
        useClass: ArePuidsAllowedMock,
      },
      {
        provide: RequestJobPort,
        useClass: RequestJobPortMock,
      },
      {
        provide: UpdatePlanningUnitsEventsPort,
        useClass: ApiEventsMock,
      },
      UpdatePlanningUnitsService,
    ],
  }).compile();

  sut = sandbox.get(UpdatePlanningUnitsService);
  puIdValidator = sandbox.get(ArePuidsAllowedPort);
  jobRequester = sandbox.get(RequestJobPort);
  apiEvents = sandbox.get(UpdatePlanningUnitsEventsPort);
});

describe(`when PU IDs are not available`, () => {
  beforeEach(() => {
    puIdValidator.mock.mockResolvedValueOnce({
      errors: ['Oups, you tricky person!'],
    });
  });

  it(`throws an error`, async () => {
    await expect(
      sut.update(scenarioId, {
        include: {
          pu: ['some-pu-uuid'],
        },
        exclude: {
          pu: ['some-other-uuid'],
        },
      }),
    ).rejects.toThrow(/does not match any planning unit/);
    expect(apiEvents.eventMock.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "fake-scenario-id",
          "submitted",
          undefined,
        ],
        Array [
          "fake-scenario-id",
          "failed",
          Object {
            "errors": Array [
              "Oups, you tricky person!",
            ],
          },
        ],
      ]
    `);
    expect(puIdValidator.mock.mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        "fake-scenario-id",
        Array [
          "some-pu-uuid",
          "some-other-uuid",
        ],
      ]
    `);
  });
});

describe(`when PU IDs are available`, () => {
  const payload = {
    include: {
      pu: ['some-pu-uuid'],
    },
    exclude: {
      geo: [validGeoJson()],
    },
  };
  beforeEach(() => {
    puIdValidator.mock.mockResolvedValueOnce({
      errors: [],
    });
  });

  it(`requests the job to start`, async () => {
    expect(await sut.update(scenarioId, payload)).toEqual(undefined);

    expect(jobRequester.mock.mock.calls[0]).toEqual([
      {
        ...payload,
        scenarioId,
      },
    ]);
    expect(apiEvents.eventMock.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "fake-scenario-id",
          "submitted",
          undefined,
        ],
      ]
    `);
  });
});
