import { ScenarioRunResultsPieceImporter } from '@marxan-geoprocessing/import/pieces-importers/scenario-run-results.piece-importer';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import {
  PlanningUnitsGeom,
  ProjectsPuEntity,
} from '@marxan-jobs/planning-unit-geometry';
import { BlmFinalResultEntity } from '@marxan/blm-calibration';
import { ImportJobInput } from '@marxan/cloning';
import {
  ArchiveLocation,
  ClonePiece,
  ResourceKind,
} from '@marxan/cloning/domain';
import { ClonePieceRelativePathResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import { ScenarioRunResultsContent } from '@marxan/cloning/infrastructure/clone-piece-data/scenario-run-results';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import {
  OutputScenariosPuDataGeoEntity,
  ScenariosOutputResultsApiEntity,
} from '@marxan/marxan-output';
import { ScenariosPuPaDataGeo } from '@marxan/scenarios-planning-unit';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Test } from '@nestjs/testing';
import {
  getEntityManagerToken,
  getRepositoryToken,
  TypeOrmModule,
} from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { v4 } from 'uuid';
import {
  DeleteProjectAndOrganization,
  DeleteProjectPus,
  GivenScenarioExists,
  GivenScenarioPuData,
} from '../fixtures';
import { Readable } from 'stream';
import { isLeft } from 'fp-ts/lib/Either';
import { GeoCloningFilesRepositoryModule } from '@marxan-geoprocessing/modules/cloning-files-repository';
import { FakeLogger } from '@marxan-geoprocessing/utils/__mocks__/fake-logger';

let fixtures: FixtureType<typeof getFixtures>;

