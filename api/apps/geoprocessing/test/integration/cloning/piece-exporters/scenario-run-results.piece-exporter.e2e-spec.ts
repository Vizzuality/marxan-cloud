import { ScenarioRunResultsPieceExporter } from '@marxan-geoprocessing/export/pieces-exporters/scenario-run-results.piece-exporter';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import {
  PlanningUnitsGeom,
  ProjectsPuEntity,
} from '@marxan-jobs/planning-unit-geometry';
import { BlmFinalResultEntity } from '@marxan/blm-calibration';
import { ClonePiece, ExportJobInput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import { ScenarioRunResultsContent } from '@marxan/cloning/infrastructure/clone-piece-data/scenario-run-results';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import {
  OutputScenariosPuDataGeoEntity,
  ScenariosOutputResultsApiEntity,
} from '@marxan/marxan-output';
import {
  LockStatus,
  ScenariosPuPaDataGeo,
} from '@marxan/scenarios-planning-unit';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Test } from '@nestjs/testing';
import {
  getEntityManagerToken,
  getRepositoryToken,
  TypeOrmModule,
} from '@nestjs/typeorm';
import { isLeft, Right } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { EntityManager, Repository } from 'typeorm';
import { v4 } from 'uuid';
import {
  DeleteProjectAndOrganization,
  DeleteProjectPus,
  DeleteScenarioBlmResults,
  DeleteScenarioOutputPuDataResults,
  GivenScenarioBlmResults,
  GivenScenarioExists,
  GivenScenarioOutputPuData,
  GivenScenarioPuData,
  readSavedFile,
} from '../fixtures';
import { GeoCloningFilesRepositoryModule } from '@marxan-geoprocessing/modules/cloning-files-repository';
import { FakeLogger } from '@marxan-api/utils/__mocks__/fake-logger';

let fixtures: FixtureType<typeof getFixtures>;

describe(ScenarioRunResultsPieceExporter, () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 10_000);

  afterEach(async () => {
    await fixtures?.cleanUp();
  });

  it('should save empty scenario run results file', async () => {
    const input = fixtures.GivenAScenarioRunResultsExportJob();
    await fixtures.GivenScenarioExist();
    await fixtures.GivenScenarioPlanningUnits();
    await fixtures.GivenNoScenarioRunResulst();
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenAnEmptyScenarioRunResultsFileIsSaved();
  });

  it('should save succesfully scenario run results', async () => {
    const input = fixtures.GivenAScenarioRunResultsExportJob();
    await fixtures.GivenScenarioExist();
    await fixtures.GivenScenarioPlanningUnits();
    await fixtures.GivenScenarioRunResults();
    await fixtures.GivenOutputScenarioSummaries();
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenAScenarioRunResultsFileIsSaved();
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
        ProjectsPuEntity,
        PlanningUnitsGeom,
        ScenariosPuPaDataGeo,
        BlmFinalResultEntity,
        OutputScenariosPuDataGeoEntity,
      ]),
      GeoCloningFilesRepositoryModule,
    ],
    providers: [ScenarioRunResultsPieceExporter],
  }).compile();

  await sandbox.init();
  sandbox.useLogger(new FakeLogger());

  const projectId = v4();
  const scenarioId = v4();
  const organizationId = v4();
  let scenarioPus: ScenariosPuPaDataGeo[];
  const sut = sandbox.get(ScenarioRunResultsPieceExporter);

  const outputSummariesRepo = sandbox.get<
    Repository<ScenariosOutputResultsApiEntity>
  >(
    getRepositoryToken(
      ScenariosOutputResultsApiEntity,
      geoprocessingConnections.apiDB.name,
    ),
  );

  const apiEntityManager: EntityManager = sandbox.get(
    getEntityManagerToken(geoprocessingConnections.apiDB),
  );
  const geoEntityManager: EntityManager = sandbox.get(
    getEntityManagerToken(geoprocessingConnections.default),
  );
  const fileRepository = sandbox.get(CloningFilesRepository);

  const imageBuffer = Buffer.from('foo bar');
  const amountOfRuns = 10;

  return {
    cleanUp: async () => {
      await DeleteProjectAndOrganization(
        apiEntityManager,
        projectId,
        scenarioId,
      );
      await DeleteScenarioOutputPuDataResults(geoEntityManager, scenarioId);

      await DeleteProjectPus(geoEntityManager, projectId);
      return DeleteScenarioBlmResults(geoEntityManager, scenarioId);
    },
    GivenAScenarioRunResultsExportJob: (): ExportJobInput => {
      return {
        allPieces: [
          { resourceId: projectId, piece: ClonePiece.ProjectMetadata },
          {
            resourceId: scenarioId,
            piece: ClonePiece.ScenarioRunResults,
          },
        ],
        componentId: v4(),
        exportId: v4(),
        piece: ClonePiece.ScenarioRunResults,
        resourceId: scenarioId,
        resourceKind: ResourceKind.Project,
      };
    },
    GivenScenarioExist: async () => {
      return GivenScenarioExists(
        apiEntityManager,
        scenarioId,
        projectId,
        organizationId,
      );
    },
    GivenOutputScenarioSummaries: () => {
      return outputSummariesRepo.save(
        Array(amountOfRuns)
          .fill(0)
          .map((_, index) => ({
            scenarioId,
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
          })),
      );
    },
    GivenScenarioPlanningUnits: async () => {
      scenarioPus = await GivenScenarioPuData(
        geoEntityManager,
        scenarioId,
        projectId,
        3,
        {
          lockStatus: LockStatus.LockedIn,
          protectedArea: 700.0045,
          protectedByDefault: true,
          xloc: 1,
          yloc: 8,
        },
      );
    },
    GivenScenarioRunResults: async () => {
      await GivenScenarioBlmResults(geoEntityManager, scenarioId, imageBuffer);
      return GivenScenarioOutputPuData(geoEntityManager, scenarioPus);
    },
    GivenNoScenarioRunResulst: async (): Promise<void> => {},
    WhenPieceExporterIsInvoked: (input: ExportJobInput) => {
      return {
        ThenAnEmptyScenarioRunResultsFileIsSaved: async () => {
          const result = await sut.run(input);
          const file = await fileRepository.get(result.uris[0].uri);
          expect((file as Right<Readable>).right).toBeDefined();
          if (isLeft(file)) throw new Error();
          const savedStrem = file.right;
          const content = await readSavedFile(savedStrem);
          expect(content).toEqual({
            blmResults: [],
            marxanRunResults: [],
            outputSummaries: [],
          });
        },
        ThenAScenarioRunResultsFileIsSaved: async () => {
          const result = await sut.run(input);
          const file = await fileRepository.get(result.uris[0].uri);
          expect((file as Right<Readable>).right).toBeDefined();
          if (isLeft(file)) throw new Error();
          const savedStrem = file.right;
          const content = await readSavedFile<ScenarioRunResultsContent>(
            savedStrem,
          );
          const expectedMarxanResults = [1, 2, 3].map((value) => ({
            includedCount: 7,
            values: [false, true, false, true],
            puid: value,
          }));
          expect(content.blmResults[0]).toEqual({
            blmValue: 30,
            boundaryLength: 500,
            cost: 1,
            png: imageBuffer.toJSON().data,
          });
          expect(
            content.marxanRunResults.sort((a, b) => a.puid - a.puid),
          ).toEqual(expectedMarxanResults);

          expect(content.outputSummaries).toHaveLength(amountOfRuns);
        },
      };
    },
  };
};
