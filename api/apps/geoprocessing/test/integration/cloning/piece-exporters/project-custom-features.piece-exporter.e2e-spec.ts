import { ProjectCustomFeaturesPieceExporter } from '@marxan-geoprocessing/export/pieces-exporters/project-custom-features.piece-exporter';
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
  DeleteProjectAndOrganization,
  GivenFeatures,
  GivenFeaturesData,
  GivenProjectExists,
  readSavedFile,
} from '../fixtures';
import { GeoCloningFilesRepositoryModule } from '@marxan-geoprocessing/modules/cloning-files-repository';
import { FakeLogger } from '@marxan-geoprocessing/utils/__mocks__/fake-logger';

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
    const featureIds = await fixtures.GivenCustomFeaturesForProject();
    await fixtures.GivenTagOnFeature(featureIds[0], 'tagged');
    await fixtures.GivenTagOnFeature(featureIds[1], 'also-tagged');
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenAProjectCustomFeaturesFileIsSaved({
        isLegacy: false,
        tags: ['tagged', 'also-tagged', null, null, null],
      });
  });

  it('saves succesfully features data when the project has legacy feature', async () => {
    const input = fixtures.GivenAProjectCustomFeaturesExportJob();
    await fixtures.GivenProjectExist();
    await fixtures.GivenCustomFeaturesForProject({ isLegacy: true });
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenAProjectCustomFeaturesFileIsSaved({ isLegacy: true });
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
    providers: [ProjectCustomFeaturesPieceExporter],
  }).compile();

  await sandbox.init();
  sandbox.useLogger(new FakeLogger());

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
  const fileRepository = sandbox.get(CloningFilesRepository);

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
      await apiEntityManager
        .createQueryBuilder()
        .delete()
        .from('project_feature_tags', 'pft')
        .where({ featureId: In(featureIds) });
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
      };
    },
    GivenProjectExist: async () => {
      return GivenProjectExists(apiEntityManager, projectId, organizationId);
    },
    GivenNoCustomFeaturesForProject: () => {},
    GivenCustomFeaturesForProject: async (
      opts: { isLegacy: boolean } = { isLegacy: false },
    ) => {
      const { customFeatures } = await GivenFeatures(
        apiEntityManager,
        0,
        amountOfCustomFeatures,
        projectId,
        opts.isLegacy,
      );
      featureIds = customFeatures.map((feature) => feature.id);
      await GivenFeaturesData(
        geoEntityManager,
        recordsOfDataForEachCustomFeature,
        featureIds,
      );
      return featureIds;
    },
    GivenTagOnFeature: async (featureId: string, tag: string) =>
      await apiEntityManager.query(`INSERT INTO project_feature_tags
            (project_id, feature_id, tag)
          VALUES
            ('${projectId}', '${featureId}', '${tag}' ) `),

    WhenPieceExporterIsInvoked: (input: ExportJobInput) => {
      return {
        ThenAnEmptyProjectCustomFeaturesFileIsSaved: async () => {
          const result = await sut.run(input);
          const file = await fileRepository.get(result.uris[0].uri);
          expect((file as Right<Readable>).right).toBeDefined();
          if (isLeft(file)) throw new Error();
          const savedStrem = file.right;
          const content =
            await readSavedFile<ProjectCustomFeaturesContent>(savedStrem);
          expect(content.features).toEqual([]);
        },
        ThenAProjectCustomFeaturesFileIsSaved: async (
          opts: { isLegacy: boolean; tags?: (string | null)[] } = {
            isLegacy: false,
          },
        ) => {
          const result = await sut.run(input);
          const file = await fileRepository.get(result.uris[0].uri);
          expect((file as Right<Readable>).right).toBeDefined();
          if (isLeft(file)) throw new Error();
          const savedStrem = file.right;
          const content =
            await readSavedFile<ProjectCustomFeaturesContent>(savedStrem);
          expect(content.features).toHaveLength(amountOfCustomFeatures);
          const featuresExported = content.features;
          const expectedFeatureNames = Array(amountOfCustomFeatures)
            .fill(0)
            .map((_, index) => `custom-${projectId}-${index}`);

          if (opts.tags && opts.tags.length) {
            expect(featuresExported.map((feature) => feature.tag)).toEqual(
              opts.tags,
            );
          }
          expect(
            featuresExported.every(
              ({ is_legacy, data, feature_class_name }) =>
                is_legacy === opts.isLegacy &&
                data.length === recordsOfDataForEachCustomFeature &&
                expectedFeatureNames.includes(feature_class_name),
            ),
          );
        },
      };
    },
  };
};
