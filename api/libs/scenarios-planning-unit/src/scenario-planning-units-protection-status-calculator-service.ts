import { Inject, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { ScenariosPlanningUnitGeoEntity } from './scenarios-planning-unit.geo.entity';

export const ProtectionStatusEntityManagerToken = Symbol();

export interface ScenarioMetadata {
  id: string;
  threshold?: number | null;
}

@Injectable()
export class ScenarioPlanningUnitsProtectedStatusCalculatorService {
  constructor(
    @Inject(ProtectionStatusEntityManagerToken)
    private readonly entityManager: EntityManager,
  ) {}

  /**
   * @TODO We'll need to handle custom protected areas here once we add support
   * for these.
   */
  async calculatedProtectionStatusForPlanningUnitsIn(
    scenario: ScenarioMetadata,
  ): Promise<void> {
    const puRepo =
      this.entityManager.getRepository<ScenariosPlanningUnitGeoEntity>(
        ScenariosPlanningUnitGeoEntity,
      );

    const query = `
      with pu as (
        select spd.id,
               case
                 when spd.protected_area <> 0 and spd.protected_area is not null
                   then round(
                     (COALESCE(spd.protected_area, 0) / pug.area)::numeric *
                     100)::int
                 else 0
                 end as perc_protection
        from scenarios_pu_data spd
			         inner join projects_pu ppu on ppu.id = spd.project_pu_id
               inner join planning_units_geom pug on pug.id = ppu.geom_id
        where scenario_id = $1),
           pu_pa as (
             select pu.id,
                    (CASE pu.perc_protection >= $2
                       WHEN true THEN 1
                       else 0 end) as lockin_status
             from pu)
      UPDATE scenarios_pu_data
      SET (lockin_status)      =
            (SELECT lockin_status
             FROM pu_pa
             WHERE scenarios_pu_data.id = pu_pa.id),
          protected_by_default =
            (CASE
               WHEN ((SELECT lockin_status
                      FROM pu_pa
                      WHERE scenarios_pu_data.id = pu_pa.id) = 1)
                 THEN true
               ELSE false
              END
              )
      where scenario_id = $1;
    `;
    await puRepo.query(query, [scenario.id, scenario.threshold]);
  }
}
