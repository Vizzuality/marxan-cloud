import { MarxanExecutionMetadataPieceImporter } from '@marxan-geoprocessing/import/pieces-importers/marxan-execution-metadata.piece-importer';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ImportJobInput } from '@marxan/cloning';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import {
  ArchiveLocation,
  ClonePiece,
  ComponentLocation,
  ResourceKind,
} from '@marxan/cloning/domain';
import { ClonePieceRelativePathResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import {
  getMarxanExecutionMetadataFolderRelativePath,
  MarxanExecutionMetadataContent,
  MarxanExecutionMetadataFolderType,
  marxanExecutionMetadataRelativePath,
} from '@marxan/cloning/infrastructure/clone-piece-data/marxan-execution-metadata';
import { MarxanExecutionMetadataGeoEntity } from '@marxan/marxan-output';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Test } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { isLeft, isRight } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';
import { GeoCloningFilesRepositoryModule } from '@marxan-geoprocessing/modules/cloning-files-repository';
import { FakeLogger } from '@marxan-geoprocessing/utils/__mocks__/fake-logger';

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

  it('fails when marxan execution metadata file cannot be retrieved from file repo', async () => {
    const resourceKind = ResourceKind.Project;
    await fixtures.GivenMarxanExecutionMetadata();
    const input = fixtures.GivenJobInput(
      new ComponentLocation('wrong uri', marxanExecutionMetadataRelativePath),
      [],
      resourceKind,
    );
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenADataNotAvailableErrorShouldBeThrown();
  });

  it('fails if marxan execution metadata folder relative path is invalid', async () => {
    const resourceKind = ResourceKind.Project;
    await fixtures.GivenMarxanExecutionMetadata();
    const { jsonUri, folderUris } =
      await fixtures.GivenMarxanExecutionMetadataFiles(resourceKind);
    const input =
      fixtures.GivenJobInputWithInvalidMarxanExecutionMetadataFolderRelativePath(
        jsonUri,
        folderUris,
        resourceKind,
      );
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenAnInvalidMarxanExecutionMetadataFolderRelativePathErrorShouldBeThrown();
  });

  it(`fails if file repo doesn't contain marxan execution metadata folder`, async () => {
    const resourceKind = ResourceKind.Project;
    await fixtures.GivenIncompleteMarxanExecutionMetadata();
    const { jsonUri } =
      await fixtures.GivenMarxanExecutionMetadataFiles(resourceKind);
    const invalidComponentLocation = new ComponentLocation(
      'invalid/uri.zip',
      getMarxanExecutionMetadataFolderRelativePath(
        v4(),
        'input',
        marxanExecutionMetadataRelativePath,
      ),
    );
    const input = fixtures.GivenJobInput(
      jsonUri,
      [invalidComponentLocation],
      resourceKind,
    );
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenAnErrorShouldBeThrownWhileTryingToGetMetadataFolderFromFileRepo();
  });

  // See notes in MarxanExecutionMetadataPieceImporter.run() - remove skip here
  // if removing the temporary filter in the run() method.
  it.skip(`fails if marxan execution metadata input folder uri is not contained in uris array`, async () => {
    const resourceKind = ResourceKind.Project;
    await fixtures.GivenMarxanExecutionMetadata();
    const { folderUris, jsonUri } =
      await fixtures.GivenMarxanExecutionMetadataFiles(resourceKind);
    const input = fixtures.GivenJobInputWithoutFolderUris(
      jsonUri,
      folderUris,
      resourceKind,
      'input',
    );
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenAMissingInputFolderUriErrorShouldBeThrown();
  });

  // See notes in MarxanExecutionMetadataPieceImporter.run() - remove skip here
  // if removing the temporary filter in the run() method.
  it.skip(`fails if marxan execution metadata output folder uri is not contained in uris array`, async () => {
    const resourceKind = ResourceKind.Project;
    await fixtures.GivenMarxanExecutionMetadata();
    const { folderUris, jsonUri } =
      await fixtures.GivenMarxanExecutionMetadataFiles(resourceKind);
    const input = fixtures.GivenJobInputWithoutFolderUris(
      jsonUri,
      folderUris,
      resourceKind,
      'output',
    );
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenAMissingOutputFolderUriErrorShouldBeThrown();
  });

  it('imports marxan execution metadata in a scenario import', async () => {
    const resourceKind = ResourceKind.Scenario;
    await fixtures.GivenMarxanExecutionMetadata();
    const { jsonUri, folderUris } =
      await fixtures.GivenMarxanExecutionMetadataFiles(resourceKind);
    const input = fixtures.GivenJobInput(jsonUri, folderUris, resourceKind);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenMarxanExecutionMetadataShouldBeImported();
  });

  it('imports marxan execution metadata in a project import', async () => {
    const resourceKind = ResourceKind.Project;
    await fixtures.GivenMarxanExecutionMetadata();
    const { jsonUri, folderUris } =
      await fixtures.GivenMarxanExecutionMetadataFiles(resourceKind);
    const input = fixtures.GivenJobInput(jsonUri, folderUris, resourceKind);
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
      GeoCloningFilesRepositoryModule,
    ],
    providers: [MarxanExecutionMetadataPieceImporter],
  }).compile();

  await sandbox.init();
  sandbox.useLogger(new FakeLogger());

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
    GivenIncompleteMarxanExecutionMetadata: async () => {
      const metadataList = Array(amountOfMarxanRuns)
        .fill('')
        .map(() => ({
          id: v4(),
          includesOutputFolder: true,
          failed: false,
          stdOutput: '',
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
      jsonLocation: ComponentLocation,
      folderLocations: ComponentLocation[],
      resourceKind: ResourceKind,
    ): ImportJobInput => {
      return {
        componentId: v4(),
        pieceResourceId: scenarioId,
        importId: v4(),
        projectId,
        piece: ClonePiece.MarxanExecutionMetadata,
        resourceKind,
        uris: [jsonLocation, ...folderLocations],
        ownerId: userId,
      };
    },
    GivenJobInputWithInvalidMarxanExecutionMetadataFolderRelativePath: (
      jsonLocation: ComponentLocation,
      folderLocations: ComponentLocation[],
      resourceKind: ResourceKind,
    ): ImportJobInput => {
      folderLocations[0] = ComponentLocation.fromSnapshot({
        relativePath: 'invalid/relative/path/folder.zip',
        uri: '/tmp/invalid/uri/folder.zip',
      });

      return {
        componentId: v4(),
        pieceResourceId: scenarioId,
        importId: v4(),
        projectId,
        piece: ClonePiece.MarxanExecutionMetadata,
        resourceKind,
        uris: [jsonLocation, ...folderLocations],
        ownerId: userId,
      };
    },
    GivenJobInputWithoutFolderUris: (
      jsonLocation: ComponentLocation,
      folderLocations: ComponentLocation[],
      resourceKind: ResourceKind,
      typeToRemove: MarxanExecutionMetadataFolderType,
    ): ImportJobInput => {
      return {
        componentId: v4(),
        pieceResourceId: scenarioId,
        importId: v4(),
        projectId,
        piece: ClonePiece.MarxanExecutionMetadata,
        resourceKind,
        uris: [
          jsonLocation,
          ...folderLocations.filter(
            (location) => !location.relativePath.includes(typeToRemove),
          ),
        ],
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
    GivenMarxanExecutionMetadataFiles: async (resourceKind: ResourceKind) => {
      const relativePath = ClonePieceRelativePathResolver.resolveFor(
        ClonePiece.MarxanExecutionMetadata,
        { kind: resourceKind, scenarioId: oldScenarioId },
      );
      const exportId = v4();

      const folderUris = await Promise.all(
        metadataFolders.map(async ({ buffer, id, type }) => {
          const folderRelativePath =
            getMarxanExecutionMetadataFolderRelativePath(
              id,
              type,
              relativePath,
            );

          const uri = await fileRepository.saveCloningFile(
            exportId,
            Readable.from(buffer),
            folderRelativePath,
          );

          if (isLeft(uri)) {
            throw new Error('Error saving zip file');
          }

          return new ComponentLocation(uri.right, folderRelativePath);
        }),
      );

      const uriOrError = await fileRepository.saveCloningFile(
        exportId,
        Readable.from(JSON.stringify(marxanExecutionMetadataFileContent)),
        relativePath,
      );

      if (isLeft(uriOrError)) throw new Error("couldn't save json file");

      return {
        jsonUri: new ComponentLocation(uriOrError.right, relativePath),
        folderUris,
      };
    },
    WhenPieceImporterIsInvoked: (input: ImportJobInput) => {
      return {
        ThenAnUrisArrayErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(
            /uris array does not contain/gi,
          );
        },
        ThenADataNotAvailableErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(
            /file with piece data.*not available/gi,
          );
        },
        ThenAnInvalidMarxanExecutionMetadataFolderRelativePathErrorShouldBeThrown:
          async () => {
            await expect(sut.run(input)).rejects.toThrow(
              /invalid marxan execution metadata folder relative path/gi,
            );
          },
        ThenAnErrorShouldBeThrownWhileTryingToGetMetadataFolderFromFileRepo:
          async () => {
            await expect(sut.run(input)).rejects.toThrow(
              /error obtaining.*folder metadata/gi,
            );
          },
        ThenAMissingInputFolderUriErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(
            /uris array doesn't contain uri for metadata input folder/gi,
          );
        },
        ThenAMissingOutputFolderUriErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(
            /uris array doesn't contain uri for metadata output folder/gi,
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
