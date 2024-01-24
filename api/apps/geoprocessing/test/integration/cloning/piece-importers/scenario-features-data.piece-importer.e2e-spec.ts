import { ScenarioFeaturesDataPieceImporter } from '@marxan-geoprocessing/import/pieces-importers/scenario-features-data.piece-importer';
import { GeoCloningFilesRepositoryModule } from '@marxan-geoprocessing/modules/cloning-files-repository';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ImportJobInput } from '@marxan/cloning';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import {
  ArchiveLocation,
  ClonePiece,
  ResourceKind,
} from '@marxan/cloning/domain';
import { ClonePieceRelativePathResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import { ScenarioFeaturesDataContent } from '@marxan/cloning/infrastructure/clone-piece-data/scenario-features-data';
import { ScenarioFeaturesData } from '@marxan/features';
import { GeoFeatureGeometry } from '@marxan/geofeatures';
import { OutputScenariosFeaturesDataGeoEntity } from '@marxan/marxan-output';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getEntityManagerToken, TypeOrmModule } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { EntityManager, In } from 'typeorm';
import { v4, validate } from 'uuid';
import {
  DeleteFeatures,
  DeleteProjectAndOrganization,
  GivenFeatures,
  GivenFeaturesData,
  GivenScenarioExists,
} from '../fixtures';
import { FakeLogger } from '@marxan-geoprocessing/utils/__mocks__/fake-logger';

function getFeatureClassNameByIdMap(
  features: { id: string; feature_class_name: string }[],
): Record<string, string> {
  const map: Record<string, string> = {};
  features.forEach((feature) => {
    map[feature.id] = feature.feature_class_name;
  });

  return map;
}

let fixtures: FixtureType<typeof getFixtures>;

describe(ScenarioFeaturesDataPieceImporter, () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 10_000);

  afterEach(async () => {
    await fixtures?.cleanUp();
  });

  it('fails when scenario features data file uri is missing in uris array', async () => {
    const input = fixtures.GivenJobInputWithoutUris();
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenAnUrisArrayErrorShouldBeThrown();
  });

  it('fails when the file cannot be retrieved from file repo', async () => {
    const archiveLocation =
      fixtures.GivenNoScenarioFeaturesDataFileIsAvailable();
    const input = fixtures.GivenJobInput(archiveLocation);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenADataNotAvailableErrorShouldBeThrown();
  });

  it('fails when a feature cannot be found', async () => {
    await fixtures.GivenScenario();
    const archiveLocation =
      await fixtures.GivenScenarioFeaturesDataWithAnUnknownFeatureFile();
    const input = fixtures.GivenJobInput(archiveLocation);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenAFeaturesNotFoundErrorShouldBeThrown();
  });

  it('imports scenario features data', async () => {
    await fixtures.GivenScenario();
    const archiveLocation = await fixtures.GivenValidScenarioFeaturesDataFile();
    const input = fixtures.GivenJobInput(archiveLocation);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenScenarioFeaturesDataShouldBeImported();
  });
});

