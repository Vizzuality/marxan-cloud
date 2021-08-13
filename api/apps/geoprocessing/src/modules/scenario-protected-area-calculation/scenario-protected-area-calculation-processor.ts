import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Job } from 'bullmq';

import { WorkerProcessor } from '@marxan-geoprocessing/modules/worker';
import { JobInput } from '@marxan-jobs/planning-unit-protection-level';
import {
  ScenariosPlanningUnitGeoEntity,
} from '@marxan/scenarios-planning-unit';

@Injectable()
export class ScenarioProtectedAreaCalculationProcessor
  implements WorkerProcessor<JobInput, true> {
    private readonly logger: Logger = new Logger(ScenarioProtectedAreaCalculationProcessor.name);
  constructor(
    @InjectRepository(ScenariosPlanningUnitGeoEntity)
    private readonly scenarioPlanningUnitsRepo: Repository<ScenariosPlanningUnitGeoEntity>,
  ) {}

  /**
   * Process Protected area calculation for planing units based on 
   *
   * The logic for this: every time we have the ids of the selected Protected areas
   * we should update the area intersected.
   */
  async process(job: Job<JobInput, true>): Promise<true> {
    const scenarioId = job.data.scenarioId;
    const wdpaList = job.data.protectedAreaFilterByIds;
    this.logger.debug(scenarioId)
    this.logger.debug(wdpaList)
    const queryBuilder = this.scenarioPlanningUnitsRepo.query(
      `
      with pa as (select ST_MemUnion(the_geom) as the_geom from wdpa where id IN ($2)),
      pu as (
      select spd.id, pug.the_geom, pug.area as pu_area
      from scenarios_pu_data spd
      inner join planning_units_geom pug on spd.pu_geom_id = pug.id
      where scenario_id=$1),
      pu_pa as (select pu.id, st_area(st_transform(st_intersection(pu.the_geom, pa.the_geom), 3410)) as pa_pu_area, 
                                       pu_area
                from pu
                left join pa on pu.the_geom && pa.the_geom)
      UPDATE scenarios_pu_data
      SET (protected_area) =
          (SELECT protected_area
          FROM (select id, sum(pa_pu_area) as protected_area, max(pu_area) pu_area
                from pu_pa group by id) as result
           WHERE scenarios_pu_data.id = result.id);
    `,
      [scenarioId, wdpaList]
    );
    
    await queryBuilder;
    this.logger.debug(queryBuilder)


    return true;
  }

}
