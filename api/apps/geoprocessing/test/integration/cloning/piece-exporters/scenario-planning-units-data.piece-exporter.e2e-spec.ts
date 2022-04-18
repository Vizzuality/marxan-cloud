import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import {
  CloningFilesRepository,
  CloningFileSRepositoryModule,
} from '@marxan/cloning-files-repository';
import {
  LockStatus,
  ScenariosPuCostDataGeo,
  ScenariosPuPaDataGeo,
} from '@marxan/scenarios-planning-unit';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getEntityManagerToken, TypeOrmModule } from '@nestjs/typeorm';
import { isLeft, Right } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';
import {
  PlanningUnitsGeom,
  ProjectsPuEntity,
} from '@marxan-jobs/planning-unit-geometry';
import { ScenarioPlanningUnitsDataPieceExporter } from '@marxan-geoprocessing/export/pieces-exporters/scenario-planning-units-data.piece-exporter';
import { ScenarioPlanningUnitsDataContent } from '@marxan/cloning/infrastructure/clone-piece-data/scenario-planning-units-data';
import {
  DeleteProjectAndOrganization,
  DeleteProjectPus,
  GivenScenarioExists,
  GivenScenarioPuCostData,
  GivenScenarioPuData,
  readSavedFile,
} from '../fixtures';

let fixtures: FixtureType<typeof getFixtures>;

describe(ScenarioPlanningUnitsDataPieceExporter, () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 10_000);

  afterEach(async () => {
    await fixtures?.cleanUp();
  });

  it('should save succesfully scenario planning units data', async () => {
    const input = fixtures.GivenAScenarioPlanningUnistDataExportJob();
    await fixtures.GivenScenarioExist();
    await fixtures.GivenPlanningUnitsData();
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenAScenarioPlanningUnitsDataFileIsSaved();
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
      TypeOrmModule.forRoot({
        ...geoprocessingConnections.default,
        keepConnectionAlive: true,
        logging: false,
      }),
      TypeOrmModule.forFeature([
        ProjectsPuEntity,
        PlanningUnitsGeom,
        ScenariosPuPaDataGeo,
        ScenariosPuCostDataGeo,
      ]),
      CloningFileSRepositoryModule,
    ],
    providers: [
      ScenarioPlanningUnitsDataPieceExporter,
      { provide: Logger, useValue: { error: () => {}, setContext: () => {} } },
    ],
  }).compile();

  await sandbox.init();
  const projectId = v4();
  const scenarioId = v4();
  const organizationId = v4();
  const sut = sandbox.get(ScenarioPlanningUnitsDataPieceExporter);
  const apiEntityManager: EntityManager = sandbox.get(
    getEntityManagerToken(geoprocessingConnections.apiDB),
  );
  const geoEntityManager: EntityManager = sandbox.get(
    getEntityManagerToken(geoprocessingConnections.default),
  );
  const fileRepository = sandbox.get(CloningFilesRepository);

  return {
    cleanUp: async () => {
      await DeleteProjectAndOrganization(
        apiEntityManager,
        projectId,
        organizationId,
      );
      return DeleteProjectPus(geoEntityManager, projectId);
    },
    GivenAScenarioPlanningUnistDataExportJob: (): ExportJobInput => {
      return {
        allPieces: [
          { resourceId: projectId, piece: ClonePiece.ProjectMetadata },
          {
            resourceId: scenarioId,
            piece: ClonePiece.ScenarioPlanningUnitsData,
          },
        ],
        componentId: v4(),
        exportId: v4(),
        piece: ClonePiece.ScenarioPlanningUnitsData,
        resourceId: scenarioId,
        resourceKind: ResourceKind.Project,
        isCloning: false,
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
    GivenPlanningUnitsData: async () => {
      const scenariPus = await GivenScenarioPuData(
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

      return GivenScenarioPuCostData(geoEntityManager, scenariPus);
    },
    WhenPieceExporterIsInvoked: (input: ExportJobInput) => {
      return {
        ThenAScenarioPlanningUnitsDataFileIsSaved: async () => {
          const result = await sut.run(input);
          const file = await fileRepository.get(result.uris[0].uri);
          expect((file as Right<Readable>).right).toBeDefined();
          if (isLeft(file)) throw new Error();
          const savedStrem = file.right;
          const content = await readSavedFile<ScenarioPlanningUnitsDataContent>(
            savedStrem,
          );
          expect(content.planningUnitsData).toHaveLength(3);
          expect(
            content.planningUnitsData.every(
              (data, index) =>
                data.cost === 1 &&
                data.protectedArea === 700.0045 &&
                data.protectedByDefault &&
                data.lockinStatus === 1 &&
                data.xloc === 1 &&
                data.yloc === 8 &&
                data.puid === index + 1,
            ),
          ).toEqual(true);
        },
      };
    },
  };
};
