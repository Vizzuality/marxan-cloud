import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Test } from '@nestjs/testing';
import { getEntityManagerToken, TypeOrmModule } from '@nestjs/typeorm';
import { isLeft, Right } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';
import {
  exportVersion,
  ScenarioExportConfigContent,
} from '@marxan/cloning/infrastructure/clone-piece-data/export-config';
import { ExportConfigScenarioPieceExporter } from '@marxan-geoprocessing/export/pieces-exporters/export-config.scenario-piece-exporter';
import {
  DeleteProjectAndOrganization,
  GivenScenarioExists,
  readSavedFile,
} from '../fixtures';
import { GeoCloningFilesRepositoryModule } from '@marxan-geoprocessing/modules/cloning-files-repository';
import { FakeLogger } from '@marxan-api/utils/__mocks__/fake-logger';

let fixtures: FixtureType<typeof getFixtures>;

describe(ExportConfigScenarioPieceExporter, () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 10_000);

  afterEach(async () => {
    await fixtures?.cleanUp();
  });

  it('should throw when scenario is not found ', async () => {
    const input = fixtures.GivenAExportConfigScenarioExportJob();
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenASceanarioExistErrorShouldBeThrown();
  });
  it('should save file succesfully when scenario is found', async () => {
    const input = fixtures.GivenAExportConfigScenarioExportJob();
    await fixtures.GivenScenarioExist();
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenExportConfigScenarioFileIsSaved();
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
    providers: [ExportConfigScenarioPieceExporter],
  }).compile();

  await sandbox.init();
  sandbox.useLogger(new FakeLogger());

  const projectId = v4();
  const scenarioId = v4();
  const organizationId = v4();
  const exportId = v4();
  const sut = sandbox.get(ExportConfigScenarioPieceExporter);
  const apiEntityManager: EntityManager = sandbox.get(
    getEntityManagerToken(geoprocessingConnections.apiDB),
  );
  const fileRepository = sandbox.get(CloningFilesRepository);
  const expectedContent: ScenarioExportConfigContent = {
    name: `test scenario - ${scenarioId}`,
    version: exportVersion,
    projectId,
    resourceKind: ResourceKind.Scenario,
    resourceId: scenarioId,
    exportId,
    pieces: [ClonePiece.ScenarioMetadata, ClonePiece.ExportConfig],
  };

  return {
    cleanUp: async () => {
      return DeleteProjectAndOrganization(
        apiEntityManager,
        projectId,
        organizationId,
      );
    },
    GivenAExportConfigScenarioExportJob: (): ExportJobInput => {
      return {
        allPieces: [
          { resourceId: scenarioId, piece: ClonePiece.ScenarioMetadata },
          { resourceId: scenarioId, piece: ClonePiece.ExportConfig },
        ],
        componentId: v4(),
        exportId,
        piece: ClonePiece.ExportConfig,
        resourceId: scenarioId,
        resourceKind: ResourceKind.Scenario,
      };
    },
    GivenScenarioExist: async () => {
      return GivenScenarioExists(
        apiEntityManager,
        scenarioId,
        projectId,
        organizationId,
      );
    },
    WhenPieceExporterIsInvoked: (input: ExportJobInput) => {
      return {
        ThenASceanarioExistErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(/Scenario with ID/gi);
        },
        ThenExportConfigScenarioFileIsSaved: async () => {
          const result = await sut.run(input);
          const file = await fileRepository.get(result.uris[0].uri);
          expect((file as Right<Readable>).right).toBeDefined();
          if (isLeft(file)) throw new Error();
          const savedStrem = file.right;
          const content = await readSavedFile<ScenarioExportConfigContent>(
            savedStrem,
          );
          expect(content).toMatchObject(expectedContent);
        },
      };
    },
  };
};
