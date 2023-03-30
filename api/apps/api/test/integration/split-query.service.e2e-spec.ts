import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getEntityManagerToken, getRepositoryToken } from '@nestjs/typeorm';
import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';
import { bootstrapApplication } from '../utils/api-application';
import { v4 } from 'uuid';
import { GivenProjectExists } from '../steps/given-project';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { EntityManager, In, Repository } from 'typeorm';
import { JobStatus } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { SplitQuery } from '@marxan-api/modules/scenarios-features/split';
import { SingleSplitConfigFeatureValueWithId } from '@marxan-api/modules/scenarios-features/split/split-create-features.service';
import { FeatureSubSet, SpecificationOperation } from '@marxan/specification';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { GivenScenarioExists } from '../steps/given-scenario-exists';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { GeoFeatureGeometry, GeometrySource } from '@marxan/geofeatures';
import { Polygon } from 'geojson';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
}, 30_000);

afterEach(async () => {
  await fixtures.cleanup();
});

it('does not link split feature when value in subset does not match any possible values', async () => {
  const subset = fixtures.GivenSubSetWithWrongSubsetValue();
  const { projectId, scenarioId } = await fixtures.GivenScenarioExist();
  const baseFeatureId = await fixtures.GivenBaseFeature();
  const splitFeature = await fixtures.GivenASplitFeature(
    baseFeatureId,
    projectId,
    subset,
  );
  const linkingQueryAndParams = await fixtures.WhenLinkingASplitingAFeature(
    projectId,
    scenarioId,
    splitFeature,
  );

  await fixtures.ThenNoSplitFeatureIsLinked(linkingQueryAndParams);
});

it('links a feature when subset is specified', async () => {
  const subset = fixtures.GivenSubSetWithCorrectValue();
  const { projectId, scenarioId } = await fixtures.GivenScenarioExist();
  const baseFeatureId = await fixtures.GivenBaseFeature();
  const splitFeature = await fixtures.GivenASplitFeature(
    baseFeatureId,
    projectId,
    subset,
  );
  const linkingQueryAndParams = await fixtures.WhenLinkingASplitingAFeature(
    projectId,
    scenarioId,
    splitFeature,
  );

  await fixtures.ThenSplitFeatureIsLinked(linkingQueryAndParams, splitFeature);
});

it('links a feature when no subset is specified', async () => {
  const subset = fixtures.GivenNoSubSet();
  const { projectId, scenarioId } = await fixtures.GivenScenarioExist();
  const baseFeatureId = await fixtures.GivenBaseFeature();
  const splitFeature = await fixtures.GivenASplitFeature(
    baseFeatureId,
    projectId,
    subset,
  );
  const linkingQueryAndParams = await fixtures.WhenLinkingASplitingAFeature(
    projectId,
    scenarioId,
    splitFeature,
  );

  await fixtures.ThenSplitFeatureIsLinked(linkingQueryAndParams, splitFeature);
});

