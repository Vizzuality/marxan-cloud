import { Inject, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { isNil } from 'lodash';
import { IUCNCategory } from '@marxan/iucn';

import { ScenariosPlanningUnitGeoEntity } from './scenarios-planning-unit.geo.entity';
import { UpdateScenarioDTO } from '@marxan-api/modules/scenarios/dto/update.scenario.dto';
import { isDefined } from '@marxan/utils';

export const ProtectionStatusEntityManagerToken = Symbol();

export interface ScenarioMetadata {
  id: string;
  wdpaIucnCategories?: IUCNCategory[];
  wdpaThreshold?: number | null;
}

@Injectable()
export class ScenarioPlanningUnitsProtectedStatusCalculatorService {
  constructor(
    @Inject(ProtectionStatusEntityManagerToken)
    private readonly entityManager: EntityManager,
  ) {}

  /**
   * WDPA IUCN categories and threshold may be undefined on scenario creation
   * and only be set on update, therefore we should not rely on their presence
   * here.
   *
   * @TODO We'll need to handle custom protected areas here once we add support
   * for these.
   */
  private shouldSetDefaultInclusionStatus(
    scenario: ScenarioMetadata,
    input: UpdateScenarioDTO | undefined,
  ): boolean {
    const isUpdatingWdpa =
      isDefined(input?.wdpaThreshold) || isDefined(input?.wdpaIucnCategories);

    if (isDefined(input)) {
      return isUpdatingWdpa;
    }

    return Boolean(
      !isNil(scenario.wdpaIucnCategories) && !isNil(scenario.wdpaThreshold),
    );
  }

  async calculatedProtectionStatusForPlanningUnitsIn(
    scenario: ScenarioMetadata,
    input?: UpdateScenarioDTO,
  ): Promise<void> {
    if (!this.shouldSetDefaultInclusionStatus(scenario, input)) return;

    const puRepo = this.entityManager.getRepository<ScenariosPlanningUnitGeoEntity>(
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
               inner join planning_units_geom pug on spd.pu_geom_id = pug.id
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
      where scenario_id = $3;
    `;
    await puRepo.query(query, [
      scenario.id,
      scenario.wdpaThreshold,
      scenario.id,
    ]);
  }
}
