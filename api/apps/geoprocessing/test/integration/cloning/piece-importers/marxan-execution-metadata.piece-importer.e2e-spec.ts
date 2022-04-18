import { MarxanExecutionMetadataPieceImporter } from '@marxan-geoprocessing/import/pieces-importers/marxan-execution-metadata.piece-importer';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ImportJobInput } from '@marxan/cloning';
import {
  ArchiveLocation,
  ClonePiece,
  ResourceKind,
} from '@marxan/cloning/domain';
import { ClonePieceUrisResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import {
  getMarxanExecutionMetadataFolderRelativePath,
  MarxanExecutionMetadataContent,
  MarxanExecutionMetadataFolderType,
} from '@marxan/cloning/infrastructure/clone-piece-data/marxan-execution-metadata';
import {
  CloningFilesRepository,
  CloningFileSRepositoryModule,
} from '@marxan/cloning-files-repository';
import { MarxanExecutionMetadataGeoEntity } from '@marxan/marxan-output';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import * as archiver from 'archiver';
import { isLeft } from 'fp-ts/lib/Either';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

type MetadataFolder = {
  id: string;
  buffer: Buffer;
  type: MarxanExecutionMetadataFolderType;
};

let fixtures: FixtureType<typeof getFixtures>;

describe(MarxanExecutionMetadataPieceImporter, () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 10_000);

  afterEach(async () => {
    await fixtures?.cleanUp();
  });

  it('fails when marxan execution metadata file uri is missing in uris array', async () => {
    const input = fixtures.GivenJobInputWithoutUris();
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenAnUrisArrayErrorShouldBeThrown();
  });

  it('fails when the file cannot be retrieved from file repo', async () => {
    const resourceKind = ResourceKind.Project;
    const archiveLocation = fixtures.GivenNoMarxanExecutionMetadataFileIsAvailable();
    const input = fixtures.GivenJobInput(archiveLocation, resourceKind);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenADataNotAvailableErrorShouldBeThrown();
  });

  it(`fails if zip file doesn't contain marxan execution metadata folder`, async () => {
    const resourceKind = ResourceKind.Project;
    await fixtures.GivenWrongMarxanExecutionMetadata();
    const archiveLocation = await fixtures.GivenMarxanExecutionMetadataFile(
      resourceKind,
    );
    const input = fixtures.GivenJobInput(archiveLocation, resourceKind);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenAFolderExtractionErrorShouldBeThrown();
  });

  it('imports marxan execution metadata in a scenario import', async () => {
    const resourceKind = ResourceKind.Scenario;
    await fixtures.GivenMarxanExecutionMetadata();
    const archiveLocation = await fixtures.GivenMarxanExecutionMetadataFile(
      resourceKind,
    );
    const input = fixtures.GivenJobInput(archiveLocation, resourceKind);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenMarxanExecutionMetadataShouldBeImported();
  });

  it('imports marxan execution metadata in a project import', async () => {
    const resourceKind = ResourceKind.Project;
    await fixtures.GivenMarxanExecutionMetadata();
    const archiveLocation = await fixtures.GivenMarxanExecutionMetadataFile(
      resourceKind,
    );
    const input = fixtures.GivenJobInput(archiveLocation, resourceKind);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenMarxanExecutionMetadataShouldBeImported();
  });
});

