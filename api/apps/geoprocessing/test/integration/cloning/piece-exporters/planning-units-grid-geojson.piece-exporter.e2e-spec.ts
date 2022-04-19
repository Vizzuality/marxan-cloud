import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import {
  CloningFilesRepository,
  CloningFileSRepositoryModule,
} from '@marxan/cloning-files-repository';
import { PlanningUnitGridShape } from '@marxan/scenarios-planning-unit';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getEntityManagerToken, TypeOrmModule } from '@nestjs/typeorm';
import { isLeft, Right } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { EntityManager, In, Repository } from 'typeorm';
import { v4 } from 'uuid';
import {
  PlanningUnitsGeom,
  ProjectsPuEntity,
} from '@marxan-jobs/planning-unit-geometry';
import { Polygon } from 'geojson';
import { PlanningUnitsGridGeojsonPieceExporter } from '@marxan-geoprocessing/export/pieces-exporters/planning-units-grid-geojson.piece-exporter';
import {
  DeleteProjectAndOrganization,
  DeleteProjectPus,
  GivenProjectExists,
  GivenProjectPus,
  readSavedFile,
} from '../fixtures';

let fixtures: FixtureType<typeof getFixtures>;

describe(PlanningUnitsGridGeojsonPieceExporter, () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 10_000);

  afterEach(async () => {
    await fixtures?.cleanUp();
  });

  it('should save succesfully project planning units grid geojson', async () => {
    const input = fixtures.GivenAPlanningUnitsGridExportJob();
    await fixtures.GivenProjectExist();
    await fixtures.GivenPlanningUnits();
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenAPlanningUnitsGridFileIsSaved();
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
      TypeOrmModule.forFeature([ProjectsPuEntity, PlanningUnitsGeom]),
      CloningFileSRepositoryModule,
    ],
    providers: [
      PlanningUnitsGridGeojsonPieceExporter,
      { provide: Logger, useValue: { error: () => {}, setContext: () => {} } },
    ],
  }).compile();

  await sandbox.init();
  const projectId = v4();
  const otherProjectId = v4();
  const organizationId = v4();
  const sut = sandbox.get(PlanningUnitsGridGeojsonPieceExporter);
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
      await DeleteProjectPus(geoEntityManager, projectId);
      return DeleteProjectPus(geoEntityManager, otherProjectId);
    },
    GivenAPlanningUnitsGridExportJob: (): ExportJobInput => {
      return {
        allPieces: [
          { resourceId: projectId, piece: ClonePiece.ProjectMetadata },
          {
            resourceId: projectId,
            piece: ClonePiece.PlanningUnitsGridGeojson,
          },
        ],
        componentId: v4(),
        exportId: v4(),
        piece: ClonePiece.PlanningUnitsGridGeojson,
        resourceId: projectId,
        resourceKind: ResourceKind.Project,
        isCloning: false,
      };
    },
    GivenProjectExist: async () => {
      return GivenProjectExists(apiEntityManager, projectId, organizationId, {
        planning_unit_grid_shape: PlanningUnitGridShape.FromShapefile,
        planning_unit_area_km2: 30,
        bbox: JSON.stringify([10, 11, 12, 13]),
      });
    },
    GivenPlanningUnits: async () => {
      await GivenProjectPus(geoEntityManager, projectId, 2);

      return GivenProjectPus(geoEntityManager, otherProjectId, 1);
    },
    WhenPieceExporterIsInvoked: (input: ExportJobInput) => {
      return {
        ThenAPlanningUnitsGridFileIsSaved: async () => {
          const result = await sut.run(input);
          const file = await fileRepository.get(result.uris[0].uri);
          expect((file as Right<Readable>).right).toBeDefined();
          if (isLeft(file)) throw new Error();
          const savedStrem = file.right;
          const content = await readSavedFile<{
            type: string;
            bbox: number[];
            coordinates: Polygon[];
          }>(savedStrem);
          expect(content.type).toBe('MultiPolygon');
          expect(content.bbox).toEqual([10, 11, 12, 13]);
          expect(content.coordinates).toHaveLength(2);
        },
      };
    },
  };
};
