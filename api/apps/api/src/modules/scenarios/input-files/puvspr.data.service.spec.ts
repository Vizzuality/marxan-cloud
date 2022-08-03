import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import { PuvsprDatService } from './puvspr.dat.service';
import { Scenario } from '../scenario.api.entity';
import { PuvsprDatProcessor } from './puvspr.dat.processor/puvspr.dat.processor';
import { v4 } from 'uuid';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { ProjectSourcesEnum } from '@marxan/projects';

let sut: PuvsprDatService;
const puvsprDatProcessor = jest.fn();
const scenarioRepo = jest.fn();
const projectRepo = jest.fn();
const projectId = v4();
const scenarioId = v4();

beforeEach(async () => {
  const sandbox = await Test.createTestingModule({
    providers: [
      PuvsprDatService,
      {
        provide: getRepositoryToken(Scenario),
        useValue: { find: scenarioRepo },
      },
      {
        provide: getRepositoryToken(Project),
        useValue: { find: projectRepo },
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
      id: scenarioId,
      projectId: projectId,
    },
  ]);
});

describe(`when there are no rows`, () => {
  beforeEach(() => {
    puvsprDatProcessor.mockImplementationOnce(async () => []);
  });

  describe('when is a legacy project', () => {
    beforeEach(() => {
      projectRepo.mockImplementation(async () => [
        { id: projectId, sources: ProjectSourcesEnum.legacyImport },
      ]);
    });

    it(`should return headers only`, async () => {
      expect(await sut.getPuvsprDatContent('scenario-id')).toEqual(
        `species\tpu\tamount\n`,
      );
    });
  });

  describe('when is a marxan project', () => {
    beforeEach(() => {
      projectRepo.mockImplementation(async () => [
        { id: projectId, sources: ProjectSourcesEnum.marxanCloud },
      ]);
    });

    it(`should return headers only`, async () => {
      expect(await sut.getPuvsprDatContent('scenario-id')).toEqual(
        `species\tpu\tamount\n`,
      );
    });
  });
});

describe(`when there is data available`, () => {
  beforeEach(() => {
    puvsprDatProcessor.mockImplementationOnce(async () => [
      {
        amount: 1000.0,
        speciesId: 'feature-1',
        puId: 'pu-1,',
      },
      {
        amount: 0.001,
        speciesId: 'feature-1',
        puId: 'pu-2,',
      },
      {
        amount: 99.995,
        speciesId: 'feature-1',
        puId: 'pu-3,',
      },
    ]);
  });

  describe('when is a legacy project', () => {
    beforeEach(() => {
      projectRepo.mockImplementation(async () => [
        { id: projectId, sources: ProjectSourcesEnum.legacyImport },
      ]);
    });

    it(`should return content`, async () => {
      expect(await sut.getPuvsprDatContent('scenario-id'))
        .toMatchInlineSnapshot(`
        "species	pu	amount
        feature-1	pu-1,	1000.000000
        feature-1	pu-2,	0.001000
        feature-1	pu-3,	99.995000"
      `);
    });
  });

  describe('when is a marxan project', () => {
    beforeEach(() => {
      projectRepo.mockImplementation(async () => [
        { id: projectId, sources: ProjectSourcesEnum.marxanCloud },
      ]);
    });

    it(`should return content`, async () => {
      expect(await sut.getPuvsprDatContent('scenario-id'))
        .toMatchInlineSnapshot(`
        "species	pu	amount
        feature-1	pu-1,	1000.000000
        feature-1	pu-2,	0.001000
        feature-1	pu-3,	99.995000"
      `);
    });
  });
});