async function getFixtures() {
  const app = await bootstrapApplication();

  const sut = app.get(SplitQuery);
  const featuresRepo: Repository<GeoFeature> = app.get(
    getRepositoryToken(GeoFeature),
  );
  const projectsRepo: Repository<Project> = app.get(
    getRepositoryToken(Project),
  );
  const featuresDataRepo: Repository<GeoFeatureGeometry> = app.get(
    getRepositoryToken(GeoFeatureGeometry, DbConnections.geoprocessingDB),
  );
  const geoEntityManager: EntityManager = app.get(
    getEntityManagerToken(DbConnections.geoprocessingDB),
  );

  const token = await GivenUserIsLoggedIn(app);
  let projectId: string;
  let cleanupProject: () => Promise<void>;
  let baseFeatureId: string;
  let scenarioFeaturesPreparationIds: { id: string }[];

  const splitByProperty = 'key 1';
  const splitValue = 'value 1';
  const polygon: Polygon = {
    type: 'Polygon',
    coordinates: [
      [
        [0, 1],
        [1, 1],
        [1, 0],
        [0, 0],
        [0, 1],
      ],
    ],
  };

  return {
    cleanup: async () => {
      await cleanupProject();
      await featuresRepo.delete({ id: baseFeatureId });
      await featuresRepo.delete({ projectId });
      await featuresDataRepo.delete({ featureId: baseFeatureId });
      if (scenarioFeaturesPreparationIds.length)
        await geoEntityManager
          .createQueryBuilder()
          .delete()
          .from('scenario_features_preparation')
          .where('id IN (:...ids)', {
            ids: scenarioFeaturesPreparationIds.map(({ id }) => id),
          })
          .execute();
    },
    GivenSubSetWithCorrectValue: () => {
      return { value: splitValue, fpf: 0.3, prop: 0.7, target: 20 };
    },
    GivenSubSetWithWrongSubsetValue: () => {
      return { value: 'random value', fpf: 0.3, prop: 0.7, target: 20 };
    },
    GivenNoSubSet: () => {
      return undefined;
    },
    GivenScenarioExist: async () => {
      const project = await GivenProjectExists(app, token);
      cleanupProject = project.cleanup;
      projectId = project.projectId;
      await projectsRepo.save({
        id: projectId,
        bbox: [200.0, -200.0, 200.0, -200.0],
      });
      const scenario = await GivenScenarioExists(app, projectId, token);
      return { projectId, scenarioId: scenario.id };
    },
    GivenBaseFeature: async () => {
      const baseFeature = await featuresRepo.save({
        id: v4(),
        featureClassName: 'base feature',
        creationStatus: JobStatus.created,
      });
      baseFeatureId = baseFeature.id;
      const featureDataId = v4();

      await geoEntityManager
        .createQueryBuilder()
        .insert()
        .into('features_data')
        .values({
          id: featureDataId,
          featureId: baseFeatureId,
          properties: {
            [splitByProperty]: splitValue,
            'other-key': splitValue,
          },
          source: GeometrySource.user_imported,
          theGeom: () =>
            `st_multi(ST_GeomFromGeoJSON('${JSON.stringify(polygon)}'))`,
        })
        .execute();

      return baseFeatureId;
    },
    GivenASplitFeature: async (
      baseFeatureId: string,
      projectId: string,
      subset?: FeatureSubSet,
    ): Promise<SingleSplitConfigFeatureValueWithId> => {
      const splitFeature = {
        id: v4(),
        singleSplitFeature: {
          baseFeatureId,
          operation: SpecificationOperation.Split as SpecificationOperation.Split,
          splitByProperty,
          subset,
        },
      };
      await featuresRepo.save({
        id: splitFeature.id,
        featureClassName: `base feature / ${splitByProperty} ${
          subset ? `:${subset.value}` : ``
        }`,
        creationStatus: JobStatus.created,
        fromGeoprocessingOps: splitFeature.singleSplitFeature,
        projectId,
      });

      return splitFeature;
    },
    WhenLinkingASplitingAFeature: async (
      projectId: string,
      scenarioId: string,
      splitFeature: SingleSplitConfigFeatureValueWithId,
    ) => {
      const [project] = await projectsRepo.find({ where: { id: projectId } });
      if (!project) throw new Error('project should be defined');
      return sut.prepareQuery(
        splitFeature,
        scenarioId,
        v4(),
        undefined,
        [],
        project,
      );
    },
    ThenSplitFeatureIsLinked: async (
      linkingQueryAndParams: {
        parameters: (string | number)[];
        query: string;
      },
      splitFeature: SingleSplitConfigFeatureValueWithId,
    ) => {
      scenarioFeaturesPreparationIds = await geoEntityManager.query(
        linkingQueryAndParams.query,
        linkingQueryAndParams.parameters,
      );

      expect(scenarioFeaturesPreparationIds).toHaveLength(1);

      const scenarioFeaturesPreparationInserted: {
        id: string;
        api_feature_id: string;
        fpf: number;
        target: number;
        prop: number;
      }[] = await geoEntityManager
        .createQueryBuilder()
        .select(['api_feature_id', 'fpf', 'target', 'prop'])
        .from('scenario_features_preparation', 'sfp')
        .where('id IN (:...ids)', {
          ids: scenarioFeaturesPreparationIds.map(({ id }) => id),
        })
        .execute();

      expect(scenarioFeaturesPreparationInserted).toHaveLength(1);

      const scenarioFeaturePreparation = scenarioFeaturesPreparationInserted[0];

      const subset = splitFeature.singleSplitFeature.subset;
      expect(scenarioFeaturePreparation).toEqual({
        api_feature_id: splitFeature.id,
        fpf: subset ? subset.fpf : null,
        prop: subset ? subset.prop : null,
        target: subset ? subset.target : null,
      });
    },
    ThenNoSplitFeatureIsLinked: async (linkingQueryAndParams: {
      parameters: (string | number)[];
      query: string;
    }) => {
      scenarioFeaturesPreparationIds = await geoEntityManager.query(
        linkingQueryAndParams.query,
        linkingQueryAndParams.parameters,
      );

      expect(scenarioFeaturesPreparationIds).toHaveLength(0);
    },
  };
}
