import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DbConnections } from '@marxan-api/ormconfig.connections';
import { ScenariosPlanningUnitGeoEntity } from '@marxan/scenarios-planning-unit';
import { Scenario } from '../scenario.api.entity';
import { isNil } from 'lodash';

@Injectable()
export class ScenarioPlanningUnitsProtectedStatusCalculatorService {
  constructor(
    @InjectRepository(
      ScenariosPlanningUnitGeoEntity,
      DbConnections.geoprocessingDB,
    )
    private readonly puRepo: Repository<ScenariosPlanningUnitGeoEntity>,
  ) {}

  /**
   * Calculate default lock status of planning units given their intersection
   * with protected areas.
   */
  async calculatedProtectionStatusForPlanningUnitsIn(scenario: Scenario): Promise<void> {
    /**
     * If no protected areas are defined, or no threshold has been defined,
     * there's nothing to do. We allow to set these on update, so we should not
     * enforce this here.
     *
     * @TODO We'll need to handle custom protected areas here once we add
     * support for these.
     */
    if(isNil(scenario.wdpaIucnCategories) || isNil(scenario.wdpaThreshold)) return;

    const wdpaIucnCategoriesForScenario = scenario.wdpaIucnCategories?.map(i => `'${i}'`).join(', ');
    console.log(wdpaIucnCategoriesForScenario);

    const query = `
    with pa as (select * from wdpa where iucn_cat in (${wdpaIucnCategoriesForScenario})),
    pu as (
    select spd.id, pug.the_geom
    from scenarios_pu_data spd
    inner join planning_units_geom pug on spd.pu_geom_id = pug.id
    where scenario_id='${scenario.id}'),
    pu_pa as (select pu.id, st_area(st_intersection(pu.the_geom, pa.the_geom)) as pa_pu_area, (CASE pu.the_geom && pa.the_geom WHEN true THEN 2 else 0 end) as lockin_status
              from pu
              left join pa on pu.the_geom && pa.the_geom) 
    UPDATE scenarios_pu_data
    SET (protected_area, lockin_status) =
        (SELECT protected_area, lockin_status FROM (select id, sum(pa_pu_area) as protected_area, max(lockin_status) as lockin_status 
                                                    from pu_pa group by id) as result
         WHERE scenarios_pu_data.id = result.id) where scenario_id = '${scenario.id}';
    `;
    Logger.debug(query);
    await this.puRepo.query(query);
  }
}
