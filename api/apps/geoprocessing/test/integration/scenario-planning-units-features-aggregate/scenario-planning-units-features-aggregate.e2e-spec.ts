import { INestApplication } from '@nestjs/common';
import { getEntityManagerToken } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';

import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ScenarioPlanningUnitsFeaturesAggregateProcessor } from '@marxan-geoprocessing/modules/scenario-planning-units-features-aggregate/scenario-planning-units-features-aggregate-processor';
import { FeatureAmountsPerPlanningUnitEntity } from '@marxan/feature-amounts-per-planning-unit';
import { JobInput } from '@marxan/planning-unit-features';
import { ScenariosPuPaDataGeo } from '@marxan/scenarios-planning-unit';

import { bootstrapApplication } from '../../utils';
import { GivenScenarioPuDataExists } from '../../steps/given-scenario-pu-data-exists';

/**
 * Regression coverage for the feature-list aggregation query.
 *
 * The query joins precomputed per-PU feature amounts against the features that
 * belong to the scenario. The membership test is expressed as a `WHERE EXISTS`
 * semi-join over `scenario_features_data` (which has no unique constraint on
 * (scenario_id, api_feature_id)), so this test deliberately seeds:
 *  - a feature with DUPLICATE scenario_features_data rows -> must appear once,
 *  - a feature with a single membership row -> normal case,
 *  - a feature present in feature_amounts_per_planning_unit but NOT in the
 *    scenario -> must be excluded.
 */
describe('scenario planning units features aggregate', () => {
  let app: INestApplication;
  let geoEntityManager: EntityManager;
  let processor: ScenarioPlanningUnitsFeaturesAggregateProcessor;

  const projectId = v4();
  const scenarioId = v4();
  // feature present in the scenario via two (duplicate) membership rows
  const duplicatedFeatureId = v4();
  // feature present in the scenario via a single membership row
  const singleFeatureId = v4();
  // feature with amounts but NOT part of the scenario -> must be excluded
  const orphanFeatureId = v4();

  const duplicatedFeatureAmount = 10;
  const singleFeatureAmount = 20;
  const orphanFeatureAmount = 30;

  let scenarioPuData: ScenariosPuPaDataGeo[];

  beforeAll(async () => {
    app = await bootstrapApplication();
    geoEntityManager = app.get(
      getEntityManagerToken(geoprocessingConnections.default),
    );
    processor = new ScenarioPlanningUnitsFeaturesAggregateProcessor(
      geoEntityManager,
    );
  });

  beforeEach(async () => {
    // The geo e2e harness truncates every table in a global beforeEach
    // (test/utils/handle-database.ts), which runs after this describe's
    // beforeAll. Seed here so the data survives into the test body.
    scenarioPuData = await GivenScenarioPuDataExists(
      geoEntityManager,
      projectId,
      scenarioId,
    );

    await GivenFeatureAmountsExist(geoEntityManager, projectId, scenarioPuData, [
      { featureId: duplicatedFeatureId, amount: duplicatedFeatureAmount },
      { featureId: singleFeatureId, amount: singleFeatureAmount },
      { featureId: orphanFeatureId, amount: orphanFeatureAmount },
    ]);

    // duplicatedFeatureId gets two membership rows to force a fan-out that the
    // old INNER JOIN + ARRAY_AGG(DISTINCT) collapsed and the new EXISTS avoids.
    await GivenScenarioFeatureMembership(geoEntityManager, scenarioId, [
      duplicatedFeatureId,
      duplicatedFeatureId,
      singleFeatureId,
    ]);
  });

  afterAll(async () => {
    await app.close();
  });

  it('aggregates the scenario feature list, de-duplicating and excluding non-member features', async () => {
    await processor.process({
      data: { scenarioId },
    } as unknown as Job<JobInput, true>);

    const rows: { id: string; feature_list: string[] }[] =
      await geoEntityManager.query(
        `SELECT id, feature_list FROM scenarios_pu_data WHERE scenario_id = $1`,
        [scenarioId],
      );

    expect(rows).toHaveLength(scenarioPuData.length);

    const expected = [
      `${duplicatedFeatureId}:${duplicatedFeatureAmount}`,
      `${singleFeatureId}:${singleFeatureAmount}`,
    ].sort();

    for (const row of rows) {
      expect([...row.feature_list].sort()).toEqual(expected);
      // orphan feature has amounts but no membership row -> excluded
      expect(
        row.feature_list.some((element) =>
          element.startsWith(`${orphanFeatureId}:`),
        ),
      ).toBe(false);
      // duplicated membership rows must not duplicate the feature entry
      expect(
        row.feature_list.filter((element) =>
          element.startsWith(`${duplicatedFeatureId}:`),
        ),
      ).toHaveLength(1);
    }
  });
});

const GivenFeatureAmountsExist = async (
  entityManager: EntityManager,
  projectId: string,
  scenarioPuData: ScenariosPuPaDataGeo[],
  features: { featureId: string; amount: number }[],
): Promise<void> => {
  const repo = entityManager.getRepository(FeatureAmountsPerPlanningUnitEntity);
  const rows = scenarioPuData.flatMap((pu) =>
    features.map((feature) =>
      repo.create({
        projectId,
        featureId: feature.featureId,
        amount: feature.amount,
        projectPuId: pu.projectPuId,
      }),
    ),
  );
  await repo.save(rows);
};

const GivenScenarioFeatureMembership = async (
  entityManager: EntityManager,
  scenarioId: string,
  apiFeatureIds: string[],
): Promise<void> => {
  for (const apiFeatureId of apiFeatureIds) {
    await entityManager.query(
      `INSERT INTO scenario_features_data (id, scenario_id, api_feature_id, created_by)
       VALUES ($1, $2, $3, $4)`,
      [v4(), scenarioId, apiFeatureId, v4()],
    );
  }
};
