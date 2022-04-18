import { MarxanExecutionMetadataPieceExporter } from '@marxan-geoprocessing/export/pieces-exporters/marxan-execution-metadata.piece-exporter';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import { MarxanExecutionMetadataContent } from '@marxan/cloning/infrastructure/clone-piece-data/marxan-execution-metadata';
import {
  CloningFilesRepository,
  CloningFileSRepositoryModule,
} from '@marxan/cloning-files-repository';
import { MarxanExecutionMetadataGeoEntity } from '@marxan/marxan-output';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getEntityManagerToken, TypeOrmModule } from '@nestjs/typeorm';
import { isLeft, Right } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';
import {
  DeleteMarxanExecutionMetadata,
  GivenMarxanExecutionMetadata,
  readSavedFile,
} from '../fixtures';

let fixtures: FixtureType<typeof getFixtures>;

describe(MarxanExecutionMetadataPieceExporter, () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 10_000);

  afterEach(async () => {
    await fixtures?.cleanUp();
  });

  it('should save empty marxan execution metadata file', async () => {
    const input = fixtures.GivenAMarxanExecutionMetadataExportJob();
    await fixtures.GivenNoMarxanExecutionMetadata();
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenAnEmptyMarxanExecutionMetadataFileIsSaved();
  });

  it('should save succesfully marxan execution metadata', async () => {
    const input = fixtures.GivenAMarxanExecutionMetadataExportJob();
    await fixtures.GivenMarxanExecutionMetadata();
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenAMarxanExecutionMetadataFileIsSaved();
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
      TypeOrmModule.forRoot({
        ...geoprocessingConnections.default,
        keepConnectionAlive: true,
        logging: false,
      }),
      TypeOrmModule.forFeature([MarxanExecutionMetadataGeoEntity]),
      CloningFileSRepositoryModule,
    ],
    providers: [
      MarxanExecutionMetadataPieceExporter,
      { provide: Logger, useValue: { error: () => {}, setContext: () => {} } },
    ],
  }).compile();

  await sandbox.init();
  const projectId = v4();
  const scenarioId = v4();

  const sut = sandbox.get(MarxanExecutionMetadataPieceExporter);
  const geoEntityManager: EntityManager = sandbox.get(
    getEntityManagerToken(geoprocessingConnections.default),
  );
  const fileRepository = sandbox.get(CloningFilesRepository);
  const amountOfMarxanRuns = 3;

  return {
    cleanUp: async () => {
      return DeleteMarxanExecutionMetadata(geoEntityManager, scenarioId);
    },
    GivenNoMarxanExecutionMetadata: async (): Promise<void> => {},
    GivenAMarxanExecutionMetadataExportJob: (): ExportJobInput => {
      return {
        allPieces: [
          { resourceId: projectId, piece: ClonePiece.ProjectMetadata },
          {
            resourceId: scenarioId,
            piece: ClonePiece.MarxanExecutionMetadata,
          },
        ],
        componentId: v4(),
        exportId: v4(),
        piece: ClonePiece.MarxanExecutionMetadata,
        resourceId: scenarioId,
        resourceKind: ResourceKind.Project,
        isCloning: false,
      };
    },
    GivenMarxanExecutionMetadata: () =>
      GivenMarxanExecutionMetadata(
        geoEntityManager,
        scenarioId,
        amountOfMarxanRuns,
      ),
    WhenPieceExporterIsInvoked: (input: ExportJobInput) => {
      return {
        ThenAnEmptyMarxanExecutionMetadataFileIsSaved: async () => {
          const result = await sut.run(input);
          const file = await fileRepository.get(result.uris[0].uri);
          expect((file as Right<Readable>).right).toBeDefined();
          if (isLeft(file)) throw new Error();
          const savedStream = file.right;
          const content = await readSavedFile(savedStream);
          const emptyFile: MarxanExecutionMetadataContent = {
            marxanExecutionMetadata: [],
          };
          expect(content).toEqual(emptyFile);
        },
        ThenAMarxanExecutionMetadataFileIsSaved: async () => {
          const result = await sut.run(input);
          const file = await fileRepository.get(result.uris[0].uri);
          expect((file as Right<Readable>).right).toBeDefined();
          if (isLeft(file)) throw new Error();
          const savedStream = file.right;
          const content = await readSavedFile<MarxanExecutionMetadataContent>(
            savedStream,
          );
          expect(content.marxanExecutionMetadata).toHaveLength(
            amountOfMarxanRuns,
          );

          expect(result.uris).toHaveLength(1 + amountOfMarxanRuns * 2);
        },
      };
    },
  };
};
