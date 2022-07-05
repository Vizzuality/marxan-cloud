import { apiConnections } from '@marxan-api/ormconfig';
import { ResourceId } from '@marxan/cloning/domain';
import { UserId } from '@marxan/domain-ids';
import {
  MemoryPuvsprCalculationsRepository,
  PuvsprCalculationsRepository,
  PuvsprCalculationsService,
} from '@marxan/puvspr-calculations';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { v4 } from 'uuid';
import { LegacyProjectImport } from '../legacy-project-import/domain/legacy-project-import/legacy-project-import';
import { LegacyProjectImportRepository } from '../legacy-project-import/domain/legacy-project-import/legacy-project-import.repository';
import { LegacyProjectImportMemoryRepository } from '../legacy-project-import/infra/legacy-project-import-memory.repository';
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
  const sandbox = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        ...apiConnections.default,
        keepConnectionAlive: true,
      }),
      TypeOrmModule.forFeature([]),
    ],
    providers: [
      {
        provide: LegacyProjectImportRepository,
        useClass: LegacyProjectImportMemoryRepository,
      },
      {
        provide: PuvsprCalculationsRepository,
        useClass: MemoryPuvsprCalculationsRepository,
      },
      {
        provide: PuvsprCalculationsService,
        useValue: {
          computeMarxanAmountPerPlanningUnit: computeMarxanAmountPerPlanningUnitMock,
        },
      },
      ComputeArea,
    ],
  }).compile();

  await sandbox.init();

  const sut = sandbox.get(ComputeArea);
  const legacyRepo: LegacyProjectImportMemoryRepository = sandbox.get(
    LegacyProjectImportRepository,
  );
  const puvsprCalculationsRepo: MemoryPuvsprCalculationsRepository = sandbox.get(
    PuvsprCalculationsRepository,
  );

  const expectedPuid = 1;
  const expectedAmount = 20;
  return {
    GivenProject: () => {
      return { projectId: v4(), scenarioId: v4() };
    },
    GivenLegacyProject: async () => {
      const projectId = v4();
      const scenarioId = v4();

      await legacyRepo.save(
        LegacyProjectImport.newOne(
          new ResourceId(projectId),
          new ResourceId(scenarioId),
          UserId.create(),
        ),
      );
      return { projectId, scenarioId };
    },
    GivenNoComputationHasBeenSaved: () => {
      const featureId = v4();
      computeMarxanAmountPerPlanningUnitMock.mockImplementation(async () => {
        return [{ featureId, puid: expectedPuid, amount: expectedAmount }];
      });

      return featureId;
    },
    WhenComputing: (projectId: string, scenarioId: string, featureId: string) =>
      sut.computeAreaPerPanningUnitOfFeature(projectId, scenarioId, featureId),
    ThenComputationsHasBeenSaved: async (
      projectId: string,
      featureId: string,
    ) => {
      const savedCalculations = await puvsprCalculationsRepo.getAmountPerPlanningUnitAndFeature(
        projectId,
        [featureId],
      );

      expect(savedCalculations).toBeDefined();
      expect(savedCalculations[0]).toEqual({
        amount: expectedAmount,
        puid: expectedPuid,
        featureId,
      });
    },
    ThenComputationsHasNotBeenSaved: async (
      projectId: string,
      featureId: string,
    ) => {
      const hasBeenSaved = await puvsprCalculationsRepo.areAmountPerPlanningUnitAndFeatureSaved(
        projectId,
        featureId,
      );

      expect(hasBeenSaved).toEqual(false);
    },
  };
};
