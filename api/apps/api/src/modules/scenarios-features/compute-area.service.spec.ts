import { ProjectSourcesEnum } from '@marxan/projects';
import {
  MemoryFeatureAmountsPerPlanningUnitRepository,
  FeatureAmountsPerPlanningUnitRepository,
  FeatureAmountsPerPlanningUnitService,
} from '@marxan/feature-amounts-per-planning-unit';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { v4 } from 'uuid';
import { Project } from '../projects/project.api.entity';
import { ComputeArea } from './compute-area.service';
import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';
import { GeoFeaturesService } from '@marxan-api/modules/geo-features';

describe(ComputeArea, () => {
  let fixtures: FixtureType<typeof getFixtures>;
  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  it('saves amounts per planning unit when computation has not been made and save min/max amount for the feature', async () => {
    const { projectId, scenarioId } = fixtures.GivenProject();
    const featureId = fixtures.GivenNoComputationHasBeenSaved();
    fixtures.GivenMinMaxAmount(featureId, undefined, undefined);

    await fixtures.WhenComputing(projectId, scenarioId, featureId);

    await fixtures.ThenComputationsHasBeenSaved(projectId, featureId);
    await fixtures.ThenMinMaxAmountWasSaved();
  });

  it('does not include rows with amount = 0 in puvspr.dat files', async () => {
    const { projectId, scenarioId } = fixtures.GivenProject();
    const featureId =
      fixtures.GivenFeatureWasCreatedWithSomeAmountsPerPuEqualToZero();
    fixtures.GivenMinMaxAmount(featureId, undefined, undefined);

    await fixtures.WhenComputing(projectId, scenarioId, featureId);

    await fixtures.ThenNoPuvsprRowsWithAmountEqualToZeroShouldBeGenerated(
      projectId,
      featureId,
    );
    await fixtures.ThenMinMaxAmountWasSaved();
  });

  it('does not save saves amounts per planning unit when computation has already been made but saves min/max amount for the feature', async () => {
    const { projectId, scenarioId } = fixtures.GivenProject();
    const featureId = fixtures.GivenNoComputationHasBeenSaved();
    fixtures.GivenMinMaxAmount(featureId, 1, undefined);
    fixtures.GivenComputationAlreadySaved(projectId, featureId);

    await fixtures.WhenComputing(projectId, scenarioId, featureId);

    await fixtures.ThenComputationsWasNotDone();
    await fixtures.ThenMinMaxAmountWasSaved();
  });
  it('does not save saves amounts per planning unit when computation has already been made and does not save min/max amount for the feature if already present', async () => {
    const { projectId, scenarioId } = fixtures.GivenProject();
    const featureId = fixtures.GivenNoComputationHasBeenSaved();
    fixtures.GivenMinMaxAmount(featureId, 1, 10);
    fixtures.GivenComputationAlreadySaved(projectId, featureId);

    await fixtures.WhenComputing(projectId, scenarioId, featureId);

    await fixtures.ThenComputationsWasNotDone();
    await fixtures.ThenMinMaxAmountWasNotSaved();
  });

  it('does not save amount per planning unit when is a legacy project', async () => {
    const { projectId, scenarioId } = await fixtures.GivenLegacyProject();
    const featureId = fixtures.GivenNoComputationHasBeenSaved();

    await fixtures.WhenComputing(projectId, scenarioId, featureId);

    await fixtures.ThenComputationsHasNotBeenSavedForLegacyProject(
      projectId,
      featureId,
    );
    await fixtures.ThenMinMaxAmountWasNotSaved();
  });
});

