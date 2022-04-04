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
import { EntityManager, Repository } from 'typeorm';
import { v4 } from 'uuid';
import { PlanningAreaCustomPieceExporter } from '@marxan-geoprocessing/export/pieces-exporters/planning-area-custom.piece-exporter';
import { PlanningArea } from '@marxan/planning-area-repository/planning-area.geo.entity';
import { PlanningAreaCustomContent } from '@marxan/cloning/infrastructure/clone-piece-data/planning-area-custom';
import {
  DeletePlanningAreas,
  DeleteProjectAndOrganization,
  GivenPlanningArea,
  GivenProjectExists,
  readSavedFile,
} from './fixtures';

let fixtures: FixtureType<typeof getFixtures>;

describe(PlanningAreaCustomPieceExporter, () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 10_000);

  afterEach(async () => {
    await fixtures?.cleanUp();
  });

  it('should throw when project is not found', async () => {
    const input = fixtures.GivenAPlanningAreaCustomExportJob();
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenAProjectExistErrorShouldBeThrown();
  });
  it('should throw when planning area is not found', async () => {
    const input = fixtures.GivenAPlanningAreaCustomExportJob();
    await fixtures.GivenProjectExist();
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenAPlanningAreatExistErrorShouldBeThrown();
  });
  it('should save file succesfully when project and planning area are found', async () => {
    const input = fixtures.GivenAPlanningAreaCustomExportJob();
    await fixtures.GivenProjectExist();
    await fixtures.GivenPlanningArea();
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenAPlanningAreaCustomFileIsSaved();
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
      PlanningAreaCustomPieceExporter,
      { provide: Logger, useValue: { error: () => {}, setContext: () => {} } },
    ],
  }).compile();

  await sandbox.init();
  const projectId = v4();
  const organizationId = v4();
  const planningAreaId = v4();
  const sut = sandbox.get(PlanningAreaCustomPieceExporter);
  const apiEntityManager: EntityManager = sandbox.get(
    getEntityManagerToken(geoprocessingConnections.apiDB),
  );
  const geoEntityManager: EntityManager = sandbox.get(
    getEntityManagerToken(geoprocessingConnections.default),
  );
  const fileRepository = sandbox.get(FileRepository);
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
        ],
        componentId: v4(),
        exportId: v4(),
        piece: ClonePiece.PlanningAreaCustom,
        resourceId: projectId,
        resourceKind: ResourceKind.Project,
      };
    },
    GivenProjectExist: async () => {
      return GivenProjectExists(apiEntityManager, projectId, organizationId, {
        description: 'desc',
        planning_unit_area_km2: 500,
        planning_area_geometry_id: planningAreaId,
      });
    },
    GivenPlanningArea: async () => {
      return GivenPlanningArea(geoEntityManager, planningAreaId, projectId);
    },
    WhenPieceExporterIsInvoked: (input: ExportJobInput) => {
      return {
        ThenAProjectExistErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(/Project with ID/gi);
        },
        ThenAPlanningAreatExistErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(
            /Custom planning area not found for project with ID/gi,
          );
        },
        ThenAPlanningAreaCustomFileIsSaved: async () => {
          const result = await sut.run(input);
          const file = await fileRepository.get(result.uris[0].uri);
          expect((file as Right<Readable>).right).toBeDefined();
          if (isLeft(file)) throw new Error();
          const savedStrem = file.right;
          const content = await readSavedFile<PlanningAreaCustomContent>(
            savedStrem,
          );
          expect(content.puAreaKm2).toBe(500);
          expect(content.puGridShape).toBe(PlanningUnitGridShape.Square);
          const geom = content.planningAreaGeom;
          expect(geom).toBeDefined();
          expect(geom.length).toBeGreaterThan(0);
        },
      };
    },
  };
};
