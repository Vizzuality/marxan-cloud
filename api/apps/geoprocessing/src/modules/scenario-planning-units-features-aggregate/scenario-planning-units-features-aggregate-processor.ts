import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

import { WorkerProcessor } from '@marxan-geoprocessing/modules/worker';
import { JobInput } from '@marxan/planning-unit-features';

const query = `
WITH pu AS (
	SELECT pug.the_geom,
           spd.id,
           spd.scenario_id,
           fappu.amount
	from feature_amounts_per_planning_unit fappu
INNER JOIN projects_pu pp on fappu.project_pu_id = pp.id
INNER JOIN planning_units_geom pug on pp.geom_id = pug.id
INNER JOIN scenarios_pu_data spd ON pp.id = spd.project_pu_id
AND scenario_id = $1
	ORDER BY pp.puid),
species AS (
	SELECT sfd.scenario_id,
		   (st_dump(fd.the_geom)).geom AS the_geom,
		   sfd.api_feature_id as feature_id
	FROM scenario_features_data sfd
		inner JOIN features_data fd ON sfd.feature_class_id = fd.id and scenario_id = $1)
UPDATE scenarios_pu_data
SET feature_list = sub.feature_list
FROM (SELECT pu.scenario_id,
             pu.id AS scenario_pu_id,
             ARRAY_AGG(DISTINCT concat_ws(':',species.feature_id::text,pu.amount)) AS feature_list
	    FROM pu, species
      WHERE st_intersects(species.the_geom, pu.the_geom)
      GROUP BY 1, 2) AS sub
WHERE scenarios_pu_data.id = sub.scenario_pu_id;
`;

@Injectable()
export class ScenarioPlanningUnitsFeaturesAggregateProcessor
  implements WorkerProcessor<JobInput, true>
{
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  async process(job: Job<JobInput, true>): Promise<true> {
    const scenarioId = job.data.scenarioId;
    await this.entityManager.query(query, [scenarioId]);
    return true;
  }
}
