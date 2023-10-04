import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import { ProjectCustomFeaturesContent } from '@marxan/cloning/infrastructure/clone-piece-data/project-custom-features';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import { GeoFeatureGeometry } from '@marxan/geofeatures';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Test } from '@nestjs/testing';
import { getEntityManagerToken, TypeOrmModule } from '@nestjs/typeorm';
import { isLeft, Right } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { EntityManager, In } from 'typeorm';
import { v4 } from 'uuid';
import {
  DeleteProjectAndOrganization, GivenCostSurfaceData, GivenCostSurfaces,
  GivenFeatures,
  GivenFeaturesData,
  GivenProjectExists,
  readSavedFile
} from "../fixtures";
import { GeoCloningFilesRepositoryModule } from '@marxan-geoprocessing/modules/cloning-files-repository';
import { FakeLogger } from '@marxan-geoprocessing/utils/__mocks__/fake-logger';
import {
  ProjectCostSurfacesPieceExporter
} from "@marxan-geoprocessing/export/pieces-exporters/project-cost-surfaces.piece-exporter";
import { CostSurfacePuDataEntity } from "@marxan/cost-surfaces";
import { ProjectCostSurfacesContent } from "@marxan/cloning/infrastructure/clone-piece-data/project-cost-surfaces";

let fixtures: FixtureType<typeof getFixtures>;

describe(ProjectCostSurfacesPieceExporter, () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 10_000);

  afterEach(async () => {
    await fixtures?.cleanUp();
  });

  it('saves successfully cost surfaces data', async () => {
    const input = fixtures.GivenAProjectCostSurfacesExportJob();
    await fixtures.GivenProjectExist();
    await fixtures.GivenCostSurfacesForProject();
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenAProjectCostSurfacesFileIsSaved();
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
      TypeOrmModule.forFeature([GeoFeatureGeometry]),
      GeoCloningFilesRepositoryModule,
    ],
    providers: [ProjectCostSurfacesPieceExporter],
  }).compile();

  await sandbox.init();
  sandbox.useLogger(new FakeLogger());

  const projectId = v4();
  const organizationId = v4();
  const sut = sandbox.get(ProjectCostSurfacesPieceExporter);
  const apiEntityManager: EntityManager = sandbox.get(
    getEntityManagerToken(geoprocessingConnections.apiDB),
  );
  const geoEntityManager: EntityManager = sandbox.get(
    getEntityManagerToken(geoprocessingConnections.default),
  );
  const costSurfacesDataRepo = geoEntityManager.getRepository(CostSurfacePuDataEntity);
  const fileRepository = sandbox.get(CloningFilesRepository);


  return {
    cleanUp: async () => {
      await DeleteProjectAndOrganization(
        apiEntityManager,
        projectId,
        organizationId,
      );
      await costSurfacesDataRepo.delete({});

    },
    GivenAProjectCostSurfacesExportJob: (): ExportJobInput => {
      return {
        allPieces: [
          { resourceId: projectId, piece: ClonePiece.ProjectMetadata },
          {
            resourceId: projectId,
            piece: ClonePiece.ProjectCostSurfaces,
          },
        ],
        componentId: v4(),
        exportId: v4(),
        piece: ClonePiece.ProjectCostSurfaces,
        resourceId: projectId,
        resourceKind: ResourceKind.Project,
      };
    },
    GivenProjectExist: async () => {
      return GivenProjectExists(apiEntityManager, projectId, organizationId);
    },
    GivenCostSurfacesForProject: async () => {
      const costSurface = await GivenCostSurfaces(
        apiEntityManager,
        1, 10, 'Cost Surface', projectId
      );

      await GivenCostSurfaceData(
        geoEntityManager,
        projectId,
        costSurface.id,
      );
      return costSurface.id;
    },
    GivenTagOnFeature: async (featureId: string, tag: string) =>
      await apiEntityManager.query(`INSERT INTO project_feature_tags
            (project_id, feature_id, tag)
          VALUES
            ('${projectId}', '${featureId}', '${tag}' ) `),

    WhenPieceExporterIsInvoked: (input: ExportJobInput) => {
      return {
        ThenAProjectCostSurfacesFileIsSaved: async () => {
          const result = await sut.run(input);
          const file = await fileRepository.get(result.uris[0].uri);
          expect((file as Right<Readable>).right).toBeDefined();
          if (isLeft(file)) throw new Error();
          const savedStrem = file.right;
          const content = await readSavedFile<ProjectCostSurfacesContent>(
            savedStrem,
          );
          expect(content.costSurfaces).toHaveLength(2);
          const costSurfacesExported = content.costSurfaces;

          const nonDefaultCostSurface = costSurfacesExported.find((costSurface) => costSurface.name === 'Cost Surface')
          expect(nonDefaultCostSurface).toBeDefined();
          expect(nonDefaultCostSurface?.data).toHaveLength(10);
        },
      };
    },
  };
};
