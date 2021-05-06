import { AnalysisService } from './analysis.service';
import { Test } from '@nestjs/testing';

import { ArePuidsAllowedPort } from './are-puids-allowed.port';
import { RequestJobPort } from './request-job.port';
import { JobStatusPort } from './job-status.port';

import { ArePuidsAllowedMock } from './__mocks__/are-puuids-allowed.mock';
import { RequestJobPortMock } from './__mocks__/request-job-port.mock';
import { JobStatusPortMock } from './__mocks__/job-status-port.mock';

import { validGeoJson } from './__mocks__/geojson';
import { JobStatus } from './async-job';

let sut: AnalysisService;

let puIdValidator: ArePuidsAllowedMock;
let jobRequester: RequestJobPortMock;
let jobStatusMock: JobStatusPortMock;

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
        provide: JobStatusPort,
        useClass: JobStatusPortMock,
      },
      AnalysisService,
    ],
  }).compile();

  sut = sandbox.get(AnalysisService);
  puIdValidator = sandbox.get(ArePuidsAllowedPort);
  jobRequester = sandbox.get(RequestJobPort);
  jobStatusMock = sandbox.get(JobStatusPort);
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
    ).rejects.toThrow(/not reachable/);
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
    expect(await sut.update(scenarioId, payload)).toEqual(true);

    expect(jobRequester.mock.mock.calls[0]).toEqual([
      {
        ...payload,
        scenarioId,
      },
    ]);
  });
});

describe(`when asking for a status`, () => {
  beforeEach(() => {
    jobStatusMock.mock.mockResolvedValueOnce({
      status: JobStatus.Failed,
      id: scenarioId,
    });
  });
  it(`proxies request to dependency`, async () => {
    expect(await sut.getJobStatus(scenarioId)).toMatchInlineSnapshot(`
      Object {
        "id": "fake-scenario-id",
        "status": "failed",
      }
    `);
    expect(jobStatusMock.mock.mock.calls[0]).toEqual([scenarioId]);
  });
});
