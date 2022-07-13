import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';
import { SplitCreateFeatures } from '@marxan-api/modules/scenarios-features/split/split-create-features.service';
import { bootstrapApplication } from '../utils/api-application';
import { FeatureConfigSplit } from '@marxan-api/modules/specification';
import { v4 } from 'uuid';
import { FeatureSubSet, SpecificationOperation } from '@marxan/specification';
import { GivenProjectExists } from '../steps/given-project';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { IsNull, Not, Repository } from 'typeorm';
import { FeatureTag } from '@marxan/features';
import { JobStatus } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { SingleSplitConfigFeatureValue } from '@marxan/features-hash';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

afterEach(async () => {
  await fixtures.cleanup();
});

it('fails to create split features when basefeature does not exists', async () => {
  const splitByProperty = 'random property';
  const projectId = await fixtures.GivenProjectExist();
  const featureId = await fixtures.GivenBaseFeatureDoesNotExists();
  const splitFeatureConfig = fixtures.GivenSplitFeatureConfig(
    featureId,
    splitByProperty,
  );
  await fixtures
    .WhenCreatingSplitFeatures(splitFeatureConfig, projectId)
    .ThenBaseFeatureDoesNotExistsErrorIsThrow();
});

it('fails to create split features when basefeature is a derived feture', async () => {
  const splitByProperty = 'random property';
  const projectId = await fixtures.GivenProjectExist();
  const feature = await fixtures.GivenBaseFeatureIsADerivedFeature();
  const splitFeatureConfig = fixtures.GivenSplitFeatureConfig(
    feature.id,
    splitByProperty,
  );
  await fixtures
    .WhenCreatingSplitFeatures(splitFeatureConfig, projectId)
    .ThenBaseFeatureIsADerivedFeatureErrorIsThrow();
});

it('creates split features', async () => {
  const splitByProperty = 'random property';
  const selectSubSets: FeatureSubSet[] = [
    { value: 'random value 1' },
    { value: 'random value 2' },
  ];
  const projectId = await fixtures.GivenProjectExist();
  const feature = await fixtures.GivenBaseFeature();
  const splitFeatureConfig = fixtures.GivenSplitFeatureConfig(
    feature.id,
    splitByProperty,
    selectSubSets,
  );
  await fixtures
    .WhenCreatingSplitFeatures(splitFeatureConfig, projectId)
    .ThenSplitFeaturesAreCreated(feature);
});

it('creates one split feature when there are no subsets', async () => {
  const splitByProperty = 'random property';
  const selectSubSets: FeatureSubSet[] = [];
  const projectId = await fixtures.GivenProjectExist();
  const feature = await fixtures.GivenBaseFeature();
  const splitFeatureConfig = fixtures.GivenSplitFeatureConfig(
    feature.id,
    splitByProperty,
    selectSubSets,
  );
  await fixtures
    .WhenCreatingSplitFeatures(splitFeatureConfig, projectId)
    .ThenOneSplitFeatureIsCreated(feature);
});

it('does not creat new split features when they are already created', async () => {
  const splitByProperty = 'random property';
  const selectSubSets: FeatureSubSet[] = [];
  const projectId = await fixtures.GivenProjectExist();
  const feature = await fixtures.GivenBaseFeature();
  const splitFeatureConfig = fixtures.GivenSplitFeatureConfig(
    feature.id,
    splitByProperty,
    selectSubSets,
  );
  const fitstResult = await fixtures
    .WhenCreatingSplitFeatures(splitFeatureConfig, projectId)
    .ThenOneSplitFeatureIsCreated(feature);

  await fixtures
    .WhenCreatingSplitFeatures(splitFeatureConfig, projectId)
    .ThenOnlyExistsOneSplitFeature(fitstResult);
});

