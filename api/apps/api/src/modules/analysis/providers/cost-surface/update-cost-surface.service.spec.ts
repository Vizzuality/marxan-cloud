import { Test } from '@nestjs/testing';
import { CostSurfaceInputDto } from '../../entry-points/adjust-cost-surface-input';

import { ArePuidsAllowedPort } from '../shared/are-puids-allowed.port';
import { ArePuidsAllowedMock } from '../shared/__mocks__/are-puuids-allowed.mock';

import { CostSurfaceRepo } from './cost-surface-repo';
import { UpdateCostSurfaceService } from './update-cost-surface.service';

import { CostSurfaceRepoMock } from './__mocks__/cost-surface-repo-mock';

let sut: UpdateCostSurfaceService;

let puIdValidator: ArePuidsAllowedMock;
let repo: CostSurfaceRepoMock;

beforeEach(async () => {
  const sandbox = await Test.createTestingModule({
    providers: [
      UpdateCostSurfaceService,
      {
        provide: ArePuidsAllowedPort,
        useClass: ArePuidsAllowedMock,
      },
      {
        provide: CostSurfaceRepo,
        useClass: CostSurfaceRepoMock,
      },
    ],
  }).compile();

  sut = sandbox.get(UpdateCostSurfaceService);
  puIdValidator = sandbox.get(ArePuidsAllowedPort);
  repo = sandbox.get(CostSurfaceRepo);
});

const scenarioId = 'scenario-id';
const inputConstraints: Readonly<CostSurfaceInputDto> = Object.freeze({
  planningUnits: [
    {
      id: 'pu-id-1',
      cost: 200,
    },
    {
      id: 'pu-id-2',
      cost: 4000,
    },
  ],
});

describe(`when given PUs are not related to provided scenario`, () => {
  beforeEach(() => {
    puIdValidator.mock.mockResolvedValue({
      errors: ['Some invalid PU given.'],
    });
  });

  it(`should throw`, async () => {
    await expect(sut.update(scenarioId, inputConstraints)).rejects.toThrowError(
      /One or more of the planning units/,
    );
  });
});

describe(`when given PUs are related to provided scenario`, () => {
  beforeEach(() => {
    puIdValidator.mock.mockResolvedValue({
      errors: [],
    });
  });
  describe(`when persistence fails`, () => {
    beforeEach(() => {
      repo.mock.mockRejectedValue(new Error('DB disaster.'));
    });
    it(`should throw error`, async () => {
      await expect(
        sut.update(scenarioId, inputConstraints),
      ).rejects.toThrowError(/disaster/);
    });
  });

  describe(`when persistence succeeds`, () => {
    beforeEach(() => {
      repo.mock.mockResolvedValue(undefined);
    });

    it(`should return with success`, async () => {
      await expect(sut.update(scenarioId, inputConstraints)).resolves.toEqual(
        true,
      );
    });
  });
});