const getFixtures = async () => {
  const computeMarxanAmountPerPlanningUnitMock = jest.fn();
  const findProjectMock = jest.fn();
  const findGeoFeatureMock = jest.fn();
  const saveAmountRangeForFeaturesMock = jest.fn();
  const sandbox = await Test.createTestingModule({
    imports: [],
    providers: [
      {
        provide: getRepositoryToken(Project),
        useValue: { find: findProjectMock },
      },
      {
        provide: getRepositoryToken(GeoFeature),
        useValue: { findOneOrFail: findGeoFeatureMock },
      },
      {
        provide: GeoFeaturesService,
        useValue: {
          saveAmountRangeForFeatures: saveAmountRangeForFeaturesMock,
        },
      },
      {
        provide: FeatureAmountsPerPlanningUnitRepository,
        useClass: MemoryFeatureAmountsPerPlanningUnitRepository,
      },
      {
        provide: FeatureAmountsPerPlanningUnitService,
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
  const featureAmountsPerPlanningUnitRepo: MemoryFeatureAmountsPerPlanningUnitRepository =
    sandbox.get(FeatureAmountsPerPlanningUnitRepository);

  const expectedPuid = v4();
  const expectedPuidWithAmountEqualToZero = v4();
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
    GivenFeatureWasCreatedWithSomeAmountsPerPuEqualToZero: () => {
      const featureId = v4();
      computeMarxanAmountPerPlanningUnitMock.mockImplementation(async () => {
        return [
          {
            featureId,
            projectPuId: expectedPuid,
            amount: expectedAmount,
            puId: 1,
          },
          {
            featureId,
            projectPuId: expectedPuidWithAmountEqualToZero,
            amount: 0,
            puId: 2,
          },
        ];
      });

      return featureId;
    },
    GivenComputationAlreadySaved: (projectId: string, featureId: string) => {
      featureAmountsPerPlanningUnitRepo.memory[projectId] = [
        { featureId, amount: 42, projectPuId: v4() },
      ];
    },
    GivenMinMaxAmount: (featureId: string, min?: number, max?: number) => {
      findGeoFeatureMock.mockResolvedValueOnce({
        id: featureId,
        amountMin: min,
        amountMax: max,
      });
    },
    WhenComputing: (projectId: string, scenarioId: string, featureId: string) =>
      sut.computeAreaPerPlanningUnitOfFeature(projectId, scenarioId, featureId),
    ThenComputationsHasBeenSaved: async (
      projectId: string,
      featureId: string,
    ) => {
      const savedCalculations =
        await featureAmountsPerPlanningUnitRepo.getAmountPerPlanningUnitAndFeature(
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
    ThenNoPuvsprRowsWithAmountEqualToZeroShouldBeGenerated: async (
      projectId: string,
      featureId: string,
    ) => {
      const savedCalculations =
        await featureAmountsPerPlanningUnitRepo.getAmountPerPlanningUnitAndFeature(
          projectId,
          [featureId],
        );

      expect(savedCalculations).toBeDefined();
      expect(savedCalculations[0]).toEqual({
        amount: expectedAmount,
        projectPuId: expectedPuid,
        featureId,
      });
      expect(savedCalculations).not.toContain({
        amount: 0,
        projectPuId: expectedPuidWithAmountEqualToZero,
        featureId,
      });
      expect(savedCalculations.length).toBe(1);
    },
    ThenComputationsWasNotDone: async () => {
      expect(computeMarxanAmountPerPlanningUnitMock).not.toHaveBeenCalled();
    },
    ThenComputationsHasNotBeenSavedForLegacyProject: async (
      projectId: string,
      featureId: string,
    ) => {
      expect(computeMarxanAmountPerPlanningUnitMock).not.toHaveBeenCalled();
      const hasBeenSaved =
        await featureAmountsPerPlanningUnitRepo.areAmountPerPlanningUnitAndFeatureSaved(
          projectId,
          featureId,
        );

      expect(hasBeenSaved).toEqual(false);
    },
    ThenMinMaxAmountWasSaved: async () => {
      expect(saveAmountRangeForFeaturesMock).toBeCalledTimes(1);
    },
    ThenMinMaxAmountWasNotSaved: async () => {
      expect(saveAmountRangeForFeaturesMock).toBeCalledTimes(0);
    },
  };
};
