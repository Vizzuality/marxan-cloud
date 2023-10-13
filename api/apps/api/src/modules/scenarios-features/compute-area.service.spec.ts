import { ProjectSourcesEnum } from '@marxan/projects';
import {
  MemoryPuvsprCalculationsRepository,
  PuvsprCalculationsRepository,
  PuvsprCalculationsService,
} from '@marxan/puvspr-calculations';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { v4 } from 'uuid';
import { Project } from '../projects/project.api.entity';
import { ComputeArea } from './compute-area.service';

describe(ComputeArea, () => {
  let fixtures: FixtureType<typeof getFixtures>;
  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  it('saves amounts per planning unit when computation has not been made', async () => {
    const { projectId, scenarioId } = fixtures.GivenProject();
    const featureId = fixtures.GivenNoComputationHasBeenSaved();
    await fixtures.WhenComputing(projectId, scenarioId, featureId);
    await fixtures.ThenComputationsHasBeenSaved(projectId, featureId);
  });

  it('does not save amount per planning unit when is a legacy project', async () => {
    const { projectId, scenarioId } = await fixtures.GivenLegacyProject();
    const featureId = fixtures.GivenNoComputationHasBeenSaved();
    await fixtures.WhenComputing(projectId, scenarioId, featureId);
    await fixtures.ThenComputationsHasNotBeenSaved(projectId, featureId);
  });
});

const getFixtures = async () => {
  const computeMarxanAmountPerPlanningUnitMock = jest.fn();
  const findProjectMock = jest.fn();
  const sandbox = await Test.createTestingModule({
    imports: [],
    providers: [
      {
        provide: getRepositoryToken(Project),
        useValue: { find: findProjectMock },
      },
      {
        provide: PuvsprCalculationsRepository,
        useClass: MemoryPuvsprCalculationsRepository,
      },
      {
        provide: PuvsprCalculationsService,
        useValue: {
          computeMarxanAmountPerPlanningUnit:
            computeMarxanAmountPerPlanningUnitMock,
        },
      },
      ComputeArea,
    ],
  }).compile();

  await sandbox.init();

  const sut = sandbox.get(ComputeArea);
  const puvsprCalculationsRepo: MemoryPuvsprCalculationsRepository =
    sandbox.get(PuvsprCalculationsRepository);

  const expectedPuid = v4();
  const expectedAmount = 20;
  return {
    GivenProject: () => {
      const projectId = v4();
      findProjectMock.mockImplementation(async () => {
        return [{ id: projectId, sources: ProjectSourcesEnum.marxanCloud }];
      });

      return { projectId, scenarioId: v4() };
    },
    GivenLegacyProject: async () => {
      const projectId = v4();
      const scenarioId = v4();

      findProjectMock.mockImplementation(async () => {
        return [{ id: projectId, sources: ProjectSourcesEnum.legacyImport }];
      });

      return { projectId, scenarioId };
    },
    GivenNoComputationHasBeenSaved: () => {
      const featureId = v4();
      computeMarxanAmountPerPlanningUnitMock.mockImplementation(async () => {
        return [
          {
            featureId,
            projectPuId: expectedPuid,
            amount: expectedAmount,
            puId: 1,
          },
        ];
      });

      return featureId;
    },
    WhenComputing: (projectId: string, scenarioId: string, featureId: string) =>
      sut.computeAreaPerPlanningUnitOfFeature(projectId, scenarioId, featureId),
    ThenComputationsHasBeenSaved: async (
      projectId: string,
      featureId: string,
    ) => {
      const savedCalculations =
        await puvsprCalculationsRepo.getAmountPerPlanningUnitAndFeature(
          projectId,
          [featureId],
        );

      expect(savedCalculations).toBeDefined();
      expect(savedCalculations[0]).toEqual({
        amount: expectedAmount,
        projectPuId: expectedPuid,
        featureId,
      });
    },
    ThenComputationsHasNotBeenSaved: async (
      projectId: string,
      featureId: string,
    ) => {
      expect(computeMarxanAmountPerPlanningUnitMock).not.toHaveBeenCalled();
      const hasBeenSaved =
        await puvsprCalculationsRepo.areAmountPerPlanningUnitAndFeatureSaved(
          projectId,
          featureId,
        );

      expect(hasBeenSaved).toEqual(false);
    },
  };
};
