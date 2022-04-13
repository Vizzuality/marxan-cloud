import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import { FileRepository, FileRepositoryModule } from '@marxan/files-repository';
import { PlanningUnitGridShape } from '@marxan/scenarios-planning-unit';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getEntityManagerToken, TypeOrmModule } from '@nestjs/typeorm';
import { isLeft, Right } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { EntityManager, In, Repository } from 'typeorm';
import { v4 } from 'uuid';
import { PlanningUnitsGridPieceExporter } from '@marxan-geoprocessing/export/pieces-exporters/planning-units-grid.piece-exporter';
import {
  PlanningUnitsGeom,
  ProjectsPuEntity,
} from '@marxan-jobs/planning-unit-geometry';
import {
  DeleteProjectAndOrganization,
  DeleteProjectPus,
  GivenProjectExists,
  GivenProjectPus,
  readSavedFile,
} from '../fixtures';

let fixtures: FixtureType<typeof getFixtures>;

describe(PlanningUnitsGridPieceExporter, () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 10_000);

  afterEach(async () => {
    await fixtures?.cleanUp();
  });

  it('should save succesfully project planning units grid', async () => {
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
      PlanningUnitsGridPieceExporter,
      { provide: Logger, useValue: { error: () => {}, setContext: () => {} } },
    ],
  }).compile();

  await sandbox.init();
  const projectId = v4();
  const otherProjectId = v4();
  const organizationId = v4();
  const sut = sandbox.get(PlanningUnitsGridPieceExporter);
  const apiEntityManager: EntityManager = sandbox.get(
    getEntityManagerToken(geoprocessingConnections.apiDB),
  );
  const geoEntityManager: EntityManager = sandbox.get(
    getEntityManagerToken(geoprocessingConnections.default),
  );
  const fileRepository = sandbox.get(FileRepository);

  const readAndParseSavedFile = async (
    savedStrem: Readable,
  ): Promise<
    {
      puid: number;
      geom: number[];
    }[]
  > => {
    const result = await readSavedFile<string>(savedStrem, {
      parseBuffer: false,
    });
    return parsePus(result);
  };

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
            piece: ClonePiece.PlanningUnitsGrid,
          },
        ],
        componentId: v4(),
        exportId: v4(),
        piece: ClonePiece.PlanningUnitsGrid,
        resourceId: projectId,
        resourceKind: ResourceKind.Project,
        isCloning: false,
      };
    },
    GivenProjectExist: async () => {
      return GivenProjectExists(apiEntityManager, projectId, organizationId, {
        description: 'desc',
        planning_unit_grid_shape: PlanningUnitGridShape.FromShapefile,
        planning_unit_area_km2: 30,
      });
    },
    GivenPlanningUnits: async (): Promise<void> => {
      await GivenProjectPus(geoEntityManager, projectId, 2);

      await GivenProjectPus(geoEntityManager, otherProjectId, 1);
    },
    WhenPieceExporterIsInvoked: (input: ExportJobInput) => {
      return {
        ThenAPlanningUnitsGridFileIsSaved: async () => {
          const result = await sut.run(input);
          const file = await fileRepository.get(result.uris[0].uri);
          expect((file as Right<Readable>).right).toBeDefined();
          if (isLeft(file)) throw new Error();
          const savedStrem = file.right;
          const content = await readAndParseSavedFile(savedStrem);
          expect(content.every((pu) => pu.puid === 1 || pu.puid === 2)).toBe(
            true,
          );
          expect(content.every((pu) => pu.geom.length > 0)).toBe(true);
          expect(content).toHaveLength(2);
        },
      };
    },
  };
};

const parsePus = (pus: string) => {
  const lastNewLineIndex = pus.lastIndexOf('\n');
  const processableData = pus.substring(0, lastNewLineIndex);
  const res = processableData.split('\n').map((pu) => {
    const regex = /^(\d+),(\[(\d+,)*\d+\])$/gi;
    const result = regex.exec(pu);
    if (result) {
      const [_, puid, geom] = result;
      return {
        puid: parseInt(puid),
        geom: JSON.parse(geom) as number[],
      };
    }
    throw new Error('unknown line format');
  });
  return res;
};
