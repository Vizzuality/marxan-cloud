import { ScenarioFeaturesSpecificationPieceImporter } from '@marxan-geoprocessing/import/pieces-importers/scenario-features-specification.piece-importer';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ImportJobInput } from '@marxan/cloning';
import {
  ArchiveLocation,
  ClonePiece,
  ResourceKind,
} from '@marxan/cloning/domain';
import { ClonePieceRelativePathResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import {
  FeatureNumberCalculated,
  ScenarioFeaturesSpecificationContent,
} from '@marxan/cloning/infrastructure/clone-piece-data/scenario-features-specification';
import { ScenarioFeaturesData } from '@marxan/features';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import { GeoFeatureGeometry } from '@marxan/geofeatures';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getEntityManagerToken, TypeOrmModule } from '@nestjs/typeorm';
import { EntityManager, In } from 'typeorm';
import { v4 } from 'uuid';
import {
  DeleteFeatures,
  DeleteProjectAndOrganization,
  GivenFeatures,
  GivenFeaturesData,
  GivenScenarioExists,
  GivenScenarioFeaturesData,
} from '../fixtures';
import { FeaturesConfig } from '@marxan/cloning/infrastructure/clone-piece-data/scenario-features-specification';
import { isDefined } from '@marxan/utils';
import { Readable } from 'stream';
import { isLeft } from 'fp-ts/lib/Either';
import { GeoCloningFilesRepositoryModule } from '@marxan-geoprocessing/modules/cloning-files-repository';

function getFeatureClassNameByIdMap(
  features: {
    id: string;
    feature_class_name: string;
    project_id: string | null;
  }[],
): Record<string, string> {
  const map: Record<string, string> = {};
  features.forEach((feature) => {
    const value = feature.project_id ? 'project' : 'platform';
    map[feature.id] = `${feature.feature_class_name}/${value}`;
  });

  return map;
}

let fixtures: FixtureType<typeof getFixtures>;

