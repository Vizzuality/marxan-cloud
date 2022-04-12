import { ProjectCustomFeaturesPieceExporter } from '@marxan-geoprocessing/export/pieces-exporters/project-custom-features.piece-exporter';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import { ProjectCustomFeaturesContent } from '@marxan/cloning/infrastructure/clone-piece-data/project-custom-features';
import { FileRepository, FileRepositoryModule } from '@marxan/files-repository';
import { GeoFeatureGeometry } from '@marxan/geofeatures';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getEntityManagerToken, TypeOrmModule } from '@nestjs/typeorm';
import { isLeft, Right } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { EntityManager, In } from 'typeorm';
import { v4 } from 'uuid';
import {
  DeleteProjectAndOrganization,
  GivenFeatures,
  GivenFeaturesData,
  GivenProjectExists,
  readSavedFile,
} from './fixtures';

let fixtures: FixtureType<typeof getFixtures>;

describe(ProjectCustomFeaturesPieceExporter, () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 10_000);

  afterEach(async () => {
    await fixtures?.cleanUp();
  });

  it("saves an empty file when project doesn't have custom features", async () => {
    const input = fixtures.GivenAProjectCustomFeaturesExportJob();
    await fixtures.GivenProjectExist();
    fixtures.GivenNoCustomFeaturesForProject();
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenAnEmptyProjectCustomFeaturesFileIsSaved();
  });

  it('saves succesfully features data when the project has custom features', async () => {
    const input = fixtures.GivenAProjectCustomFeaturesExportJob();
    await fixtures.GivenProjectExist();
    await fixtures.GivenCustomFeaturesForProject();
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenAProjectCustomFeaturesFileIsSaved();
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
      FileRepositoryModule,
    ],
    providers: [
      ProjectCustomFeaturesPieceExporter,
      { provide: Logger, useValue: { error: () => {}, setContext: () => {} } },
    ],
  }).compile();

  await sandbox.init();
  const projectId = v4();
  const organizationId = v4();
  const sut = sandbox.get(ProjectCustomFeaturesPieceExporter);
  const apiEntityManager: EntityManager = sandbox.get(
    getEntityManagerToken(geoprocessingConnections.apiDB),
  );
  const geoEntityManager: EntityManager = sandbox.get(
    getEntityManagerToken(geoprocessingConnections.default),
  );
  const featuresDataRepo = geoEntityManager.getRepository(GeoFeatureGeometry);
  const fileRepository = sandbox.get(FileRepository);

  let featureIds: string[] = [];
  const amountOfCustomFeatures = 5;
  const recordsOfDataForEachCustomFeature = 3;

  return {
    cleanUp: async () => {
      await DeleteProjectAndOrganization(
        apiEntityManager,
        projectId,
        organizationId,
      );
      await featuresDataRepo.delete({ featureId: In(featureIds) });
    },
    GivenAProjectCustomFeaturesExportJob: (): ExportJobInput => {
      return {
        allPieces: [
          { resourceId: projectId, piece: ClonePiece.ProjectMetadata },
          {
            resourceId: projectId,
            piece: ClonePiece.ProjectCustomFeatures,
          },
        ],
        componentId: v4(),
        exportId: v4(),
        piece: ClonePiece.ProjectCustomFeatures,
        resourceId: projectId,
        resourceKind: ResourceKind.Project,
        isCloning: false,
      };
    },
    GivenProjectExist: async () => {
      return GivenProjectExists(apiEntityManager, projectId, organizationId);
    },
    GivenNoCustomFeaturesForProject: () => {},
    GivenCustomFeaturesForProject: async () => {
      const { customFeatures } = await GivenFeatures(
        apiEntityManager,
        0,
        amountOfCustomFeatures,
        projectId,
      );
      featureIds = customFeatures.map((feature) => feature.id);
      await GivenFeaturesData(
        geoEntityManager,
        recordsOfDataForEachCustomFeature,
        featureIds,
      );
    },
    WhenPieceExporterIsInvoked: (input: ExportJobInput) => {
      return {
        ThenAnEmptyProjectCustomFeaturesFileIsSaved: async () => {
          const result = await sut.run(input);
          const file = await fileRepository.get(result.uris[0].uri);
          expect((file as Right<Readable>).right).toBeDefined();
          if (isLeft(file)) throw new Error();
          const savedStrem = file.right;
          const content = await readSavedFile<ProjectCustomFeaturesContent>(
            savedStrem,
          );
          expect(content.features).toEqual([]);
        },
        ThenAProjectCustomFeaturesFileIsSaved: async () => {
          const result = await sut.run(input);
          const file = await fileRepository.get(result.uris[0].uri);
          expect((file as Right<Readable>).right).toBeDefined();
          if (isLeft(file)) throw new Error();
          const savedStrem = file.right;
          const content = await readSavedFile<ProjectCustomFeaturesContent>(
            savedStrem,
          );
          expect(content.features).toHaveLength(amountOfCustomFeatures);
          const { feature_class_name, data } = content.features[0];
          expect(feature_class_name).toEqual(`custom-${projectId}-1`);
          expect(data).toHaveLength(recordsOfDataForEachCustomFeature);
        },
      };
    },
  };
};
