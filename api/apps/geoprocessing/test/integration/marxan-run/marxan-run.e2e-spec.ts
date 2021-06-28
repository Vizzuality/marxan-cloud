import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import AxiosMockAdapter from 'axios-mock-adapter';
import Axios from 'axios';

import { MarxanSandboxRunnerService } from '@marxan-geoprocessing/marxan-sandboxed-runner/marxan-sandbox-runner.service';
import { AppModule } from '@marxan-geoprocessing/app.module';
import { v4 } from 'uuid';
import { Repository } from 'typeorm';
import { ScenariosOutputResultsGeoEntity } from '@marxan/scenarios-planning-unit';
import { getRepositoryToken } from '@nestjs/typeorm';
import { readFileSync } from 'fs';

let app: INestApplication;
let sut: MarxanSandboxRunnerService;

let axiosMock: AxiosMockAdapter;
const axios = Axios.create();

let tempRepoReference: Repository<ScenariosOutputResultsGeoEntity>;

const scenarioId = v4();

beforeAll(async () => {
  axiosMock = new AxiosMockAdapter(axios, {
    onNoMatch: 'throwException',
  });
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(`AXIOS_INSTANCE_TOKEN`)
    .useValue(axios)
    .compile();
  app = await moduleFixture.createNestApplication().init();
  tempRepoReference = app.get(
    getRepositoryToken(ScenariosOutputResultsGeoEntity),
  );
  sut = app.get(MarxanSandboxRunnerService);
});

describe(`when input data is available`, () => {
  beforeEach(() => {
    resources.forEach((resource) =>
      axiosMock
        .onGet(resource.assetUrl)
        .replyOnce(
          200,
          readFileSync(
            process.cwd() +
              `/apps/geoprocessing/src/marxan-sandboxed-runner/__mocks__/sample-input/${resource.targetRelativeDestination}`,
          ),
          {
            'content-type': 'plain/text',
          },
        ),
    );
  });

  test(`marxan run`, async () => {
    await sut.run(
      scenarioId,
      resources.map((resource) => ({
        url: resource.assetUrl,
        relativeDestination: resource.targetRelativeDestination,
      })),
    );

    expect(
      await tempRepoReference.count({
        where: {
          scenarioId,
        },
      }),
    ).toBeGreaterThan(0);
  }, 30000);
});

afterAll(async () => {
  await tempRepoReference.delete({
    scenarioId,
  });
});

const resources = [
  {
    name: `input.dat`,
    assetUrl: `http://localhost:3000/input.dat`,
    targetRelativeDestination: `input.dat`,
  },
  {
    name: `pu.dat`,
    assetUrl: `http://localhost:3000/pu.dat`,
    targetRelativeDestination: `input/pu.dat`,
  },
  {
    name: `spec.dat`,
    assetUrl: `http://localhost:3000/spec.dat`,
    targetRelativeDestination: `input/spec.dat`,
  },
  {
    name: `puvsp.dat`,
    assetUrl: `http://localhost:3000/puvsp.dat`,
    targetRelativeDestination: `input/puvsp.dat`,
  },
  {
    name: `puvsp_sporder.dat`,
    assetUrl: `http://localhost:3000/puvsp_sporder.dat`,
    targetRelativeDestination: `input/puvsp_sporder.dat`,
  },
  {
    name: `bound.dat`,
    assetUrl: `http://localhost:3000/bound.dat`,
    targetRelativeDestination: `input/bound.dat`,
  },
];
