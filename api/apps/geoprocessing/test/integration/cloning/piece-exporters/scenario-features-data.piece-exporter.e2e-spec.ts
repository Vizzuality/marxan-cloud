import { ScenarioFeaturesDataPieceExporter } from '@marxan-geoprocessing/export/pieces-exporters/scenario-features-data.piece-exporter';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import { ScenarioFeaturesDataContent } from '@marxan/cloning/infrastructure/clone-piece-data/scenario-features-data';
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
  DeleteFeatures,
  DeleteProjectAndOrganization,
  GivenFeatures,
  GivenOutputScenarioFeaturesData,
  GivenScenarioExists,
  readSavedFile,
} from '../fixtures';
import { GeoCloningFilesRepositoryModule } from '@marxan-geoprocessing/modules/cloning-files-repository';
import { FakeLogger } from '@marxan-geoprocessing/utils/__mocks__/fake-logger';

let fixtures: FixtureType<typeof getFixtures>;

describe(ScenarioFeaturesDataPieceExporter, () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 10_000);

  afterEach(async () => {
    await fixtures?.cleanUp();
  });

  it('fails if features data references an unexisting feature', async () => {
    const input = fixtures.GivenAScenarioFeaturesDataExportJob();
    await fixtures.GivenScenarioExist();
    await fixtures.GivenIncorrectScenarioFeaturesData();
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenAFeatureNotFoundErrorShouldBeThrown();
  });

  it("saves an empty file when scenario doesn't have features data", async () => {
    const input = fixtures.GivenAScenarioFeaturesDataExportJob();
    await fixtures.GivenScenarioExist();
    fixtures.GivenNoScenarioFeaturesData();
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenAnEmptyScenarioFeaturesDataFileIsSaved();
  });

  it('saves succesfully scenario features data', async () => {
    const input = fixtures.GivenAScenarioFeaturesDataExportJob();
    await fixtures.GivenScenarioExist();
    await fixtures.GivenScenarioFeaturesData();
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenAScenarioFeaturesDataFileIsSaved();
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
      TypeOrmModule.forFeature([]),
      GeoCloningFilesRepositoryModule,
    ],
    providers: [ScenarioFeaturesDataPieceExporter],
  }).compile();

  await sandbox.init();
  sandbox.useLogger(new FakeLogger());

  const scenarioId = v4();
  const projectId = v4();
  const organizationId = v4();
  const sut = sandbox.get(ScenarioFeaturesDataPieceExporter);
  const apiEntityManager: EntityManager = sandbox.get(
    getEntityManagerToken(geoprocessingConnections.apiDB),
  );
  const geoEntityManager: EntityManager = sandbox.get(
    getEntityManagerToken(geoprocessingConnections.default),
  );
  const featuresDataRepo = geoEntityManager.getRepository(GeoFeatureGeometry);
  const fileRepository = sandbox.get(CloningFilesRepository);

  let featureIds: string[] = [];
  const amountOfCustomFeatures = 3;
  const amountOfPlatformFeatures = 2;
  const recordsOfDataForEachFeature = 3;
  const recordsOfOutputDataForEachScenarioFeaturesData = 2;

  return {
    cleanUp: async () => {
      await DeleteFeatures(apiEntityManager, featureIds);
      await DeleteProjectAndOrganization(
        apiEntityManager,
        projectId,
        organizationId,
      );
      await featuresDataRepo.delete({ featureId: In(featureIds) });
    },
    GivenAScenarioFeaturesDataExportJob: (): ExportJobInput => {
      return {
        allPieces: [
          { resourceId: projectId, piece: ClonePiece.ProjectMetadata },
          {
            resourceId: scenarioId,
            piece: ClonePiece.ScenarioFeaturesData,
          },
        ],
        componentId: v4(),
        exportId: v4(),
        piece: ClonePiece.ScenarioFeaturesData,
        resourceId: scenarioId,
        resourceKind: ResourceKind.Project,
      };
    },
    GivenScenarioExist: () =>
      GivenScenarioExists(
        apiEntityManager,
        scenarioId,
        projectId,
        organizationId,
      ),
    GivenNoScenarioFeaturesData: () => {},
    GivenScenarioFeaturesData: async () => {
      const { customFeatures, platformFeatures } = await GivenFeatures(
        apiEntityManager,
        amountOfPlatformFeatures,
        amountOfCustomFeatures,
        projectId,
      );
      featureIds = [
        ...customFeatures.map((feature) => feature.id),
        ...platformFeatures.map((feature) => feature.id),
      ];
      await GivenOutputScenarioFeaturesData(
        geoEntityManager,
        recordsOfDataForEachFeature,
        recordsOfOutputDataForEachScenarioFeaturesData,
        featureIds,
        scenarioId,
        undefined,
      );
    },
    GivenIncorrectScenarioFeaturesData: async () => {
      await GivenOutputScenarioFeaturesData(
        geoEntityManager,
        recordsOfDataForEachFeature,
        recordsOfOutputDataForEachScenarioFeaturesData,
        [v4()],
        scenarioId,
      );
    },
    WhenPieceExporterIsInvoked: (input: ExportJobInput) => {
      return {
        ThenAFeatureNotFoundErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(
            /feature properties not found/gi,
          );
        },
        ThenAnEmptyScenarioFeaturesDataFileIsSaved: async () => {
          const result = await sut.run(input);
          const file = await fileRepository.get(result.uris[0].uri);
          expect((file as Right<Readable>).right).toBeDefined();
          if (isLeft(file)) throw new Error();
          const savedStrem = file.right;
          const content =
            await readSavedFile<ScenarioFeaturesDataContent>(savedStrem);
          expect(content.featuresData).toEqual([]);
        },
        ThenAScenarioFeaturesDataFileIsSaved: async () => {
          const result = await sut.run(input);
          const file = await fileRepository.get(result.uris[0].uri);
          expect((file as Right<Readable>).right).toBeDefined();
          if (isLeft(file)) throw new Error();
          const savedStrem = file.right;
          const content =
            await readSavedFile<ScenarioFeaturesDataContent>(savedStrem);

          expect(content.featuresData).toHaveLength(
            amountOfCustomFeatures * recordsOfDataForEachFeature +
              amountOfPlatformFeatures * recordsOfDataForEachFeature,
          );

          const data = content.featuresData;

          expect(
            data.flatMap((record) => record.outputFeaturesData),
          ).toHaveLength(
            data.length * recordsOfOutputDataForEachScenarioFeaturesData,
          );

          expect(
            data.every(
              (sfd) =>
                sfd.apiFeature.featureClassName ===
                  sfd.featureDataFeature.featureClassName &&
                sfd.apiFeature.isCustom === sfd.featureDataFeature.isCustom,
            ),
          );
        },
      };
    },
  };
};
