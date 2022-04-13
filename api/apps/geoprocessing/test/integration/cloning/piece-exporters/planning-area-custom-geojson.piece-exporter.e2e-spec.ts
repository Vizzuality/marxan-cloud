import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import { FileRepository, FileRepositoryModule } from '@marxan/files-repository';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Logger } from '@nestjs/common';
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
import { PlanningArea } from '@marxan/planning-area-repository/planning-area.geo.entity';
import { PlanningAreaCustomGeojsonPieceExporter } from '@marxan-geoprocessing/export/pieces-exporters/planning-area-custom-geojson.piece-exporter';
import { MultiPolygon } from 'geojson';
import {
  DeletePlanningAreas,
  DeleteProjectAndOrganization,
  GivenProjectExists,
  readSavedFile,
} from '../fixtures';

let fixtures: FixtureType<typeof getFixtures>;

describe(PlanningAreaCustomGeojsonPieceExporter, () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 10_000);

  afterEach(async () => {
    await fixtures?.cleanUp();
  });

  it('should throw when planning area is not found', async () => {
    const input = fixtures.GivenAPlanningAreaCustomExportJob();
    await fixtures.GivenProjectExist();
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenAPlanningAreatExistErrorShouldBeThrown();
  });
  it('should save file succesfully when planning area is found', async () => {
    const input = fixtures.GivenAPlanningAreaCustomExportJob();
    await fixtures.GivenProjectExist();
    await fixtures.GivenPlanningArea();
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenAPlanningAreaCustomGeoJsonFileIsSaved();
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
      TypeOrmModule.forFeature([PlanningArea]),
      FileRepositoryModule,
    ],
    providers: [
      PlanningAreaCustomGeojsonPieceExporter,
      { provide: Logger, useValue: { error: () => {}, setContext: () => {} } },
    ],
  }).compile();

  await sandbox.init();
  const projectId = v4();
  const organizationId = v4();
  const planningAreaId = v4();
  const sut = sandbox.get(PlanningAreaCustomGeojsonPieceExporter);
  const apiEntityManager: EntityManager = sandbox.get(
    getEntityManagerToken(geoprocessingConnections.apiDB),
  );
  const geoEntityManager: EntityManager = sandbox.get(
    getEntityManagerToken(geoprocessingConnections.default),
  );
  const fileRepository = sandbox.get(FileRepository);
  const planningAreaRepository: Repository<PlanningArea> = sandbox.get(
    getRepositoryToken(PlanningArea),
  );

  return {
    cleanUp: async () => {
      await DeleteProjectAndOrganization(
        apiEntityManager,
        projectId,
        organizationId,
      );
      return DeletePlanningAreas(geoEntityManager, projectId);
    },
    GivenAPlanningAreaCustomExportJob: (): ExportJobInput => {
      return {
        allPieces: [
          { resourceId: projectId, piece: ClonePiece.ProjectMetadata },
          { resourceId: projectId, piece: ClonePiece.PlanningAreaCustom },
          {
            resourceId: projectId,
            piece: ClonePiece.PlanningAreaCustomGeojson,
          },
        ],
        componentId: v4(),
        exportId: v4(),
        piece: ClonePiece.PlanningAreaCustomGeojson,
        resourceId: projectId,
        resourceKind: ResourceKind.Project,
        isCloning: false,
      };
    },
    GivenProjectExist: async () => {
      return GivenProjectExists(apiEntityManager, projectId, organizationId, {
        description: 'desc',
        planning_unit_area_km2: 500,
        planning_area_geometry_id: planningAreaId,
      });
    },
    GivenPlanningArea: async (): Promise<void> => {
      await planningAreaRepository.save({
        id: planningAreaId,
        projectId,
        theGeom: expectedGeom,
      });
    },
    WhenPieceExporterIsInvoked: (input: ExportJobInput) => {
      return {
        ThenAPlanningAreatExistErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(
            /Custom planning area not found for project with ID/gi,
          );
        },
        ThenAPlanningAreaCustomGeoJsonFileIsSaved: async () => {
          const result = await sut.run(input);
          const file = await fileRepository.get(result.uris[0].uri);
          expect((file as Right<Readable>).right).toBeDefined();
          if (isLeft(file)) throw new Error();
          const savedStrem = file.right;
          const content = await readSavedFile<MultiPolygon>(savedStrem);
          expect(content).toStrictEqual(expectedGeom);
        },
      };
    },
  };
};

const expectedGeom: MultiPolygon = {
  type: 'MultiPolygon',
  coordinates: [
    [
      [
        [102.0, 2.0],
        [103.0, 2.0],
        [103.0, 3.0],
        [102.0, 3.0],
        [102.0, 2.0],
      ],
    ],
    [
      [
        [100.0, 0.0],
        [101.0, 0.0],
        [101.0, 1.0],
        [100.0, 1.0],
        [100.0, 0.0],
      ],
      [
        [100.2, 0.2],
        [100.8, 0.2],
        [100.8, 0.8],
        [100.2, 0.8],
        [100.2, 0.2],
      ],
    ],
  ],
};
