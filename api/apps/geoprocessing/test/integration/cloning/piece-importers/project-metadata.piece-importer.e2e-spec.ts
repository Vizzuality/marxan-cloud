import { ProjectMetadataPieceImporter } from '@marxan-geoprocessing/import/pieces-importers/project-metadata.piece-importer';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ImportJobInput } from '@marxan/cloning';
import {
  ArchiveLocation,
  ClonePiece,
  ResourceKind,
} from '@marxan/cloning/domain';
import { ClonePieceUrisResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import { ProjectMetadataContent } from '@marxan/cloning/infrastructure/clone-piece-data/project-metadata';
import { FileRepository, FileRepositoryModule } from '@marxan/files-repository';
import { PlanningUnitGridShape } from '@marxan/scenarios-planning-unit';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getEntityManagerToken, TypeOrmModule } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';
import {
  DeleteProjectAndOrganization,
  GivenOrganizationExists,
  GivenProjectExists,
  GivenUserExists,
  PrepareZipFile,
} from '../fixtures';

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

    const archiveLocation = await fixtures.GivenValidProjectMetadataFile({
      existingProject: false,
    });
    const input = fixtures.GivenJobInput(archiveLocation);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenProjectMetadataShouldBeImported();
  });

  it('imports project metadata updating a existing project (cloning import process)', async () => {
    await fixtures.GivenUser();
    await fixtures.GivenProject();

    const archiveLocation = await fixtures.GivenValidProjectMetadataFile({
      existingProject: true,
    });
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
      FileRepositoryModule,
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
  const fileRepository = sandbox.get(FileRepository);

  const entityManager = sandbox.get<EntityManager>(
    getEntityManagerToken(geoprocessingConnections.apiDB.name),
  );

  const validProjectMetadataFileContent: ProjectMetadataContent = {
    name: `test project - ${projectId}`,
    description: 'project description',
    planningUnitGridShape: PlanningUnitGridShape.Hexagon,
    projectAlreadyCreated: false,
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
      const [uri] = ClonePieceUrisResolver.resolveFor(
        ClonePiece.ProjectMetadata,
        archiveLocation.value,
      );
      return {
        componentId: v4(),
        pieceResourceId: v4(),
        importId: v4(),
        projectId,
        piece: ClonePiece.ProjectMetadata,
        resourceKind: ResourceKind.Project,
        uris: [uri.toSnapshot()],
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
    GivenValidProjectMetadataFile: async (
      { existingProject } = { existingProject: false },
    ) => {
      const [{ relativePath }] = ClonePieceUrisResolver.resolveFor(
        ClonePiece.ProjectMetadata,
        'project metadata file relative path',
      );

      validProjectMetadataFileContent.projectAlreadyCreated = existingProject;

      return PrepareZipFile(
        validProjectMetadataFileContent,
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
