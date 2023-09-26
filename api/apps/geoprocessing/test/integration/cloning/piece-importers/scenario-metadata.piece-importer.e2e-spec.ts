import { ScenarioMetadataPieceImporter } from '@marxan-geoprocessing/import/pieces-importers/scenario-metadata.piece-importer';
import { GeoCloningFilesRepositoryModule } from '@marxan-geoprocessing/modules/cloning-files-repository';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ImportJobInput } from '@marxan/cloning';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import {
  ArchiveLocation,
  ClonePiece,
  ResourceKind,
} from '@marxan/cloning/domain';
import { ClonePieceRelativePathResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import { BlmRange } from '@marxan/cloning/infrastructure/clone-piece-data/project-metadata';
import { ScenarioMetadataContent } from '@marxan/cloning/infrastructure/clone-piece-data/scenario-metadata';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Test } from '@nestjs/testing';
import { getEntityManagerToken, TypeOrmModule } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';
import {
  DeleteProjectAndOrganization,
  DeleteUser,
  GivenProjectExists,
  GivenScenarioExists,
  GivenUserExists,
} from '../fixtures';
import { FakeLogger } from '@marxan-geoprocessing/utils/__mocks__/fake-logger';

interface ScenarioSelectResult {
  name: string;
  description: string;
  number_of_runs: number;
  blm: number;
  ran_at_least_once: boolean;
  solutions_are_locked: boolean;
  type: string;
  created_by: string;
}

let fixtures: FixtureType<typeof getFixtures>;

