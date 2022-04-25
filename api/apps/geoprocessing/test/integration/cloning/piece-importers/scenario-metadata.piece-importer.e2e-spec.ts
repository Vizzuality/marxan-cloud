import { ScenarioMetadataPieceImporter } from '@marxan-geoprocessing/import/pieces-importers/scenario-metadata.piece-importer';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ImportJobInput } from '@marxan/cloning';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import {
  ArchiveLocation,
  ClonePiece,
  ResourceKind,
} from '@marxan/cloning/domain';
import { ClonePieceRelativePathResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import { ScenarioMetadataContent } from '@marxan/cloning/infrastructure/clone-piece-data/scenario-metadata';
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
  GivenProjectExists,
  GivenScenarioExists,
  GivenUserExists,
} from '../fixtures';
import { GeoCloningFilesRepositoryModule } from '@marxan-geoprocessing/modules/cloning-files-repository';

interface ScenarioSelectResult {
  name: string;
  description: string;
  number_of_runs: number;
  blm: number;
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
      ScenarioMetadataPieceImporter,
      { provide: Logger, useValue: { error: () => {}, setContext: () => {} } },
    ],
  }).compile();

  await sandbox.init();
  const scenarioId = v4();
  const projectId = v4();
  const organizationId = v4();
  const oldScenarioId = v4();
  const userId = v4();

  const sut = sandbox.get(ScenarioMetadataPieceImporter);
  const fileRepository = sandbox.get(CloningFilesRepository);

  const entityManager = sandbox.get<EntityManager>(
    getEntityManagerToken(geoprocessingConnections.apiDB.name),
  );

  const validScenarioMetadataFileContent: ScenarioMetadataContent = {
    name: `test scenario - ${scenarioId}`,
    description: 'scenario description',
    blm: 10,
    numberOfRuns: 120,
  };

  return {
    cleanUp: async () => {
      await DeleteProjectAndOrganization(
        entityManager,
        projectId,
        organizationId,
      );
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
    GivenValidScenarioMetadataFile: async (resourceKind: ResourceKind) => {
      const relativePath = ClonePieceRelativePathResolver.resolveFor(
        ClonePiece.ScenarioMetadata,
        { kind: resourceKind, scenarioId: oldScenarioId },
      );

      const exportId = v4();

      const uriOrError = await fileRepository.saveCloningFile(
        exportId,
        Readable.from(JSON.stringify(validScenarioMetadataFileContent)),
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
        ThenScenarioMetadataShouldBeImported: async () => {
          await sut.run(input);

          const [scenario]: [
            ScenarioSelectResult,
          ] = await entityManager
            .createQueryBuilder()
            .select()
            .from('scenarios', 's')
            .where('id = :scenarioId', { scenarioId })
            .execute();

          expect(scenario.name).toEqual(validScenarioMetadataFileContent.name);
          expect(scenario.description).toEqual(
            validScenarioMetadataFileContent.description,
          );
          expect(scenario.blm).toEqual(validScenarioMetadataFileContent.blm);
          expect(scenario.number_of_runs).toEqual(
            validScenarioMetadataFileContent.numberOfRuns,
          );
        },
      };
    },
  };
};