const getFixtures = async () => {
  const sandbox = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        ...geoprocessingConnections.default,
        keepConnectionAlive: true,
        logging: false,
      }),
      TypeOrmModule.forFeature([MarxanExecutionMetadataGeoEntity]),
      CloningFileSRepositoryModule,
    ],
    providers: [
      MarxanExecutionMetadataPieceImporter,
      { provide: Logger, useValue: { error: () => {}, setContext: () => {} } },
    ],
  }).compile();

  await sandbox.init();
  const scenarioId = v4();
  const projectId = v4();
  const oldScenarioId = v4();
  const userId = v4();

  const sut = sandbox.get(MarxanExecutionMetadataPieceImporter);
  const fileRepository = sandbox.get(CloningFilesRepository);
  const marxanExecutionMetadataRepo = sandbox.get<
    Repository<MarxanExecutionMetadataGeoEntity>
  >(getRepositoryToken(MarxanExecutionMetadataGeoEntity));

  const amountOfMarxanRuns = 5;

  const marxanExecutionMetadataFileContent: MarxanExecutionMetadataContent = {
    marxanExecutionMetadata: [],
  };
  const metadataFolders: MetadataFolder[] = [];
  const expectedStdOutput = 'Success!';
  const expectedStdError = 'none';
  const expectedFailedValue = false;
  const expectedInputBufferText = 'input';
  const expectedOutputBufferText = 'output';

  return {
    cleanUp: async () => {
      await marxanExecutionMetadataRepo.delete({ scenarioId });
    },
    GivenMarxanExecutionMetadata: async () => {
      const metadataList = Array(amountOfMarxanRuns)
        .fill('')
        .map(() => ({
          id: v4(),
          includesOutputFolder: true,
          failed: expectedFailedValue,
          stdOutput: expectedStdOutput,
          stdError: expectedStdError,
        }));

      marxanExecutionMetadataFileContent.marxanExecutionMetadata = metadataList;

      metadataFolders.push(
        ...metadataList.flatMap(({ id }) => [
          {
            id,
            type: 'input' as MarxanExecutionMetadataFolderType,
            buffer: Buffer.from(expectedInputBufferText),
          },
          {
            id,
            type: 'output' as MarxanExecutionMetadataFolderType,
            buffer: Buffer.from(expectedOutputBufferText),
          },
        ]),
      );
    },
    GivenWrongMarxanExecutionMetadata: async () => {
      const metadataList = Array(amountOfMarxanRuns)
        .fill('')
        .map(() => ({
          id: v4(),
          includesOutputFolder: true,
          failed: false,
          stdOutput: 'Success!!!',
        }));

      marxanExecutionMetadataFileContent.marxanExecutionMetadata = metadataList;

      metadataFolders.push(
        ...metadataList.slice(1 - metadataList.length).flatMap(({ id }) => [
          {
            id,
            type: 'input' as MarxanExecutionMetadataFolderType,
            buffer: Buffer.from('input'),
          },
          {
            id,
            type: 'output' as MarxanExecutionMetadataFolderType,
            buffer: Buffer.from('output'),
          },
        ]),
      );
    },
    GivenJobInput: (
      archiveLocation: ArchiveLocation,
      resourceKind: ResourceKind,
    ): ImportJobInput => {
      const [
        uri,
      ] = ClonePieceUrisResolver.resolveFor(
        ClonePiece.MarxanExecutionMetadata,
        archiveLocation.value,
        { kind: resourceKind, scenarioId: oldScenarioId },
      );

      return {
        componentId: v4(),
        pieceResourceId: scenarioId,
        importId: v4(),
        projectId,
        piece: ClonePiece.MarxanExecutionMetadata,
        resourceKind,
        uris: [uri.toSnapshot()],
        ownerId: userId,
      };
    },
    GivenJobInputWithoutUris: (): ImportJobInput => {
      return {
        componentId: v4(),
        pieceResourceId: scenarioId,
        importId: v4(),
        projectId,
        piece: ClonePiece.MarxanExecutionMetadata,
        resourceKind: ResourceKind.Project,
        uris: [],
        ownerId: userId,
      };
    },
    GivenNoMarxanExecutionMetadataFileIsAvailable: () => {
      return new ArchiveLocation('invalid uri');
    },
    GivenMarxanExecutionMetadataFile: async (resourceKind: ResourceKind) => {
      const [
        { relativePath },
      ] = ClonePieceUrisResolver.resolveFor(
        ClonePiece.MarxanExecutionMetadata,
        'marxan execution metadata file relative path',
        { kind: resourceKind, scenarioId: oldScenarioId },
      );

      const archive = archiver(`zip`, {
        zlib: { level: 9 },
      });
      archive.append(JSON.stringify(marxanExecutionMetadataFileContent), {
        name: relativePath,
      });

      metadataFolders.forEach(({ buffer, id, type }) => {
        archive.append(buffer, {
          name: getMarxanExecutionMetadataFolderRelativePath(
            id,
            type,
            relativePath,
          ),
        });
      });

      const saveFile = fileRepository.save(archive);
      archive.finalize();
      const uriOrError = await saveFile;

      if (isLeft(uriOrError)) throw new Error("couldn't save file");
      return new ArchiveLocation(uriOrError.right);
    },
    WhenPieceImporterIsInvoked: (input: ImportJobInput) => {
      return {
        ThenAnUrisArrayErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(/uris/gi);
        },
        ThenADataNotAvailableErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(
            /Export file is not available at/gi,
          );
        },
        ThenAMissingPlanningUnitsErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(
            /missing planning units/gi,
          );
        },
        ThenAFolderExtractionErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(
            /error extracting.*folder of execution metadata/gi,
          );
        },
        ThenMarxanExecutionMetadataShouldBeImported: async () => {
          await sut.run(input);

          const importedData = await marxanExecutionMetadataRepo.find({
            where: { scenarioId },
          });

          expect(importedData).toHaveLength(amountOfMarxanRuns);

          const [executionMetadata] = importedData;

          expect(executionMetadata.inputZip.toString()).toEqual(
            expectedInputBufferText,
          );
          expect(executionMetadata.outputZip!.toString()).toEqual(
            expectedOutputBufferText,
          );
          expect(executionMetadata.failed).toEqual(expectedFailedValue);
          expect(executionMetadata.stdOutput).toEqual(expectedStdOutput);
          expect(executionMetadata.stdError).toEqual(expectedStdError);
        },
      };
    },
  };
};
