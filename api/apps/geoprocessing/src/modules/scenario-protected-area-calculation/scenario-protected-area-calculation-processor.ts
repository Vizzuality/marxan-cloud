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
   * Process Protected area calculation for planing units based on intersection with planning area
   *
   * The logic for this: every time we have the ids of the selected Protected areas
   * we should update the area intersected.
   */
  async process(job: Job<JobInput, true>): Promise<true> {
    this.logger.debug(`start processing pa for scenario: ${job.data.scenarioId}`)
    const scenarioId = job.data.scenarioId;
    const wdpaList = job.data.protectedAreaFilterByIds!.join(`','`);
    const wdpaFilter = (job.data.protectedAreaFilterByIds! && job.data.protectedAreaFilterByIds!.length>0) ? `where id IN ('${wdpaList}')`: ``
    const query = `
    with pu as (
      select spd.id, pug.the_geom, pug.area as pu_area
      from scenarios_pu_data spd
      inner join planning_units_geom pug on spd.pu_geom_id = pug.id
      where scenario_id=$1),
     pa as (select the_geom as the_geom from wdpa ${wdpaFilter}),
     pu_pa_union as (select pu.id, pu.the_geom as pu_the_geom, pa.the_geom as pa_the_geom, pu_area
      from pu
      inner join pa on pu.the_geom && pa.the_geom),
pu_pa_agg as (select id,pu_the_geom, st_makevalid(ST_Union(pa_the_geom)) as pa_the_geom, min(pu_area) as pu_area
      from pu_pa_union
      group by id, pu_the_geom),
      result as (select id, round((st_area(st_transform(st_intersection(pu_the_geom, pa_the_geom), 3410))/pu_area)*100) as protected_area
  from pu_pa_agg)
    UPDATE scenarios_pu_data
      SET (protected_area) = (SELECT protected_area
          FROM result
          WHERE scenarios_pu_data.id = result.id);
    `;
    const queryBuilder = this.scenarioPlanningUnitsRepo.query(
      query,
      [scenarioId]
    );
    await queryBuilder.catch((err) =>{
      this.logger.debug(queryBuilder);
      this.logger.debug(err);
      throw err;
    })

    return true;
  }

}