async function getFixtures() {
  const app = await bootstrapApplication();

  const sut = app.get(SplitCreateFeatures);
  const featuresRepo: Repository<GeoFeature> = app.get(
    getRepositoryToken(GeoFeature),
  );

  const token = await GivenUserIsLoggedIn(app);
  let projectId: string;
  let cleanupProject: () => Promise<void>;
  let baseFeatureId: string;

  const getFeatureName = (
    baseFeatureName: string,
    splitByProperty: string,
    value?: string,
  ) => {
    const valueChain = value ? `: ${value}` : '';
    return `${baseFeatureName} / ${splitByProperty}` + valueChain;
  };
  return {
    cleanup: async () => {
      await cleanupProject();
      await featuresRepo.delete({ id: baseFeatureId });
      await featuresRepo.delete({ projectId });
    },
    GivenProjectExist: async () => {
      const project = await GivenProjectExists(app, token);
      cleanupProject = project.cleanup;
      projectId = project.projectId;
      return projectId;
    },
    GivenBaseFeature: async () => {
      const feature = await featuresRepo.save({
        id: v4(),
        featureClassName: 'base feature',
        tag: FeatureTag.Species,
        creationStatus: JobStatus.created,
      });
      baseFeatureId = feature.id;
      return feature;
    },
    GivenBaseFeatureIsADerivedFeature: async () => {
      const feature = await featuresRepo.save({
        id: v4(),
        featureClassName: 'base feature',
        tag: FeatureTag.Species,
        creationStatus: JobStatus.created,
        fromGeoprocessingOps: {
          baseFeatureId: v4(),
          operation: SpecificationOperation.Split,
          splitByProperty: 'basefeature prop',
        },
      });
      baseFeatureId = feature.id;
      return feature;
    },
    GivenBaseFeatureDoesNotExists: async () => {
      return v4();
    },

    GivenSplitFeatureConfig: (
      baseFeatureId: string,
      splitByProperty: string,
      selectSubSets?: FeatureSubSet[],
    ): FeatureConfigSplit => ({
      id: v4(),
      operation: SpecificationOperation.Split,
      baseFeatureId,
      splitByProperty,
      selectSubSets,
    }),
    WhenCreatingSplitFeatures: (
      splitFeatureConfig: FeatureConfigSplit,
      projectId: string,
    ) => {
      const createSplitFeatures = sut.createSplitFeatures(
        splitFeatureConfig,
        projectId,
      );
      return {
        ThenBaseFeatureDoesNotExistsErrorIsThrow: async () => {
          await expect(createSplitFeatures).rejects.toThrow(
            /did not find base feature/,
          );
        },
        ThenBaseFeatureIsADerivedFeatureErrorIsThrow: async () => {
          await expect(createSplitFeatures).rejects.toThrow(
            /trying to split an already derived feature/,
          );
        },
        ThenOneSplitFeatureIsCreated: async (baseFeature: GeoFeature) => {
          const results = await createSplitFeatures;

          const splitFeaturesFound = await featuresRepo.find({
            where: { projectId, geoprocessingOpsHash: Not(IsNull()) },
          });
          expect(results).toHaveLength(splitFeaturesFound.length);
          expect(results).toHaveLength(1);

          const splitFeatureFound = splitFeaturesFound[0];
          const splitFeatureResult = results[0];
          const {
            splitByProperty,
            subset,
          } = splitFeatureResult.singleSplitFeature;
          const value = subset?.value;

          expect(
            splitFeatureFound.featureClassName ===
              getFeatureName(
                baseFeature.featureClassName!,
                splitByProperty,
                value,
              ),
          );

          return results;
        },
        ThenSplitFeaturesAreCreated: async (baseFeature: GeoFeature) => {
          const results = await createSplitFeatures;

          const splitFeaturesFound = await featuresRepo.find({
            where: { projectId, geoprocessingOpsHash: Not(IsNull()) },
          });
          expect(results).toHaveLength(splitFeaturesFound.length);

          expect(
            results.every((splitFeature) => {
              const foundFeature = splitFeaturesFound.find(
                ({ id }) => splitFeature.id === id,
              );
              const {
                splitByProperty,
                subset,
              } = splitFeature.singleSplitFeature;
              const value = subset?.value;

              return (
                foundFeature &&
                foundFeature.featureClassName ===
                  getFeatureName(
                    baseFeature.featureClassName!,
                    splitByProperty,
                    value,
                  )
              );
            }),
          );
        },
        ThenOnlyExistsOneSplitFeature: async (
          prevResult: {
            id: string;
            singleSplitFeature: SingleSplitConfigFeatureValue;
          }[],
        ) => {
          const results = await createSplitFeatures;

          const splitFeaturesFound = await featuresRepo.find({
            where: { projectId, geoprocessingOpsHash: Not(IsNull()) },
          });
          expect(results).toHaveLength(splitFeaturesFound.length);
          expect(results).toHaveLength(1);

          expect(results[0].id).toEqual(splitFeaturesFound[0].id);

          expect(prevResult).toHaveLength(1);

          expect(prevResult[0].id).toEqual(results[0].id);
        },
      };
    },
  };
}
