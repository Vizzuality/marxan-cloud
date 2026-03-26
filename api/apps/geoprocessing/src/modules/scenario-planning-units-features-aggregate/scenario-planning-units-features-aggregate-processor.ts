import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

import { WorkerProcessor } from '@marxan-geoprocessing/modules/worker';
import { JobInput } from '@marxan/planning-unit-features';

/**
 * Optimized query that uses the pre-computed feature_amounts_per_planning_unit
 * table instead of expensive spatial intersection (st_intersects).
 *
 * For each scenario planning unit, aggregates the feature IDs and amounts into
 * a text array stored in scenarios_pu_data.feature_list.
 * Format per element: "featureId:amount"
 *
 * Only includes features that are part of the scenario (via scenario_features_data).
 */
const query = `
UPDATE scenarios_pu_data
SET feature_list = sub.feature_list
FROM (
  SELECT spd.id AS scenario_pu_id,
         ARRAY_AGG(
           DISTINCT concat_ws(':', fappu.feature_id::text, fappu.amount::text)
         ) AS feature_list
  FROM scenarios_pu_data spd
  INNER JOIN feature_amounts_per_planning_unit fappu
    ON fappu.project_pu_id = spd.project_pu_id
  INNER JOIN scenario_features_data sfd
    ON sfd.api_feature_id = fappu.feature_id
   AND sfd.scenario_id = spd.scenario_id
  WHERE spd.scenario_id = $1
  GROUP BY spd.id
) AS sub
WHERE scenarios_pu_data.id = sub.scenario_pu_id;
`;

@Injectable()
export class ScenarioPlanningUnitsFeaturesAggregateProcessor
  implements WorkerProcessor<JobInput, true>
{
  private readonly logger = new Logger(
    ScenarioPlanningUnitsFeaturesAggregateProcessor.name,
  );

  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  async process(job: Job<JobInput, true>): Promise<true> {
    const scenarioId = job.data.scenarioId;
    this.logger.log(
      `Aggregating feature list for scenario ${scenarioId}...`,
    );
    await this.entityManager.query(query, [scenarioId]);
    this.logger.log(
      `Feature list aggregation complete for scenario ${scenarioId}`,
    );
    return true;
  }
}
