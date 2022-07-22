import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getEntityManagerToken, TypeOrmModule } from '@nestjs/typeorm';
import { isLeft, Right } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';
import { ScenarioMetadataPieceExporter } from '@marxan-geoprocessing/export/pieces-exporters/scenario-metadata.piece-exporter';
import { ScenarioMetadataContent } from '@marxan/cloning/infrastructure/clone-piece-data/scenario-metadata';
import {
  DeleteProjectAndOrganization,
  GivenScenarioExists,
  readSavedFile,
} from '../fixtures';
import { GeoCloningFilesRepositoryModule } from '@marxan-geoprocessing/modules/cloning-files-repository';

let fixtures: FixtureType<typeof getFixtures>;

describe(ScenarioMetadataPieceExporter, () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 10_000);

  afterEach(async () => {
    await fixtures?.cleanUp();
  });

  it('fails when the scenario is not found', async () => {
    const input = fixtures.GivenAScenarioMetadataExportJob();
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenAScenarioExistErrorShouldBeThrown();
  });

  it('fails when scenario blm range is not found', async () => {
    const input = fixtures.GivenAScenarioMetadataExportJob();
    await fixtures.GivenScenarioExist();
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenAScenarioBlmExistErrorShouldBeThrown();
  });

  it('saves file succesfully when the scenario is found', async () => {
    const input = fixtures.GivenAScenarioMetadataExportJob();
    await fixtures.GivenScenarioExist();
    await fixtures.GivenScenarioBlmRangeExist();
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenScenarioMetadataFileIsSaved();
  });

  it('saves file succesfully when the scenario with solutions locked is found', async () => {
    const solutionsAreLocked = true;
    const input = fixtures.GivenAScenarioMetadataExportJob();
    await fixtures.GivenScenarioExist(solutionsAreLocked);
    await fixtures.GivenScenarioBlmRangeExist();
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenScenarioMetadataFileIsSaved(solutionsAreLocked);
  });
});

const getFixtures = async () => {
  const sandbox = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        ...geoprocessingConnections.apiDB,
        keepConnectionAlive: true,
        logging: false,
      }),
      GeoCloningFilesRepositoryModule,
    ],
    providers: [
      ScenarioMetadataPieceExporter,
      { provide: Logger, useValue: { error: () => {}, setContext: () => {} } },
    ],
  }).compile();

  await sandbox.init();
  const projectId = v4();
  const scenarioId = v4();
  const organizationId = v4();
  const sut = sandbox.get(ScenarioMetadataPieceExporter);
  const apiEntityManager: EntityManager = sandbox.get(
    getEntityManagerToken(geoprocessingConnections.apiDB),
  );
  const fileRepository = sandbox.get(CloningFilesRepository);
  const expectedContent: (
    solutionsAreLocked: boolean,
  ) => ScenarioMetadataContent = (solutionsAreLocked: boolean) => ({
    name: `test scenario - ${scenarioId}`,
    description: 'desc',
    blm: 1,
    numberOfRuns: 6,
    metadata: { marxanInputParameterFile: { meta: '1' } },
    blmRange: {
      defaults: [0, 20, 40, 60, 80, 100],
      range: [0, 100],
      values: [],
    },
    ranAtLeastOnce: false,
    solutionsAreLocked,
    type: 'marxan',
  });

  return {
    cleanUp: async () => {
      return DeleteProjectAndOrganization(
        apiEntityManager,
        projectId,
        organizationId,
      );
    },
    GivenAScenarioMetadataExportJob: (): ExportJobInput => {
      return {
        allPieces: [
          { resourceId: scenarioId, piece: ClonePiece.ScenarioMetadata },
        ],
        componentId: v4(),
        exportId: v4(),
        piece: ClonePiece.ScenarioMetadata,
        resourceId: scenarioId,
        resourceKind: ResourceKind.Scenario,
      };
    },
    GivenScenarioExist: async (solutionsAreLocked = false) => {
      return GivenScenarioExists(
        apiEntityManager,
        scenarioId,
        projectId,
        organizationId,
        {
          description: 'desc',
          blm: 1,
          number_of_runs: 6,
          metadata: { marxanInputParameterFile: { meta: '1' } },
          solutions_are_locked: solutionsAreLocked,
        },
      );
    },
    GivenScenarioBlmRangeExist: async () => {
      return apiEntityManager
        .createQueryBuilder()
        .insert()
        .into('scenario_blms')
        .values({
          id: scenarioId,
          values: [],
          defaults: [0, 20, 40, 60, 80, 100],
          range: [0, 100],
        })
        .execute();
    },
    WhenPieceExporterIsInvoked: (input: ExportJobInput) => {
      return {
        ThenAScenarioExistErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(/does not exist/gi);
        },
        ThenAScenarioBlmExistErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(/blm.*does not exist/gi);
        },
        ThenScenarioMetadataFileIsSaved: async (solutionsAreLocked = false) => {
          const result = await sut.run(input);
          const file = await fileRepository.get(result.uris[0].uri);
          expect((file as Right<Readable>).right).toBeDefined();
          if (isLeft(file)) throw new Error();
          const savedStrem = file.right;
          const content = await readSavedFile<ScenarioMetadataContent>(
            savedStrem,
          );
          expect(content).toEqual(expectedContent(solutionsAreLocked));
        },
      };
    },
  };
};
