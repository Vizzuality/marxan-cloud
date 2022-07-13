import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import { PuvsprDatService } from './puvspr.dat.service';
import { Scenario } from '../scenario.api.entity';
import { LegacyProjectImportRepository } from '@marxan-api/modules/legacy-project-import/domain/legacy-project-import/legacy-project-import.repository';
import { LegacyProjectImportMemoryRepository } from '@marxan-api/modules/legacy-project-import/infra/legacy-project-import-memory.repository';
import { PuvsprDatProcessor } from './puvspr.dat.processor/puvspr.dat.processor';
import { v4 } from 'uuid';

let sut: PuvsprDatService;
let puvsprDatProcessor = jest.fn();
let scenarioRepo = jest.fn();

beforeEach(async () => {
  const sandbox = await Test.createTestingModule({
    providers: [
      PuvsprDatService,
      {
        provide: getRepositoryToken(Scenario),
        useValue: { find: scenarioRepo },
      },
      {
        provide: LegacyProjectImportRepository,
        useClass: LegacyProjectImportMemoryRepository,
      },
      {
        provide: PuvsprDatProcessor,
        useValue: { getPuvsprDatRows: puvsprDatProcessor },
      },
    ],
  }).compile();

  sut = sandbox.get(PuvsprDatService);

  scenarioRepo.mockImplementation(async () => [
    {
      id: v4(),
      projectId: v4(),
    },
  ]);
});

describe(`when there are no rows`, () => {
  beforeEach(() => {
    puvsprDatProcessor.mockImplementationOnce(async () => []);
  });

  it(`should return headers only`, async () => {
    expect(await sut.getPuvsprDatContent('scenario-id')).toEqual(
      `species\tpu\tamount\n`,
    );
  });
});

describe(`when there is data available`, () => {
  beforeEach(() => {
    puvsprDatProcessor.mockImplementationOnce(async () => [
      {
        amount: 1000.0,
        speciesId: 'feature-1',
        puid: 'pu-1,',
      },
      {
        amount: 0.001,
        speciesId: 'feature-1',
        puid: 'pu-2,',
      },
      {
        amount: 99.995,
        speciesId: 'feature-1',
        puid: 'pu-3,',
      },
    ]);
  });

  it(`should return content`, async () => {
    expect(await sut.getPuvsprDatContent('scenario-id')).toMatchInlineSnapshot(`
      "species	pu	amount
      feature-1	pu-1,	1000.000000
      feature-1	pu-2,	0.001000
      feature-1	pu-3,	99.995000"
    `);
  });
});
