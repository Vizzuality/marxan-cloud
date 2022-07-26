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
import {
  BlmRange,
  ProjectMetadataContent,
} from '@marxan/cloning/infrastructure/clone-piece-data/project-metadata';
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
  DeleteUser,
  GivenOrganizationExists,
  GivenProjectExists,
  GivenUserExists,
} from '../fixtures';
import { GeoCloningFilesRepositoryModule } from '@marxan-geoprocessing/modules/cloning-files-repository';
import { ProjectSourcesEnum } from '@marxan/projects';

interface ProjectSelectResult {
  name: string;
  description: string;
  planning_unit_grid_shape: PlanningUnitGridShape;
  metadata: Record<string, unknown> | null;
  created_by: string;
  sources: ProjectSourcesEnum;
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

  it('imports project metadata creating a new marxan project (isolated import process)', async () => {
    const marxanSource = ProjectSourcesEnum.marxanCloud;
    // Piece importer picks a random organization
    await fixtures.GivenOrganization();
    await fixtures.GivenUser();

    const archiveLocation = await fixtures.GivenValidProjectMetadataFile(
      marxanSource,
    );
    const input = fixtures.GivenJobInput(archiveLocation);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenProjectMetadataShouldBeImported(marxanSource);
  });

  it('imports project metadata creating a new legacy project (isolated import process)', async () => {
    const legacySource = ProjectSourcesEnum.legacyImport;
    // Piece importer picks a random organization
    await fixtures.GivenOrganization();
    await fixtures.GivenUser();

    const archiveLocation = await fixtures.GivenValidProjectMetadataFile(
      legacySource,
    );
    const input = fixtures.GivenJobInput(archiveLocation);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenProjectMetadataShouldBeImported(legacySource);
  });

  it('imports project metadata creating a new marxan project (isolated import process) with resource name', async () => {
    const marxanSource = ProjectSourcesEnum.marxanCloud;
    // Piece importer picks a random organization
    await fixtures.GivenOrganization();
    await fixtures.GivenUser();

    const resourceName = 'custom project name!!';
    const archiveLocation = await fixtures.GivenValidProjectMetadataFile(
      marxanSource,
    );
    const input = fixtures.GivenJobInput(archiveLocation, resourceName);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenProjectMetadataShouldBeImported(marxanSource, {
        withResourceName: resourceName,
      });
  });

  it('imports project metadata updating a existing marxan project (cloning import process)', async () => {
    const marxanSource = ProjectSourcesEnum.marxanCloud;
    await fixtures.GivenUser();
    await fixtures.GivenProject();

    const archiveLocation = await fixtures.GivenValidProjectMetadataFile(
      marxanSource,
    );
    const input = fixtures.GivenJobInput(archiveLocation);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenProjectMetadataShouldBeImported(marxanSource);
  });

  it('imports project metadata updating a existing legacy project (cloning import process)', async () => {
    const legacySource = ProjectSourcesEnum.legacyImport;
    await fixtures.GivenUser();
    await fixtures.GivenProject();

    const archiveLocation = await fixtures.GivenValidProjectMetadataFile(
      legacySource,
    );
    const input = fixtures.GivenJobInput(archiveLocation);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenProjectMetadataShouldBeImported(legacySource);
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

  const projectName = `test project - ${projectId}`;
  const copyProjectName = projectName + ' - copy';

  const expectedMetadata = { foo: 'bar' };

  const validProjectMetadataFileContent: (
    sources: ProjectSourcesEnum,
  ) => ProjectMetadataContent = (sources: ProjectSourcesEnum) => ({
    name: projectName,
    description: 'project description',
    planningUnitGridShape: PlanningUnitGridShape.Hexagon,
    blmRange: {
      defaults: [0, 20, 40, 60, 80, 100],
      range: [0, 100],
      values: [],
    },
    metadata: expectedMetadata,
    sources,
  });

  return {
    cleanUp: async () => {
      await DeleteProjectAndOrganization(
        entityManager,
        projectId,
        organizationId,
      );

      await DeleteUser(entityManager, userId);
    },
    GivenJobInput: (
      archiveLocation: ArchiveLocation,
      resourceName?: string,
    ): ImportJobInput => {
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
        resourceName,
      };
    },
    GivenUser: () => GivenUserExists(entityManager, userId, projectId),
    GivenOrganization: () => {
      return GivenOrganizationExists(entityManager, organizationId);
    },
    GivenProject: () => {
      return GivenProjectExists(entityManager, projectId, organizationId, {
        name: copyProjectName,
      });
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
    GivenValidProjectMetadataFile: async (sources: ProjectSourcesEnum) => {
      const exportId = v4();
      const relativePath = ClonePieceRelativePathResolver.resolveFor(
        ClonePiece.ProjectMetadata,
      );

      const uriOrError = await fileRepository.saveCloningFile(
        exportId,
        Readable.from(JSON.stringify(validProjectMetadataFileContent(sources))),
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
        ThenProjectMetadataShouldBeImported: async (
          sources: ProjectSourcesEnum,
          { withResourceName }: { withResourceName?: string } = {
            withResourceName: undefined,
          },
        ) => {
          await sut.run(input);

          const [project]: [
            ProjectSelectResult,
          ] = await entityManager
            .createQueryBuilder()
            .select()
            .from('projects', 'p')
            .where('id = :projectId', { projectId })
            .execute();

          const validFileContent = validProjectMetadataFileContent(sources);

          expect(project.name).toEqual(withResourceName ?? copyProjectName);
          expect(project.description).toEqual(validFileContent.description);
          expect(project.planning_unit_grid_shape).toEqual(
            validFileContent.planningUnitGridShape,
          );
          expect(project.metadata).toMatchObject(expectedMetadata);
          expect(project.created_by).toEqual(userId);
          expect(project.sources).toEqual(sources);

          const [blmRange]: [
            BlmRange,
          ] = await entityManager
            .createQueryBuilder()
            .select()
            .from('project_blms', 'pblms')
            .where('id = :projectId', { projectId })
            .execute();

          expect(blmRange).toMatchObject(validFileContent.blmRange);
        },
      };
    },
  };
};
