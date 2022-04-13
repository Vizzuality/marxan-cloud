import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import { FileRepository, FileRepositoryModule } from '@marxan/files-repository';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getEntityManagerToken, TypeOrmModule } from '@nestjs/typeorm';
import { isLeft, Right } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';
import {
  exportVersion,
  ProjectExportConfigContent,
} from '@marxan/cloning/infrastructure/clone-piece-data/export-config';
import { ExportConfigProjectPieceExporter } from '@marxan-geoprocessing/export/pieces-exporters/export-config.project-piece-exporter';
import {
  DeleteProjectAndOrganization,
  GivenProjectExists,
  GivenScenarioExists,
  readSavedFile,
} from '../fixtures';

let fixtures: FixtureType<typeof getFixtures>;

interface FixtureOptions {
  projectWithScenario: boolean;
}

const defaultFixtureOptions: FixtureOptions = {
  projectWithScenario: false,
};

describe(ExportConfigProjectPieceExporter, () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 10_000);

  afterEach(async () => {
    await fixtures?.cleanUp();
  });

  it('should throw when project is not found ', async () => {
    const input = fixtures.GivenAExportConfigProjectExportJob();
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenAProjectExistErrorShouldBeThrown();
  });
  it('should save file succesfully when project is found', async () => {
    const input = fixtures.GivenAExportConfigProjectExportJob();
    await fixtures.GivenProjectExist();

    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenExportConfigProjectFileIsSaved();
  });
  it('should save file succesfully when project with a scenario is found', async () => {
    const options = { projectWithScenario: true };
    const input = fixtures.GivenAExportConfigProjectExportJob(options);
    await fixtures.GivenProjectExist(options);
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenExportConfigProjectFileIsSaved(options);
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
      FileRepositoryModule,
    ],
    providers: [
      ExportConfigProjectPieceExporter,
      { provide: Logger, useValue: { error: () => {}, setContext: () => {} } },
    ],
  }).compile();

  await sandbox.init();
  const projectId = v4();
  const scenarioId = v4();
  const organizationId = v4();
  const sut = sandbox.get(ExportConfigProjectPieceExporter);
  const apiEntityManager: EntityManager = sandbox.get(
    getEntityManagerToken(geoprocessingConnections.apiDB),
  );
  const fileRepository = sandbox.get(FileRepository);

  const getExpectedContent = (
    options: FixtureOptions,
  ): ProjectExportConfigContent => {
    let scenarios: Record<string, ClonePiece[]> = {};
    if (options.projectWithScenario)
      scenarios[scenarioId] = [ClonePiece.ScenarioMetadata];
    return {
      name: `test project - ${projectId}`,
      version: exportVersion,
      resourceKind: ResourceKind.Project,
      resourceId: projectId,
      scenarios: options.projectWithScenario
        ? [{ id: scenarioId, name: `test scenario - ${scenarioId}` }]
        : [],
      pieces: {
        project: [ClonePiece.ProjectMetadata, ClonePiece.ExportConfig],
        scenarios,
      },
      isCloning: false,
    };
  };

  return {
    cleanUp: async () => {
      return DeleteProjectAndOrganization(
        apiEntityManager,
        projectId,
        organizationId,
      );
    },
    GivenAExportConfigProjectExportJob: (
      options = defaultFixtureOptions,
    ): ExportJobInput => {
      const scenarioPiece = options.projectWithScenario
        ? [{ resourceId: scenarioId, piece: ClonePiece.ScenarioMetadata }]
        : [];
      return {
        allPieces: [
          { resourceId: projectId, piece: ClonePiece.ProjectMetadata },
          { resourceId: projectId, piece: ClonePiece.ExportConfig },
          ...scenarioPiece,
        ],
        componentId: v4(),
        exportId: v4(),
        piece: ClonePiece.ExportConfig,
        resourceId: projectId,
        resourceKind: ResourceKind.Project,
        isCloning: false,
      };
    },
    GivenProjectExist: async (options = defaultFixtureOptions) => {
      if (!options.projectWithScenario)
        return GivenProjectExists(apiEntityManager, projectId, organizationId);

      return GivenScenarioExists(
        apiEntityManager,
        scenarioId,
        projectId,
        organizationId,
      );
    },
    WhenPieceExporterIsInvoked: (input: ExportJobInput) => {
      return {
        ThenAProjectExistErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(/Project with ID/gi);
        },
        ThenExportConfigProjectFileIsSaved: async (
          options = defaultFixtureOptions,
        ) => {
          const result = await sut.run(input);
          const file = await fileRepository.get(result.uris[0].uri);
          expect((file as Right<Readable>).right).toBeDefined();
          const expectedContent = getExpectedContent(options);
          if (isLeft(file)) throw new Error();
          const savedStrem = file.right;
          const content = await readSavedFile<ProjectExportConfigContent>(
            savedStrem,
          );
          expect(content).toMatchObject(expectedContent);
        },
      };
    },
  };
};
