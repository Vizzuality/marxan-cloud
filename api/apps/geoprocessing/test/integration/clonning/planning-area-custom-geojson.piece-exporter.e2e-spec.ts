import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import { FileRepository, FileRepositoryModule } from '@marxan/files-repository';
import { PlanningUnitGridShape } from '@marxan/scenarios-planning-unit';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  getEntityManagerToken,
  getRepositoryToken,
  TypeOrmModule,
} from '@nestjs/typeorm';
import { Transform } from 'stream';
import { isLeft, Right } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { EntityManager, Repository } from 'typeorm';
import { v4 } from 'uuid';
import { PlanningArea } from '@marxan/planning-area-repository/planning-area.geo.entity';
import { PlanningAreaCustomGeojsonPieceExporter } from '@marxan-geoprocessing/export/pieces-exporters/planning-area-custom-geojson.piece-exporter';
import { MultiPolygon } from 'geojson';

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
  const fileRepository = sandbox.get(FileRepository);
  const planningAreaRepository: Repository<PlanningArea> = sandbox.get(
    getRepositoryToken(PlanningArea),
  );
  const readSavedFile = async (savedStrem: Readable): Promise<MultiPolygon> => {
    let buffer: Buffer;
    const transformer = new Transform({
      transform: (chunk) => {
        buffer = chunk;
      },
    });
    await new Promise<void>((resolve) => {
      savedStrem.on('close', () => {
        resolve();
      });
      savedStrem.on('finish', () => {
        resolve();
      });
      savedStrem.pipe(transformer);
    });
    return JSON.parse(buffer!.toString());
  };

  return {
    cleanUp: async () => {
      await apiEntityManager
        .createQueryBuilder()
        .delete()
        .from('projects')
        .where('id = :projectId', { projectId })
        .execute();
      await apiEntityManager
        .createQueryBuilder()
        .delete()
        .from('organizations')
        .where('id = :organizationId', { organizationId })
        .execute();
      await planningAreaRepository.delete({ projectId });
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
      };
    },
    GivenProjectExist: async (): Promise<void> => {
      await apiEntityManager
        .createQueryBuilder()
        .insert()
        .into('organizations')
        .values({ id: organizationId, name: 'org1' })
        .execute();

      await apiEntityManager
        .createQueryBuilder()
        .insert()
        .into('projects')
        .values({
          id: projectId,
          name: 'name',
          description: 'desc',
          planning_unit_grid_shape: PlanningUnitGridShape.Square,
          organization_id: organizationId,
          planning_unit_area_km2: 500,
          planning_area_geometry_id: planningAreaId,
        })
        .execute();
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
          const content = await readSavedFile(savedStrem);
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