describe(ScenarioMetadataPieceImporter, () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 10_000);

  afterEach(async () => {
    await fixtures?.cleanUp();
  });

  it('fails when scenario metadata file uri is missing in uris array', async () => {
    const input = fixtures.GivenJobInputWithoutUris();
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenAnUrisArrayErrorShouldBeThrown();
  });

  it('fails when the file cannot be retrieved from file repo', async () => {
    const archiveLocation = fixtures.GivenNoScenarioMetadataFileIsAvailable();
    const input = fixtures.GivenJobInput(archiveLocation, ResourceKind.Project);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenADataNotAvailableErrorShouldBeThrown();
  });

  it('imports scenario metadata creating a new scenario (project import process)', async () => {
    const resourceKind = ResourceKind.Project;
    await fixtures.GivenProject();
    await fixtures.GivenUser();

    const archiveLocation = await fixtures.GivenValidScenarioMetadataFile(
      resourceKind,
    );
    const input = fixtures.GivenJobInput(archiveLocation, resourceKind);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenScenarioMetadataShouldBeImported();
  });

  it('imports scenario metadata creating a new scenario with solutions locked (project import process)', async () => {
    const resourceKind = ResourceKind.Project;
    const solutionsAreLocked = true;
    await fixtures.GivenProject();
    await fixtures.GivenUser();

    const archiveLocation = await fixtures.GivenValidScenarioMetadataFile(
      resourceKind,
    );
    const input = fixtures.GivenJobInput(archiveLocation, resourceKind);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenScenarioMetadataShouldBeImported();
  });

  it('imports scenario metadata updating an existing scenario (scenario cloning process)', async () => {
    const resourceKind = ResourceKind.Scenario;
    await fixtures.GivenScenario();
    await fixtures.GivenUser();

    const archiveLocation = await fixtures.GivenValidScenarioMetadataFile(
      resourceKind,
    );
    const input = fixtures.GivenJobInput(
      archiveLocation,
      ResourceKind.Scenario,
    );
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenScenarioMetadataShouldBeImported();
  });

  it('imports scenario metadata updating an existing scenario with solutions locked (scenario cloning process)', async () => {
    const resourceKind = ResourceKind.Scenario;
    const solutionsAreLocked = true;
    await fixtures.GivenScenario();
    await fixtures.GivenUser();

    const archiveLocation = await fixtures.GivenValidScenarioMetadataFile(
      resourceKind,
      solutionsAreLocked,
    );
    const input = fixtures.GivenJobInput(
      archiveLocation,
      ResourceKind.Scenario,
    );
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenScenarioMetadataShouldBeImported(solutionsAreLocked);
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
    providers: [ScenarioMetadataPieceImporter],
  }).compile();

  await sandbox.init();
  sandbox.useLogger(new FakeLogger());

  const scenarioId = v4();
  const projectId = v4();
  const organizationId = v4();
  const oldScenarioId = v4();
  const userId = v4();
  const costSurfaceId = v4();

  const sut = sandbox.get(ScenarioMetadataPieceImporter);
  const fileRepository = sandbox.get(CloningFilesRepository);

  const entityManager = sandbox.get<EntityManager>(
    getEntityManagerToken(geoprocessingConnections.apiDB.name),
  );

  const validScenarioMetadataFileContent: (
    solutionsAreLocked: boolean,
  ) => ScenarioMetadataContent = (solutionsAreLocked = false) => ({
    name: `test scenario - ${scenarioId}`,
    description: 'scenario description',
    blm: 10,
    numberOfRuns: 120,
    blmRange: {
      defaults: [0, 20, 40, 60, 80, 100],
      range: [0, 100],
      values: [],
    },
    ranAtLeastOnce: true,
    solutionsAreLocked,
    projectScenarioId: 1,
    type: 'marxan',
    cost_surface_id: costSurfaceId,
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
    GivenUser: () => GivenUserExists(entityManager, userId, projectId),
    GivenProject: () => {
      return GivenProjectExists(entityManager, projectId, organizationId);
    },
    GivenScenario: () => {
      return GivenScenarioExists(
        entityManager,
        scenarioId,
        projectId,
        organizationId,
        {},
        {},
        costSurfaceId,
      );
    },
    GivenJobInput: (
      archiveLocation: ArchiveLocation,
      resourceKind: ResourceKind,
    ): ImportJobInput => {
      const relativePath = ClonePieceRelativePathResolver.resolveFor(
        ClonePiece.ScenarioMetadata,
        { kind: resourceKind, scenarioId: oldScenarioId },
      );
      return {
        componentId: v4(),
        pieceResourceId: scenarioId,
        importId: v4(),
        projectId,
        piece: ClonePiece.ScenarioMetadata,
        resourceKind,
        uris: [{ relativePath, uri: archiveLocation.value }],
        ownerId: userId,
      };
    },
    GivenJobInputWithoutUris: (): ImportJobInput => {
      return {
        componentId: v4(),
        pieceResourceId: scenarioId,
        importId: v4(),
        projectId,
        piece: ClonePiece.ScenarioMetadata,
        resourceKind: ResourceKind.Project,
        uris: [],
        ownerId: userId,
      };
    },
    GivenNoScenarioMetadataFileIsAvailable: () => {
      return new ArchiveLocation('not found');
    },
    GivenValidScenarioMetadataFile: async (
      resourceKind: ResourceKind,
      solutionsAreLocked = false,
    ) => {
      const relativePath = ClonePieceRelativePathResolver.resolveFor(
        ClonePiece.ScenarioMetadata,
        { kind: resourceKind, scenarioId: oldScenarioId },
      );

      const exportId = v4();

      const uriOrError = await fileRepository.saveCloningFile(
        exportId,
        Readable.from(
          JSON.stringify(validScenarioMetadataFileContent(solutionsAreLocked)),
        ),
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
        ThenScenarioMetadataShouldBeImported: async (
          solutionsAreLocked = false,
        ) => {
          await sut.run(input);

          const [scenario]: [
            ScenarioSelectResult,
          ] = await entityManager
            .createQueryBuilder()
            .select()
            .from('scenarios', 's')
            .where('id = :scenarioId', { scenarioId })
            .execute();

          const validScenarioMetadataContent = validScenarioMetadataFileContent(
            solutionsAreLocked,
          );
          expect(scenario.name).toEqual(validScenarioMetadataContent.name);
          expect(scenario.description).toEqual(
            validScenarioMetadataContent.description,
          );
          expect(scenario.blm).toEqual(validScenarioMetadataContent.blm);
          expect(scenario.number_of_runs).toEqual(
            validScenarioMetadataContent.numberOfRuns,
          );
          expect(scenario.ran_at_least_once).toEqual(
            validScenarioMetadataContent.ranAtLeastOnce,
          );
          expect(scenario.solutions_are_locked).toEqual(solutionsAreLocked);
          expect(scenario.type).toEqual(validScenarioMetadataContent.type);
          expect(scenario.created_by).toEqual(userId);

          const [blmRange]: [
            BlmRange,
          ] = await entityManager
            .createQueryBuilder()
            .select()
            .from('scenario_blms', 'pblms')
            .where('id = :scenarioId', { scenarioId })
            .execute();

          expect(blmRange).toMatchObject(validScenarioMetadataContent.blmRange);
        },
      };
    },
  };
};
