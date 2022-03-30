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
import { EntityManager, In, Repository } from 'typeorm';
import { v4 } from 'uuid';
import {
  PlanningUnitsGeom,
  ProjectsPuEntity,
} from '@marxan-jobs/planning-unit-geometry';
import { Geometry, Polygon } from 'geojson';
import { PlanningUnitsGridGeojsonPieceExporter } from '@marxan-geoprocessing/export/pieces-exporters/planning-units-grid-geojson.piece-exporter';

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
      FileRepositoryModule,
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
  const projectGeoms = [geometry1, geometry3];
  const sut = sandbox.get(PlanningUnitsGridGeojsonPieceExporter);
  const apiEntityManager: EntityManager = sandbox.get(
    getEntityManagerToken(geoprocessingConnections.apiDB),
  );
  const fileRepository = sandbox.get(FileRepository);
  const projectPusRepository: Repository<ProjectsPuEntity> = sandbox.get(
    getRepositoryToken(ProjectsPuEntity),
  );
  const planningUnitsGridRepository: Repository<PlanningUnitsGeom> = sandbox.get(
    getRepositoryToken(PlanningUnitsGeom),
  );

  const readSavedFile = async (
    savedStrem: Readable,
  ): Promise<{
    type: string;
    bbox: number[];
    coordinates: Polygon[];
  }> => {
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
      await projectPusRepository.delete({
        projectId: In([projectId, otherProjectId]),
      });
      await planningUnitsGridRepository.delete({ id: geometry1.id });
      await planningUnitsGridRepository.delete({ id: geometry2.id });
      await planningUnitsGridRepository.delete({ id: geometry3.id });
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
          planning_unit_grid_shape: PlanningUnitGridShape.Hexagon,
          organization_id: organizationId,
          planning_unit_area_km2: 30,
          bbox: JSON.stringify([10, 11, 12, 13]),
        })
        .execute();
    },
    GivenPlanningUnits: async (): Promise<void> => {
      await planningUnitsGridRepository.save(
        projectGeoms.map((geometry) => {
          return {
            id: geometry.id,
            size: 30,
            type: PlanningUnitGridShape.Hexagon,
            theGeom: geometry.geom,
          };
        }),
      );
      await projectPusRepository.save(
        projectGeoms.map((geometry, index) => ({
          geomId: geometry.id,
          geomType: PlanningUnitGridShape.Hexagon,
          projectId,
          puid: index + 1,
        })),
      );

      await planningUnitsGridRepository.save({
        id: geometry2.id,
        size: 50,
        theGeom: geometry2.geom,
        type: PlanningUnitGridShape.Hexagon,
      });
      await projectPusRepository.save({
        geomId: geometry2.id,
        geomType: PlanningUnitGridShape.Hexagon,
        projectId: otherProjectId,
        puid: 80,
      });
    },
    WhenPieceExporterIsInvoked: (input: ExportJobInput) => {
      return {
        ThenAPlanningUnitsGridFileIsSaved: async () => {
          const result = await sut.run(input);
          const file = await fileRepository.get(result.uris[0].uri);
          expect((file as Right<Readable>).right).toBeDefined();
          if (isLeft(file)) throw new Error();
          const savedStrem = file.right;
          const content = await readSavedFile(savedStrem);
          expect(content.type).toBe('MultiPolygon');
          expect(content.bbox).toHaveLength(4);
          expect(content.coordinates).toHaveLength(2);
        },
      };
    },
  };
};

type Geometries = {
  id: string;
  geom: Geometry;
};

const geometry1: Geometries = {
  id: v4(),
  geom: {
    type: 'Polygon',
    coordinates: [
      [
        [-9.91007000579834, 51.65272325936179],
        [-9.91000563278198, 51.65215080080787],
        [-9.907822608947754, 51.65220405307135],
        [-9.907844066619873, 51.6532957106858],
        [-9.91000563278198, 51.65330902342127],
        [-9.91007000579834, 51.65272325936179],
      ],
    ],
  },
};

const geometry2: Geometries = {
  id: v4(),
  geom: {
    type: 'Polygon',
    coordinates: [
      [
        [-9.908766746520996, 51.65438734200841],
        [-9.90965723991394, 51.65394818592163],
        [-9.908895492553711, 51.65398951669091],
        [-9.906202554702759, 51.6539161423378],
        [-9.905773401260376, 51.654413966834184],
        [-9.906063079833984, 51.655252640839656],
        [-9.908766746520996, 51.65438734200841],
      ],
    ],
  },
};

const geometry3: Geometries = {
  id: v4(),
  geom: {
    type: 'Polygon',
    coordinates: [
      [
        [-9.914367198944092, 51.652417061499726],
        [-9.91441011428833, 51.65064639851562],
        [-9.909067153930664, 51.65087272771491],
        [-9.91159915924072, 51.65137863595659],
        [-9.911620616912842, 51.652829762481126],
        [-9.914302825927734, 51.652869701086374],
        [-9.914367198944092, 51.652417061499726],
      ],
    ],
  },
};
