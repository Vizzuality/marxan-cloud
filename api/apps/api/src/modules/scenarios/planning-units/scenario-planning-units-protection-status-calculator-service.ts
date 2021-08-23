import { Injectable } from '@nestjs/common';
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
   * WDPA IUCN categories and threshold may be undefined on scenario creation
   * and only be set on update, therefore we should not rely on their presence
   * here.
   *
   * @TODO We'll need to handle custom protected areas here once we add support
   * for these.
   */
  private shouldSetDefaultInclusionStatus(scenario: Scenario): boolean {
    return (
      !isNil(scenario.wdpaIucnCategories) && !isNil(scenario.wdpaThreshold)
    );
  }

  /**
   * Calculate default lock status of planning units given their intersection
   * with protected areas.
   */
  async calculatedProtectionStatusForPlanningUnitsIn(
    scenario: Scenario,
  ): Promise<void> {
    if (!this.shouldSetDefaultInclusionStatus(scenario)) return;

    const wdpaIucnCategoriesForScenario = scenario.wdpaIucnCategories
      ?.map((i) => `'${i}'`)
      .join(', ');

    const query = `
  with pu as (
    select spd.id,
    case
      when spd.protected_area <> 0 and spd.protected_area is not null
        then round((COALESCE(spd.protected_area, 0)/pug.area)::numeric*100)::int
      else 0
      end as perc_protection
    from scenarios_pu_data spd
      inner join planning_units_geom pug on spd.pu_geom_id = pug.id
    where scenario_id=$1),
  pu_pa as (
    select pu.id, (CASE pu.perc_protection >= $2 WHEN true THEN 1 else 0 end) as lockin_status
    from pu)
  UPDATE scenarios_pu_data
      SET (lockin_status) =
          (SELECT lockin_status FROM pu_pa
           WHERE scenarios_pu_data.id = pu_pa.id) where scenario_id = $3;
    `;
    await this.puRepo.query(query, [
      scenario.id,
      scenario.wdpaThreshold,
      scenario.id,
    ]);
  }
}