const getFixtures = async () => {
  const sandbox = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        ...geoprocessingConnections.default,
        keepConnectionAlive: true,
        logging: false,
      }),
      TypeOrmModule.forRoot({
        ...geoprocessingConnections.apiDB,
        keepConnectionAlive: true,
        logging: false,
      }),
      TypeOrmModule.forFeature([]),
      TypeOrmModule.forFeature([], geoprocessingConnections.apiDB.name),
      GeoCloningFilesRepositoryModule,
    ],
    providers: [ScenarioFeaturesDataPieceImporter],
  }).compile();

  await sandbox.init();
  sandbox.useLogger(new FakeLogger());

  const resourceKind = ResourceKind.Project;
  const oldScenarioId = v4();
  const scenarioId = v4();
  const projectId = v4();
  const organizationId = v4();
  const userId = v4();

  const geoEntityManager = sandbox.get<EntityManager>(getEntityManagerToken());
  const apiEntityManager = sandbox.get<EntityManager>(
    getEntityManagerToken(geoprocessingConnections.apiDB.name),
  );
  const featuresDataRepo = geoEntityManager.getRepository(GeoFeatureGeometry);
  const scenarioFeaturesDataRepo =
    geoEntityManager.getRepository(ScenarioFeaturesData);
  const outputScenarioFeaturesDataRepo = geoEntityManager.getRepository(
    OutputScenariosFeaturesDataGeoEntity,
  );
  const sut = sandbox.get(ScenarioFeaturesDataPieceImporter);
  const fileRepository = sandbox.get(CloningFilesRepository);

  let scenarioFeaturesDataFile: ScenarioFeaturesDataContent;
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
    GivenScenario: () =>
      GivenScenarioExists(
        apiEntityManager,
        scenarioId,
        projectId,
        organizationId,
      ),
    GivenJobInput: (archiveLocation: ArchiveLocation): ImportJobInput => {
      const relativePath = ClonePieceRelativePathResolver.resolveFor(
        ClonePiece.ScenarioFeaturesData,
        { kind: resourceKind, scenarioId: oldScenarioId },
      );
      return {
        componentId: v4(),
        pieceResourceId: scenarioId,
        importId: v4(),
        projectId,
        piece: ClonePiece.ScenarioFeaturesData,
        resourceKind,
        uris: [{ relativePath, uri: archiveLocation.value }],
        ownerId: userId,
      };
    },
    GivenJobInputWithoutUris: (): ImportJobInput => {
      return {
        componentId: v4(),
        pieceResourceId: scenarioId,
        importId: v4(),
        projectId,
        piece: ClonePiece.ScenarioFeaturesData,
        resourceKind,
        uris: [],
        ownerId: userId,
      };
    },
    GivenNoScenarioFeaturesDataFileIsAvailable: () => {
      return new ArchiveLocation('not found');
    },
    GivenScenarioFeaturesDataWithAnUnknownFeatureFile: async () => {
      const relativePath = ClonePieceRelativePathResolver.resolveFor(
        ClonePiece.ScenarioFeaturesData,
        { kind: resourceKind, scenarioId: oldScenarioId },
      );

      scenarioFeaturesDataFile = {
        featuresData: [
          {
            currentArea: 100,
            apiFeature: {
              featureClassName: `unexisting-feature-${projectId}`,
              isCustom: true,
            },
            featureDataFeature: {
              featureClassName: `unexisting-feature-${projectId}`,
              isCustom: true,
            },
            featureDataHash: 'dfab2cf607d4f2dbbf2fbf18b8a73414',
            featureId: 123456,
            outputFeaturesData: [],
            totalArea: 100,
          },
        ],
      };

      const exportId = v4();

      const uriOrError = await fileRepository.saveCloningFile(
        exportId,
        Readable.from(JSON.stringify(scenarioFeaturesDataFile)),
        relativePath,
      );

      if (isLeft(uriOrError)) throw new Error("couldn't save file");
      return new ArchiveLocation(uriOrError.right);
    },
    GivenValidScenarioFeaturesDataFile: async () => {
      const relativePath = ClonePieceRelativePathResolver.resolveFor(
        ClonePiece.ScenarioFeaturesData,
        { kind: resourceKind, scenarioId: oldScenarioId },
      );

      const { customFeatures, platformFeatures } = await GivenFeatures(
        apiEntityManager,
        amountOfPlatformFeatures,
        amountOfCustomFeatures,
        projectId,
      );
      const customFeaturesIds = customFeatures.map((feature) => feature.id);
      const platformFeaturesIds = platformFeatures.map((feature) => feature.id);

      const customFeatureNameById = getFeatureClassNameByIdMap(customFeatures);
      const platformFeatureNameById =
        getFeatureClassNameByIdMap(platformFeatures);

      featureIds = [...customFeaturesIds, ...platformFeaturesIds];

      const customFeaturesData = await GivenFeaturesData(
        geoEntityManager,
        recordsOfDataForEachFeature,
        customFeaturesIds,
      );
      const platformFeaturesData = await GivenFeaturesData(
        geoEntityManager,
        recordsOfDataForEachFeature,
        platformFeaturesIds,
      );

      const getFeatureDataElements = (
        featuresData: {
          id: string;
          hash: string;
          feature_id: string;
        }[],
        nameByIdMap: Record<string, string>,
        opts: { isCustom: boolean },
      ) =>
        featuresData.flatMap((data, index) => ({
          apiFeature: {
            featureClassName: nameByIdMap[data.feature_id],
            isCustom: opts.isCustom,
          },
          featureDataFeature: {
            featureClassName: nameByIdMap[data.feature_id],
            isCustom: opts.isCustom,
          },
          featureDataHash: data.hash,
          totalArea: 100,
          currentArea: 100,
          featureId: index,
          outputFeaturesData: Array(
            recordsOfOutputDataForEachScenarioFeaturesData,
          )
            .fill(0)
            .map((_, outputIndex) => ({
              runId: outputIndex + 1,
              totalArea: 100,
            })),
        }));

      scenarioFeaturesDataFile = {
        featuresData: [
          ...getFeatureDataElements(customFeaturesData, customFeatureNameById, {
            isCustom: true,
          }),
          ...getFeatureDataElements(
            platformFeaturesData,
            platformFeatureNameById,
            { isCustom: false },
          ),
        ],
      };

      const exportId = v4();

      const uriOrError = await fileRepository.saveCloningFile(
        exportId,
        Readable.from(JSON.stringify(scenarioFeaturesDataFile)),
        relativePath,
      );

      if (isLeft(uriOrError)) throw new Error("couldn't save file");
      return new ArchiveLocation(uriOrError.right);
    },
    WhenPieceImporterIsInvoked: (input: ImportJobInput) => {
      return {
        ThenAnUrisArrayErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(/uris/gi);
        },
        ThenADataNotAvailableErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(
            /file with piece data for/gi,
          );
        },
        ThenAFeaturesNotFoundErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(/features not found/gi);
        },
        ThenScenarioFeaturesDataShouldBeImported: async () => {
          await sut.run(input);

          const scenarioFeaturesData = await scenarioFeaturesDataRepo.find({
            where: { scenarioId },
            relations: ['featureData'],
          });
          const outputScenarioFeaturesData =
            await outputScenarioFeaturesDataRepo.find({
              where: {
                scenarioFeaturesId: In(
                  scenarioFeaturesData.map((data) => data.id),
                ),
              },
            });

          const expectedAmountOfScenarioFeaturesDataRecords =
            (amountOfCustomFeatures + amountOfPlatformFeatures) *
            recordsOfDataForEachFeature;

          expect(scenarioFeaturesData).toHaveLength(
            expectedAmountOfScenarioFeaturesDataRecords,
          );

          expect(
            scenarioFeaturesData.every(
              ({ featureData, apiFeatureId }) =>
                featureData.featureId === apiFeatureId,
            ),
          ).toEqual(true);

          const [scenarioFeatureData] = scenarioFeaturesData;
          expect(validate(scenarioFeatureData.featureDataId)).toBe(true);
          expect(scenarioFeatureData.scenarioId).toBe(scenarioId);

          expect(outputScenarioFeaturesData).toHaveLength(
            expectedAmountOfScenarioFeaturesDataRecords *
              recordsOfOutputDataForEachScenarioFeaturesData,
          );
        },
      };
    },
  };
};
