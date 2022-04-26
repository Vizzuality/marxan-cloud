import { ProjectMetadataPieceImporter } from '@marxan-geoprocessing/import/pieces-importers/project-metadata.piece-importer';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ImportJobInput } from '@marxan/cloning';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import {
  ArchiveLocation,
  ClonePiece,
  ResourceKind,
} from '@marxan/cloning/domain';
import { ClonePieceRelativePathResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import { ProjectMetadataContent } from '@marxan/cloning/infrastructure/clone-piece-data/project-metadata';
import { PlanningUnitGridShape } from '@marxan/scenarios-planning-unit';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getEntityManagerToken, TypeOrmModule } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';
import {
  DeleteProjectAndOrganization,
  GivenOrganizationExists,
  GivenProjectExists,
  GivenUserExists,
} from '../fixtures';
import { GeoCloningFilesRepositoryModule } from '@marxan-geoprocessing/modules/cloning-files-repository';

interface ProjectSelectResult {
  name: string;
  description: string;
  planning_unit_grid_shape: PlanningUnitGridShape;
}

let fixtures: FixtureType<typeof getFixtures>;

describe(ProjectMetadataPieceImporter, () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 10_000);

  afterEach(async () => {
    await fixtures?.cleanUp();
  });

  it('fails when project metadata file uri is missing in uris array', async () => {
    const input = fixtures.GivenJobInputWithoutUris();
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenAnUrisArrayErrorShouldBeThrown();
  });

  it('fails when the file cannot be retrieved from file repo', async () => {
    const archiveLocation = fixtures.GivenNoProjectMetadataFileIsAvailable();
    const input = fixtures.GivenJobInput(archiveLocation);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenADataNotAvailableErrorShouldBeThrown();
  });

  it('imports project metadata creating a new project (isolated import process)', async () => {
    // Piece importer picks a random organization
    await fixtures.GivenOrganization();
    await fixtures.GivenUser();

    const archiveLocation = await fixtures.GivenValidProjectMetadataFile();
    const input = fixtures.GivenJobInput(archiveLocation);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenProjectMetadataShouldBeImported();
  });

  it('imports project metadata updating a existing project (cloning import process)', async () => {
    await fixtures.GivenUser();
    await fixtures.GivenProject();

    const archiveLocation = await fixtures.GivenValidProjectMetadataFile();
    const input = fixtures.GivenJobInput(archiveLocation);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenProjectMetadataShouldBeImported();
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
      ProjectMetadataPieceImporter,
      { provide: Logger, useValue: { error: () => {}, setContext: () => {} } },
    ],
  }).compile();

  await sandbox.init();
  const projectId = v4();
  const organizationId = v4();
  const userId = v4();

  const sut = sandbox.get(ProjectMetadataPieceImporter);
  const fileRepository = sandbox.get(CloningFilesRepository);

  const entityManager = sandbox.get<EntityManager>(
    getEntityManagerToken(geoprocessingConnections.apiDB.name),
  );

  const validProjectMetadataFileContent: ProjectMetadataContent = {
    name: `test project - ${projectId}`,
    description: 'project description',
    planningUnitGridShape: PlanningUnitGridShape.Hexagon,
  };

  return {
    cleanUp: async () => {
      await DeleteProjectAndOrganization(
        entityManager,
        projectId,
        organizationId,
      );
    },
    GivenJobInput: (archiveLocation: ArchiveLocation): ImportJobInput => {
      const relativePath = ClonePieceRelativePathResolver.resolveFor(
        ClonePiece.ProjectMetadata,
      );
      return {
        componentId: v4(),
        pieceResourceId: v4(),
        importId: v4(),
        projectId,
        piece: ClonePiece.ProjectMetadata,
        resourceKind: ResourceKind.Project,
        uris: [{ relativePath, uri: archiveLocation.value }],
        ownerId: userId,
      };
    },
    GivenUser: () => GivenUserExists(entityManager, userId, projectId),
    GivenOrganization: () => {
      return GivenOrganizationExists(entityManager, organizationId);
    },
    GivenProject: () => {
      return GivenProjectExists(entityManager, projectId, organizationId);
    },
    GivenJobInputWithoutUris: (): ImportJobInput => {
      return {
        componentId: v4(),
        pieceResourceId: v4(),
        importId: v4(),
        projectId,
        piece: ClonePiece.ProjectMetadata,
        resourceKind: ResourceKind.Project,
        uris: [],
        ownerId: userId,
      };
    },
    GivenNoProjectMetadataFileIsAvailable: () => {
      return new ArchiveLocation('not found');
    },
    GivenValidProjectMetadataFile: async () => {
      const exportId = v4();
      const relativePath = ClonePieceRelativePathResolver.resolveFor(
        ClonePiece.ProjectMetadata,
      );

      const uriOrError = await fileRepository.saveCloningFile(
        exportId,
        Readable.from(JSON.stringify(validProjectMetadataFileContent)),
        relativePath,
      );

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
            /File with piece data for/gi,
          );
        },
        ThenProjectMetadataShouldBeImported: async () => {
          await sut.run(input);

          const [project]: [
            ProjectSelectResult,
          ] = await entityManager
            .createQueryBuilder()
            .select()
            .from('projects', 'p')
            .where('id = :projectId', { projectId })
            .execute();

          expect(project.name).toEqual(validProjectMetadataFileContent.name);
          expect(project.description).toEqual(
            validProjectMetadataFileContent.description,
          );
          expect(project.planning_unit_grid_shape).toEqual(
            validProjectMetadataFileContent.planningUnitGridShape,
          );
        },
      };
    },
  };
};