describe(ScenarioFeaturesSpecificationPieceImporter, () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 10_000);

  afterEach(async () => {
    await fixtures?.cleanUp();
  });

  it('fails when scenario features specification data file uri is missing in uris array', async () => {
    const input = fixtures.GivenJobInputWithoutUris();
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenAnUrisArrayErrorShouldBeThrown();
  });

  it('fails when the file cannot be retrieved from file repo', async () => {
    const archiveLocation = fixtures.GivenNoScenarioFeaturesDataFileIsAvailable();
    const input = fixtures.GivenJobInput(archiveLocation);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenADataNotAvailableErrorShouldBeThrown();
  });

  it('imports empty scenario features specification', async () => {
    await fixtures.GivenScenario();
    const archiveLocation = await fixtures.GivenEmptyScenarioFeaturesSpecificationFile();
    const input = fixtures.GivenJobInput(archiveLocation);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenNoScenarioFeaturesDataShouldBeImported();
  });

  it('imports scenario features specification', async () => {
    await fixtures.GivenScenario();
    const archiveLocation = await fixtures.GivenValidScenarioFeaturesSpecificationFile();
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
    providers: [
      ScenarioFeaturesSpecificationPieceImporter,
      { provide: Logger, useValue: { error: () => {}, setContext: () => {} } },
    ],
  }).compile();

  await sandbox.init();
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
  const scenarioFeaturesDataRepo = geoEntityManager.getRepository(
    ScenarioFeaturesData,
  );
  const sut = sandbox.get(ScenarioFeaturesSpecificationPieceImporter);
  const fileRepository = sandbox.get(CloningFilesRepository);

  let validScenarioFeaturesDataFile: ScenarioFeaturesSpecificationContent[];
  let featureIds: string[] = [];
  const amountOfCustomFeatures = 3;
  const amountOfPlatformFeatures = 2;
  const recordsOfDataForEachFeature = 3;

  let expectedRaws: Record<string, any> = [];

  const setExpectedRaws = (
    customFeatureId: string,
    plaformFeatureId: string,
  ) => {
    expectedRaws = [
      {
        status: 'create',
        features: [
          {
            featureId: customFeatureId,
            innerObjts: [
              { featureId: customFeatureId, nullValue: null },
              { featureId: customFeatureId },
            ],
            emptyArray: [],
            emptyObject: {},
          },
        ],
        featureId: customFeatureId,
      },
      {
        status: 'create',
        features: [
          {
            featureId: plaformFeatureId,
            innerObjts: [
              { featureId: plaformFeatureId, nullValue: null },
              { featureId: plaformFeatureId },
            ],
            emptyArray: [],
            emptyObject: {},
          },
        ],
        featureId: plaformFeatureId,
      },
    ];
  };

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
        ClonePiece.FeaturesSpecification,
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
        piece: ClonePiece.FeaturesSpecification,
        resourceKind,
        uris: [],
        ownerId: userId,
      };
    },
    GivenNoScenarioFeaturesDataFileIsAvailable: () => {
      return new ArchiveLocation('not found');
    },
    GivenEmptyScenarioFeaturesSpecificationFile: async () => {
      const relativePath = ClonePieceRelativePathResolver.resolveFor(
        ClonePiece.FeaturesSpecification,
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

      featureIds = [...customFeaturesIds, ...platformFeaturesIds];

      await GivenFeaturesData(
        geoEntityManager,
        recordsOfDataForEachFeature,
        customFeaturesIds,
      );
      await GivenFeaturesData(
        geoEntityManager,
        recordsOfDataForEachFeature,
        platformFeaturesIds,
      );

      const getEmptySpecifications = () => [];

      validScenarioFeaturesDataFile = getEmptySpecifications();

      const exportId = v4();

      const uriOrError = await fileRepository.saveCloningFile(
        exportId,
        Readable.from(JSON.stringify(validScenarioFeaturesDataFile)),
        relativePath,
      );

      if (isLeft(uriOrError)) throw new Error("couldn't save file");
      return new ArchiveLocation(uriOrError.right);
    },
    GivenValidScenarioFeaturesSpecificationFile: async () => {
      const relativePath = ClonePieceRelativePathResolver.resolveFor(
        ClonePiece.FeaturesSpecification,
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
      const platformFeatureNameById = getFeatureClassNameByIdMap(
        platformFeatures,
      );

      featureIds = [...customFeaturesIds, ...platformFeaturesIds];

      const customScenarioFeaturesData = await GivenScenarioFeaturesData(
        geoEntityManager,
        recordsOfDataForEachFeature,
        customFeaturesIds,
        scenarioId,
      );
      const platformScenarioFeaturesData = await GivenScenarioFeaturesData(
        geoEntityManager,
        recordsOfDataForEachFeature,
        platformFeaturesIds,
        scenarioId,
        {},
        { startingIndex: customScenarioFeaturesData.length },
      );

      const getSpecifications = (
        featureId: string,
        featuresNamerCalculated: FeatureNumberCalculated[],
        active = false,
        candidate = false,
      ): ScenarioFeaturesSpecificationContent => ({
        draft: true,
        raw: {
          status: 'create',
          features: [
            {
              featureId,
              innerObjts: [{ featureId, nullValue: null }, { featureId }],
              emptyArray: [],
              emptyObject: {},
            },
          ],
          featureId,
        },
        activeSpecification: active,
        candidateSpecification: candidate,
        configs: [
          {
            baseFeature: featureId,
            againstFeature: null,
            featuresDetermined: false,
            features: featuresNamerCalculated,
            selectSubSets: null,
            splitByProperty: null,
            operation: 'copy' as FeaturesConfig['operation'],
          },
          {
            againstFeature: featureId,
            baseFeature: featureId,
            features: featuresNamerCalculated,
            featuresDetermined: true,
            operation: 'stratification' as FeaturesConfig['operation'],
            splitByProperty: 'property',
            selectSubSets: [
              { value: 'value', fpf: 1, prop: 0.5, target: undefined },
            ],
          },
        ],
      });

      setExpectedRaws(customFeaturesIds[0], platformFeaturesIds[0]);

      validScenarioFeaturesDataFile = [
        getSpecifications(
          customFeatureNameById[customFeaturesIds[0]],
          customScenarioFeaturesData.map(({ featureId }) => ({
            featureId,
            calculated: true,
          })),
          true,
          false,
        ),
        getSpecifications(
          platformFeatureNameById[platformFeaturesIds[0]],
          platformScenarioFeaturesData.map(({ featureId }) => ({
            featureId,
            calculated: true,
          })),
          false,
          true,
        ),
      ];

      const exportId = v4();

      const uriOrError = await fileRepository.saveCloningFile(
        exportId,
        Readable.from(JSON.stringify(validScenarioFeaturesDataFile)),
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
        ThenScenarioFeaturesDataShouldBeImported: async () => {
          const beforeRunScenarioFeaturesData = await scenarioFeaturesDataRepo.find(
            {
              where: { scenarioId },
            },
          );

          expect(
            beforeRunScenarioFeaturesData.every((featureData) => {
              return !isDefined(featureData.specificationId);
            }),
          ).toBe(true);

          await sut.run(input);

          const [{ active_specification_id, candidate_specification_id }]: [
            {
              active_specification_id: string;
              candidate_specification_id: string;
            },
          ] = await apiEntityManager
            .createQueryBuilder()
            .select('active_specification_id, candidate_specification_id')
            .from('scenarios', 's')
            .where('id = :scenarioId', { scenarioId })
            .execute();

          const specifications: {
            id: string;
            raw: Record<string, any>;
          }[] = await apiEntityManager
            .createQueryBuilder()
            .select()
            .from('specifications', 's')
            .where('scenario_id = :scenarioId', { scenarioId })
            .execute();

          const candidateSpecification = specifications.find(
            (specification) => specification.id === candidate_specification_id,
          );
          const activeSpecification = specifications.find(
            (specification) => specification.id === active_specification_id,
          );

          expect(candidateSpecification).toBeDefined();
          expect(activeSpecification).toBeDefined();

          const expectedAmountOfSpecifications = 2;

          expect(specifications).toHaveLength(expectedAmountOfSpecifications);

          const specificationFeaturesConfig: {
            id: string;
          }[] = await apiEntityManager
            .createQueryBuilder()
            .select()
            .from('specification_feature_configs', 's')
            .where('specification_id IN (:...specificationIds)', {
              specificationIds: specifications.map(
                (specification) => specification.id,
              ),
            })
            .execute();

          const raws = specifications.map((specification) => specification.raw);

          const expectedAmountOfSpecificationFeaturesConfig = 4;

          expect(raws).toEqual(
            expect.arrayContaining([expect.objectContaining(expectedRaws[0])]),
          );

          expect(raws).toEqual(
            expect.arrayContaining([expect.objectContaining(expectedRaws[1])]),
          );

          expect(specificationFeaturesConfig).toHaveLength(
            expectedAmountOfSpecificationFeaturesConfig,
          );

          const scenarioFeaturesData = await scenarioFeaturesDataRepo.find({
            where: { scenarioId },
          });

          expect(
            scenarioFeaturesData.every((featureData) => {
              return isDefined(featureData.specificationId);
            }),
          ).toBe(true);
        },
        ThenNoScenarioFeaturesDataShouldBeImported: async () => {
          const beforeRunScenarioFeaturesData = await scenarioFeaturesDataRepo.find(
            {
              where: { scenarioId },
            },
          );

          expect(
            beforeRunScenarioFeaturesData.every((featureData) => {
              return !isDefined(featureData.specificationId);
            }),
          ).toBe(true);

          await sut.run(input);

          const specifications: {
            id: string;
            raw: Record<string, any>;
          }[] = await apiEntityManager
            .createQueryBuilder()
            .select()
            .from('specifications', 's')
            .where('scenario_id = :scenarioId', { scenarioId })
            .execute();

          const expectedAmountOfSpecifications = 0;

          expect(specifications).toHaveLength(expectedAmountOfSpecifications);

          const scenarioFeaturesData = await scenarioFeaturesDataRepo.find({
            where: { scenarioId },
          });

          expect(
            scenarioFeaturesData.every((featureData) => {
              return isDefined(featureData.specificationId);
            }),
          ).toBe(true);
        },
      };
    },
  };
};