describe(ScenarioRunResultsPieceImporter, () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 10_000);

  afterEach(async () => {
    await fixtures?.cleanUp();
  });

  it('fails when scenario run results file uri is missing in uris array', async () => {
    await fixtures.GivenScenario();
    const input = fixtures.GivenJobInputWithoutUris();
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenAnUrisArrayErrorShouldBeThrown();
  });

  it('fails when the file cannot be retrieved from file repo', async () => {
    await fixtures.GivenScenario();
    const archiveLocation = fixtures.GivenNoScenarioRunResultsFileIsAvailable();
    const input = fixtures.GivenJobInput(archiveLocation);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenADataNotAvailableErrorShouldBeThrown();
  });

  it('fails if projects planning units amount does not match', async () => {
    await fixtures.GivenScenario();
    await fixtures.GivenScenarioPuData();
    const archiveLocation =
      await fixtures.GivenScenarioRunResultsFileWithLeastProjectsPu();
    const input = fixtures.GivenJobInput(archiveLocation);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenAMissingPlanningUnitsErrorShouldBeThrown();
  });

  it('imports scenario run results', async () => {
    await fixtures.GivenScenario();
    await fixtures.GivenScenarioPuData();
    const archiveLocation = await fixtures.GivenValidScenarioRunResultsFile();
    const input = fixtures.GivenJobInput(archiveLocation);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenScenarioRunResultsShouldBeImported();
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
      TypeOrmModule.forFeature(
        [ScenariosOutputResultsApiEntity],
        geoprocessingConnections.apiDB.name,
      ),
      TypeOrmModule.forRoot({
        ...geoprocessingConnections.default,
        keepConnectionAlive: true,
        logging: false,
      }),
      TypeOrmModule.forFeature([
        ScenariosPuPaDataGeo,
        ProjectsPuEntity,
        PlanningUnitsGeom,
        OutputScenariosPuDataGeoEntity,
        BlmFinalResultEntity,
      ]),
      GeoCloningFilesRepositoryModule,
    ],
    providers: [ScenarioRunResultsPieceImporter],
  }).compile();

  await sandbox.init();
  sandbox.useLogger(new FakeLogger());

  const scenarioId = v4();
  const projectId = v4();
  const organizationId = v4();
  const resourceKind = ResourceKind.Project;
  const oldScenarioId = v4();
  const userId = v4();

  const sut = sandbox.get(ScenarioRunResultsPieceImporter);
  const fileRepository = sandbox.get(CloningFilesRepository);
  const entityManager = sandbox.get<EntityManager>(getEntityManagerToken());
  const apiEntityManager = sandbox.get<EntityManager>(
    getEntityManagerToken(geoprocessingConnections.apiDB.name),
  );
  const outputScenariosPuDataRepo = sandbox.get<
    Repository<OutputScenariosPuDataGeoEntity>
  >(getRepositoryToken(OutputScenariosPuDataGeoEntity));
  const blmFinalResultRepo = sandbox.get<Repository<BlmFinalResultEntity>>(
    getRepositoryToken(BlmFinalResultEntity),
  );
  const outputSummariesRepo = sandbox.get<
    Repository<ScenariosOutputResultsApiEntity>
  >(
    getRepositoryToken(
      ScenariosOutputResultsApiEntity,
      geoprocessingConnections.apiDB.name,
    ),
  );

  const scenarioPlanningUnitsAmount = 4;
  const scenarioPuDataIds: string[] = [];

  const firstPng = 'first!';
  const secondPng = 'second!';
  const thirdPng = 'third!';

  const amountOfRuns = 10;

  const validScenarioRunResultsFileContent: ScenarioRunResultsContent = {
    blmResults: [
      {
        blmValue: 1,
        boundaryLength: 100,
        cost: 10,
        png: Buffer.from(firstPng).toJSON().data,
      },
      {
        blmValue: 2,
        boundaryLength: 200,
        cost: 20,
        png: Buffer.from(secondPng).toJSON().data,
      },
      {
        blmValue: 3,
        boundaryLength: 300,
        cost: 30,
        png: Buffer.from(thirdPng).toJSON().data,
      },
    ],
    marxanRunResults: [],
    outputSummaries: Array(amountOfRuns)
      .fill(0)
      .map((_, index) => ({
        runId: index,
        scoreValue: index,
        costValue: index,
        planningUnits: index,
        connectivity: index,
        connectivityTotal: index,
        mpm: index,
        penaltyValue: index,
        shortfall: index,
        missingValues: index,
        best: index === 0,
        distinctFive: index < 5,
        metadata: index === 1 ? { foo: 'bar' } : undefined,
      })),
  };

  return {
    cleanUp: async () => {
      await DeleteProjectPus(entityManager, projectId);
      await outputScenariosPuDataRepo.delete({
        scenarioPuId: In(scenarioPuDataIds),
      });
      await blmFinalResultRepo.delete({
        scenarioId,
      });
      await DeleteProjectAndOrganization(
        apiEntityManager,
        projectId,
        organizationId,
      );
    },
    GivenScenario: () => {
      return GivenScenarioExists(
        apiEntityManager,
        scenarioId,
        projectId,
        organizationId,
      );
    },
    GivenScenarioPuData: async () => {
      const scenarioPuData = await GivenScenarioPuData(
        entityManager,
        scenarioId,
        projectId,
        scenarioPlanningUnitsAmount,
      );

      scenarioPuData.forEach((pu) => scenarioPuDataIds.push(pu.id));

      validScenarioRunResultsFileContent.marxanRunResults = scenarioPuData.map(
        (pu, index) => ({
          includedCount: (index + 1) * 10,
          puid: pu.projectPu.puid,
          values: [true, false, true],
        }),
      );
    },
    GivenJobInput: (archiveLocation: ArchiveLocation): ImportJobInput => {
      const relativePath = ClonePieceRelativePathResolver.resolveFor(
        ClonePiece.ScenarioRunResults,
        { kind: resourceKind, scenarioId: oldScenarioId },
      );
      return {
        componentId: v4(),
        pieceResourceId: scenarioId,
        importId: v4(),
        projectId,
        piece: ClonePiece.ScenarioRunResults,
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
        piece: ClonePiece.ScenarioRunResults,
        resourceKind,
        uris: [],
        ownerId: userId,
      };
    },
    GivenNoScenarioRunResultsFileIsAvailable: () => {
      return new ArchiveLocation('not found');
    },
    GivenScenarioRunResultsFileWithLeastProjectsPu: async () => {
      const relativePath = ClonePieceRelativePathResolver.resolveFor(
        ClonePiece.ScenarioRunResults,
        { kind: resourceKind, scenarioId: oldScenarioId },
      );
      const invalidScenarioRunResultsFileContent: ScenarioRunResultsContent = {
        blmResults: validScenarioRunResultsFileContent.blmResults,
        marxanRunResults:
          validScenarioRunResultsFileContent.marxanRunResults.slice(0, 1),
        outputSummaries: validScenarioRunResultsFileContent.outputSummaries,
      };

      const exportId = v4();

      const uriOrError = await fileRepository.saveCloningFile(
        exportId,
        Readable.from(JSON.stringify(invalidScenarioRunResultsFileContent)),
        relativePath,
      );

      if (isLeft(uriOrError)) throw new Error("couldn't save file");
      return new ArchiveLocation(uriOrError.right);
    },
    GivenValidScenarioRunResultsFile: async () => {
      const relativePath = ClonePieceRelativePathResolver.resolveFor(
        ClonePiece.ScenarioRunResults,
        { kind: resourceKind, scenarioId: oldScenarioId },
      );

      const exportId = v4();

      const uriOrError = await fileRepository.saveCloningFile(
        exportId,
        Readable.from(JSON.stringify(validScenarioRunResultsFileContent)),
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
        ThenAMissingPlanningUnitsErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(
            /missing planning units/gi,
          );
        },
        ThenScenarioRunResultsShouldBeImported: async () => {
          await sut.run(input);
          const outputScenariosPuData = await outputScenariosPuDataRepo.find({
            where: { scenarioPuId: In(scenarioPuDataIds) },
          });
          const blmResults = await blmFinalResultRepo.find({
            where: { scenarioId },
          });
          const summaries = await outputSummariesRepo.find({
            where: { scenarioId },
          });

          expect(outputScenariosPuData).toHaveLength(
            validScenarioRunResultsFileContent.marxanRunResults.length,
          );
          expect(blmResults).toHaveLength(
            validScenarioRunResultsFileContent.blmResults.length,
          );

          const pngs = blmResults.map((result) => result.pngData.toString());
          const expectedPngs = [firstPng, secondPng, thirdPng];
          expect(pngs.sort()).toEqual(expectedPngs.sort());

          expect(summaries).toHaveLength(amountOfRuns);
        },
      };
    },
  };
};
