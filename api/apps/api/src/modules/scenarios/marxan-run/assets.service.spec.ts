import { PromiseType } from 'utility-types';
import { Test } from '@nestjs/testing';
import { apiUrlToken, AssetsService } from './assets.service';
import { IoSettings } from '../input-files/input-params/io-settings';
import { InputFilesService } from '@marxan-api/modules/scenarios/input-files';

let fixtures: PromiseType<ReturnType<typeof getFixtures>>;
let service: AssetsService;

beforeEach(async () => {
  fixtures = await getFixtures();

  service = fixtures.getAssetsService();
});

it(`should return valid config`, async () => {
  const random = fixtures.random;
  expect(await service.forScenario(`scenario-${random}`, 2)).toStrictEqual([
    {
      url: `https://api-endpoint${random}.test:3000/api/v1/marxan-run/scenarios/scenario-${random}/marxan/dat/input.dat`,
      relativeDestination: `input.dat`,
    },
    {
      url: `https://api-endpoint${random}.test:3000/api/v1/marxan-run/scenarios/scenario-${random}/marxan/dat/pu.dat`,
      relativeDestination: `inputDir${random}/pu-name-file${random}`,
    },
    {
      url: `https://api-endpoint${random}.test:3000/api/v1/marxan-run/scenarios/scenario-${random}/marxan/dat/bound.dat`,
      relativeDestination: `inputDir${random}/bound-name-file${random}`,
    },
    {
      url: `https://api-endpoint${random}.test:3000/api/v1/marxan-run/scenarios/scenario-${random}/marxan/dat/spec.dat`,
      relativeDestination: `inputDir${random}/spec-name-file${random}`,
    },
    {
      url: `https://api-endpoint${random}.test:3000/api/v1/marxan-run/scenarios/scenario-${random}/marxan/dat/puvspr.dat`,
      relativeDestination: `inputDir${random}/puv-spr-name-file${random}`,
    },
  ]);
});

it(`should return config without bound when zero blm given`, async () => {
  const random = fixtures.random;
  expect(await service.forScenario(`scenario-${random}`, 0)).toStrictEqual([
    {
      url: `https://api-endpoint${random}.test:3000/api/v1/marxan-run/scenarios/scenario-${random}/marxan/dat/input.dat`,
      relativeDestination: `input.dat`,
    },
    {
      url: `https://api-endpoint${random}.test:3000/api/v1/marxan-run/scenarios/scenario-${random}/marxan/dat/pu.dat`,
      relativeDestination: `inputDir${random}/pu-name-file${random}`,
    },
    {
      url: `https://api-endpoint${random}.test:3000/api/v1/marxan-run/scenarios/scenario-${random}/marxan/dat/spec.dat`,
      relativeDestination: `inputDir${random}/spec-name-file${random}`,
    },
    {
      url: `https://api-endpoint${random}.test:3000/api/v1/marxan-run/scenarios/scenario-${random}/marxan/dat/puvspr.dat`,
      relativeDestination: `inputDir${random}/puv-spr-name-file${random}`,
    },
  ]);
});

async function getFixtures() {
  const random = Math.random().toString(36);
  const ioSettings: IoSettings = {
    BOUNDNAME: `bound-name-file${random}`,
    INPUTDIR: `inputDir${random}`,
    OUTPUTDIR: `OUTPUTDIR.file${random}`,
    PUNAME: `pu-name-file${random}`,
    PUVSPRNAME: `puv-spr-name-file${random}`,
    SPECNAME: `spec-name-file${random}`,
  };
  const testingModule = await Test.createTestingModule({
    providers: [
      {
        provide: InputFilesService,
        useValue: {
          getSettings: () => ioSettings,
        },
      },
      {
        provide: apiUrlToken,
        useValue: `https://api-endpoint${random}.test:3000`,
      },
      AssetsService,
    ],
  }).compile();
  return {
    random,
    getAssetsService() {
      return testingModule.get(AssetsService);
    },
  };
}
