import { ProjectCustomProtectedAreasPieceImporter } from '@marxan-geoprocessing/import/pieces-importers/project-custom-protected-areas.piece-importer';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ImportJobInput } from '@marxan/cloning';
import {
  ArchiveLocation,
  ClonePiece,
  ResourceKind,
} from '@marxan/cloning/domain';
import { ClonePieceUrisResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import { ProjectCustomProtectedAreasContent } from '@marxan/cloning/infrastructure/clone-piece-data/project-custom-protected-areas';
import { FileRepository, FileRepositoryModule } from '@marxan/files-repository';
import { ProtectedArea } from '@marxan/protected-areas';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  getEntityManagerToken,
  getRepositoryToken,
  TypeOrmModule,
} from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { v4 } from 'uuid';
import { GenerateRandomGeometries, PrepareZipFile } from './fixtures';

let fixtures: FixtureType<typeof getFixtures>;

describe(ProjectCustomProtectedAreasPieceImporter, () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 10_000);

  afterEach(async () => {
    await fixtures?.cleanUp();
  });

  it('fails when project custom protected areas file uri is missing in uris array', async () => {
    const input = fixtures.GivenJobInputWithoutUris();
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenAnUrisArrayErrorShouldBeThrown();
  });

  it('fails when the file cannot be retrieved from file repo', async () => {
    const archiveLocation = fixtures.GivenNoProjectCustomProtectedAreasFileIsAvailable();
    const input = fixtures.GivenJobInput(archiveLocation);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenADataNotAvailableErrorShouldBeThrown();
  });

  it('imports project custom protected areas', async () => {
    const archiveLocation = await fixtures.GivenValidProjectCustomProtectedAreasFile();
    const input = fixtures.GivenJobInput(archiveLocation);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenCustomProtectedAreasShouldBeAddedToProject();
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
      TypeOrmModule.forFeature([ProtectedArea]),
      FileRepositoryModule,
    ],
    providers: [
      ProjectCustomProtectedAreasPieceImporter,
      { provide: Logger, useValue: { error: () => {}, setContext: () => {} } },
    ],
  }).compile();

  await sandbox.init();
  const projectId = v4();

  const entityManager = sandbox.get<EntityManager>(getEntityManagerToken());
  const protectedAreasRepo = sandbox.get<Repository<ProtectedArea>>(
    getRepositoryToken(ProtectedArea, geoprocessingConnections.default.name),
  );

  const sut = sandbox.get(ProjectCustomProtectedAreasPieceImporter);
  const fileRepository = sandbox.get(FileRepository);

  let validProjectCustomProtectedAreasFile: ProjectCustomProtectedAreasContent[];

  return {
    cleanUp: async () => {
      await protectedAreasRepo.delete({ projectId });
    },
    GivenJobInput: (archiveLocation: ArchiveLocation): ImportJobInput => {
      const [uri] = ClonePieceUrisResolver.resolveFor(
        ClonePiece.ProjectCustomProtectedAreas,
        archiveLocation.value,
      );
      return {
        componentId: v4(),
        pieceResourceId: v4(),
        importId: v4(),
        projectId,
        piece: ClonePiece.ProjectCustomProtectedAreas,
        resourceKind: ResourceKind.Project,
        uris: [uri.toSnapshot()],
      };
    },
    GivenJobInputWithoutUris: (): ImportJobInput => {
      return {
        componentId: v4(),
        pieceResourceId: v4(),
        importId: v4(),
        projectId,
        piece: ClonePiece.ProjectCustomProtectedAreas,
        resourceKind: ResourceKind.Project,
        uris: [],
      };
    },
    GivenNoProjectCustomProtectedAreasFileIsAvailable: () => {
      return new ArchiveLocation('not found');
    },
    GivenValidProjectCustomProtectedAreasFile: async () => {
      const [{ relativePath }] = ClonePieceUrisResolver.resolveFor(
        ClonePiece.ProjectCustomProtectedAreas,
        'project custom protected areas file relative path',
      );

      const geometries = await GenerateRandomGeometries(entityManager, 3, true);

      validProjectCustomProtectedAreasFile = geometries.map((geom, index) => ({
        ewkb: geom.toJSON().data,
        fullName: `${index}`,
      }));

      return PrepareZipFile(
        validProjectCustomProtectedAreasFile,
        fileRepository,
        relativePath,
      );
    },
    WhenPieceImporterIsInvoked: (input: ImportJobInput) => {
      return {
        ThenAnUrisArrayErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(/uris/gi);
        },
        ThenADataNotAvailableErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(
            /File with piece data for/gi,
          );
        },
        ThenCustomProtectedAreasShouldBeAddedToProject: async () => {
          await sut.run(input);

          const protectedAreas = await protectedAreasRepo.find({ projectId });

          expect(protectedAreas.length).toEqual(
            validProjectCustomProtectedAreasFile.length,
          );

          expect(protectedAreas.map((pa) => pa.fullName).sort()).toEqual(
            validProjectCustomProtectedAreasFile
              .map((pa) => pa.fullName)
              .sort(),
          );
        },
      };
    },
  };
};
