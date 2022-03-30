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
import { PlanningArea } from '@marxan/planning-area-repository/planning-area.geo.entity';
import { MultiPolygon } from 'geojson';
import { ProjectCustomProtectedAreasPieceExporter } from '@marxan-geoprocessing/export/pieces-exporters/project-custom-protected-areas.piece-exporter';
import { ProtectedArea } from '@marxan/protected-areas';
import { ProjectCustomProtectedAreasContent } from '@marxan/cloning/infrastructure/clone-piece-data/project-custom-protected-areas';

let fixtures: FixtureType<typeof getFixtures>;

describe(ProjectCustomProtectedAreasPieceExporter, () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 10_000);

  afterEach(async () => {
    await fixtures?.cleanUp();
  });

  it('should save empty file when there are not any project custom protected areas', async () => {
    const input = fixtures.GivenAProjectCustomProtectedAreasExportJob();
    await fixtures.GivenProjectExist();
    await fixtures.GivenNoCustomProtectedAreaForProject();
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenAnEmptyProjectCustomProtectedAreasFileIsSaved();
  });
  it('should save file succesfully when there are project custom protected areas', async () => {
    const input = fixtures.GivenAProjectCustomProtectedAreasExportJob();
    await fixtures.GivenProjectExist();
    await fixtures.GivenCustomProtectedAreaForProject();
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenAProjectCustomProtectedAreasFileIsSaved();
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
      TypeOrmModule.forFeature([ProtectedArea]),
      FileRepositoryModule,
    ],
    providers: [
      ProjectCustomProtectedAreasPieceExporter,
      { provide: Logger, useValue: { error: () => {}, setContext: () => {} } },
    ],
  }).compile();

  await sandbox.init();
  const projectId = v4();
  const otherProjectId = v4();
  const organizationId = v4();
  const sut = sandbox.get(ProjectCustomProtectedAreasPieceExporter);
  const apiEntityManager: EntityManager = sandbox.get(
    getEntityManagerToken(geoprocessingConnections.apiDB),
  );
  const fileRepository = sandbox.get(FileRepository);
  const protectedAreasRepository: Repository<ProtectedArea> = sandbox.get(
    getRepositoryToken(ProtectedArea),
  );
  const readSavedFile = async (
    savedStrem: Readable,
  ): Promise<ProjectCustomProtectedAreasContent[]> => {
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
      await protectedAreasRepository.delete({
        projectId: In([projectId, otherProjectId]),
      });
    },
    GivenAProjectCustomProtectedAreasExportJob: (): ExportJobInput => {
      return {
        allPieces: [
          { resourceId: projectId, piece: ClonePiece.ProjectMetadata },
          {
            resourceId: projectId,
            piece: ClonePiece.ProjectCustomProtectedAreas,
          },
        ],
        componentId: v4(),
        exportId: v4(),
        piece: ClonePiece.ProjectMetadata,
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
        })
        .execute();
    },
    GivenNoCustomProtectedAreaForProject: async (): Promise<void> => {
      await protectedAreasRepository.save({
        projectId: otherProjectId,
        fullName: 'custom2',
        theGeom: expectedGeom,
      });
    },
    GivenCustomProtectedAreaForProject: async (): Promise<void> => {
      await protectedAreasRepository.save({
        projectId,
        fullName: 'custom1',
        theGeom: expectedGeom,
      });
    },
    WhenPieceExporterIsInvoked: (input: ExportJobInput) => {
      return {
        ThenAnEmptyProjectCustomProtectedAreasFileIsSaved: async () => {
          const result = await sut.run(input);
          const file = await fileRepository.get(result.uris[0].uri);
          expect((file as Right<Readable>).right).toBeDefined();
          if (isLeft(file)) throw new Error();
          const savedStrem = file.right;
          const content = await readSavedFile(savedStrem);
          expect(content).toEqual([]);
        },
        ThenAProjectCustomProtectedAreasFileIsSaved: async () => {
          const result = await sut.run(input);
          const file = await fileRepository.get(result.uris[0].uri);
          expect((file as Right<Readable>).right).toBeDefined();
          if (isLeft(file)) throw new Error();
          const savedStrem = file.right;
          const content = (await readSavedFile(savedStrem))[0];
          expect(content.fullName).toBe('custom1');
          expect(content.ewkb.length).toBeGreaterThan(0);
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
