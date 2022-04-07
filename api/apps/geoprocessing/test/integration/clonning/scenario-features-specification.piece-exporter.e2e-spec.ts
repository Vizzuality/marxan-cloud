import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import { FileRepository, FileRepositoryModule } from '@marxan/files-repository';
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
  GivenScenarioExists,
  GivenScenarioFeaturesData,
  GivenSpecificationFeaturesConfig,
  GivenSpecifications,
  readSavedFile,
  TestSpecification,
} from './fixtures';
import { ScenarioFeaturesSpecificationPieceExporter } from '@marxan-geoprocessing/export/pieces-exporters/scenario-features-specification.piece-exporter';
import { ScenarioFeaturesSpecificationContent } from '@marxan/cloning/infrastructure/clone-piece-data/scenario-features-specification';
import { GeoFeatureGeometry } from '@marxan/geofeatures';
import { ScenarioFeaturesData } from '@marxan/features';

let fixtures: FixtureType<typeof getFixtures>;

type Features = {
  id: string;
  feature_class_name: string;
  tag: string;
  creation_status: string;
  project_id: string | null;
};

describe(ScenarioFeaturesSpecificationPieceExporter, () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 10_000);

  afterEach(async () => {
    await fixtures?.cleanUp();
  });

  it('should save empty scenario features specification file', async () => {
    const input = fixtures.GivenAScenarioFeaturesSpecificationExportJob();
    await fixtures.GivenNoScenarioFeaturesSpecification();
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenAnEmptyScenarioFeaturesSpecificationFileIsSaved();
  });

  it('should save succesfully scenario custom features specification', async () => {
    const input = fixtures.GivenAScenarioFeaturesSpecificationExportJob();
    await fixtures.GivenScenarioExist();
    await fixtures.GivenCustomFeaturesExist();
    await fixtures.GivenScenarioSpecification();
    await fixtures.GivenScenarioFeaturesDataExist();
    await fixtures.GivenScenarioSpecificationFeaturesConfigExist(2);
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenAScenarioFeaturesSpecificationFileIsSaved();
  });
  it('should save succesfully scenario platform features specification', async () => {
    const input = fixtures.GivenAScenarioFeaturesSpecificationExportJob();
    await fixtures.GivenScenarioExist();
    await fixtures.GivenPlatformFeaturesExist();
    await fixtures.GivenScenarioSpecification();
    await fixtures.GivenScenarioFeaturesDataExist();
    await fixtures.GivenScenarioSpecificationFeaturesConfigExist(2);
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenAScenarioFeaturesSpecificationFileIsSaved({ customFeatures: false });
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
      TypeOrmModule.forFeature([GeoFeatureGeometry, ScenarioFeaturesData]),
      FileRepositoryModule,
    ],
    providers: [
      ScenarioFeaturesSpecificationPieceExporter,
      { provide: Logger, useValue: { error: () => {}, setContext: () => {} } },
    ],
  }).compile();

  await sandbox.init();
  const projectId = v4();
  const scenarioId = v4();
  const organizationId = v4();
  let feature: Features;
  let specification: TestSpecification;
  let scenarioFeatureDataIds: string[] = [];
  const sut = sandbox.get(ScenarioFeaturesSpecificationPieceExporter);
  const apiEntityManager: EntityManager = sandbox.get(
    getEntityManagerToken(geoprocessingConnections.apiDB),
  );
  const geoEntityManager: EntityManager = sandbox.get(
    getEntityManagerToken(geoprocessingConnections.default),
  );
  const fileRepository = sandbox.get(FileRepository);

  const getFeatureName = (
    opts: {
      customFeatures: boolean;
    } = { customFeatures: true },
  ) => {
    return opts.customFeatures
      ? `custom-${projectId}-1/project`
      : `platform-${projectId}-1/platform`;
  };

  return {
    cleanUp: async () => {
      await DeleteProjectAndOrganization(
        apiEntityManager,
        projectId,
        scenarioId,
      );
      await geoEntityManager.getRepository(GeoFeatureGeometry).delete({
        id: In([...scenarioFeatureDataIds]),
      });
    },
    GivenAScenarioFeaturesSpecificationExportJob: (): ExportJobInput => {
      return {
        allPieces: [
          { resourceId: projectId, piece: ClonePiece.ProjectMetadata },
          {
            resourceId: scenarioId,
            piece: ClonePiece.FeaturesSpecification,
          },
        ],
        componentId: v4(),
        exportId: v4(),
        piece: ClonePiece.FeaturesSpecification,
        resourceId: scenarioId,
        resourceKind: ResourceKind.Project,
      };
    },
    GivenScenarioExist: async () => {
      return GivenScenarioExists(
        apiEntityManager,
        scenarioId,
        projectId,
        organizationId,
      );
    },
    GivenCustomFeaturesExist: async () => {
      const { customFeatures } = await GivenFeatures(
        apiEntityManager,
        0,
        1,
        projectId,
      );
      feature = customFeatures[0];
    },
    GivenPlatformFeaturesExist: async () => {
      const { platformFeatures } = await GivenFeatures(
        apiEntityManager,
        1,
        0,
        projectId,
      );
      feature = platformFeatures[0];
    },
    GivenScenarioFeaturesDataExist: async () => {
      scenarioFeatureDataIds = await GivenScenarioFeaturesData(
        geoEntityManager,
        2,
        [feature.id],
        scenarioId,
        { specificationId: specification.id },
      );
    },
    GivenScenarioSpecification: async () => {
      const specifications = await GivenSpecifications(
        apiEntityManager,
        [feature.id],
        scenarioId,
      );
      specification = specifications[0];
    },
    GivenScenarioSpecificationFeaturesConfigExist: async (
      featuresConfigsPerSpecification: number,
    ) => {
      const features = scenarioFeatureDataIds.map((featureId) => ({
        featureId,
        calculated: true,
      }));
      await GivenSpecificationFeaturesConfig(
        apiEntityManager,
        feature.id,
        [specification],
        featuresConfigsPerSpecification,
        { features: JSON.stringify(features) },
      );
    },
    GivenNoScenarioFeaturesSpecification: async (): Promise<void> => {},
    WhenPieceExporterIsInvoked: (input: ExportJobInput) => {
      return {
        ThenAnEmptyScenarioFeaturesSpecificationFileIsSaved: async () => {
          const result = await sut.run(input);
          const file = await fileRepository.get(result.uris[0].uri);
          expect((file as Right<Readable>).right).toBeDefined();
          if (isLeft(file)) throw new Error();
          const savedStrem = file.right;
          const content = await readSavedFile(savedStrem);
          expect(content).toEqual([]);
        },
        ThenAScenarioFeaturesSpecificationFileIsSaved: async (
          opts: {
            customFeatures: boolean;
          } = { customFeatures: true },
        ) => {
          const result = await sut.run(input);
          const file = await fileRepository.get(result.uris[0].uri);
          expect((file as Right<Readable>).right).toBeDefined();
          if (isLeft(file)) throw new Error();
          const savedStrem = file.right;
          const [specification] = await readSavedFile<
            ScenarioFeaturesSpecificationContent[]
          >(savedStrem);
          const featureName = getFeatureName(opts);
          const expectedRaw = {
            status: 'any',
            features: [
              {
                featureId: featureName,
                innerObject: {
                  featureId: featureName,
                  innnerObject: {
                    featureId: featureName,
                  },
                },
              },
            ],
          };
          expect(specification.raw).toEqual(expectedRaw);
          expect(
            specification.configs.every((config) => {
              return (
                config.againstFeature === null &&
                config.baseFeature === featureName &&
                config.featuresDetermined === false &&
                config.splitByProperty === null &&
                config.selectSubSets === null
              );
            }),
          ).toEqual(true);

          specification.configs.forEach((config) => {
            expect(config.features).toEqual(
              scenarioFeatureDataIds.map((featureId, index) => ({
                featureId: index + 1,
                calculated: true,
              })),
            );
          });
        },
      };
    },
  };
};
