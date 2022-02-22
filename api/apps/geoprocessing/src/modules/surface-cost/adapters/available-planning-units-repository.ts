import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ScenariosPlanningUnitGeoEntity } from '@marxan/scenarios-planning-unit';

import {
  GetAvailablePlanningUnits,
  PUWithArea,
} from '../ports/available-planning-units/get-available-planning-units';

@Injectable()
export class AvailablePlanningUnitsRepository
  implements GetAvailablePlanningUnits {
  constructor(
    @InjectRepository(ScenariosPlanningUnitGeoEntity)
    private readonly repo: Repository<ScenariosPlanningUnitGeoEntity>,
  ) {}

  get(scenarioId: string): Promise<{ ids: string[] }> {
    return this.repo
      .find({
        where: {
          scenarioId,
        },
      })
      .then((rows) => ({
        ids: rows.map((row) => row.id),
      }));
  }

  async getPUsWithArea(scenarioId: string): Promise<PUWithArea[]> {
    const result: PUWithArea[] = await this.repo.query(
      `
        SELECT scenarios_pu_data.id, st_area(the_geom) as area
        FROM scenarios_pu_data INNER JOIN planning_units_geom ON scenarios_pu_data.pu_geom_id = planning_units_geom.id
        WHERE scenario_id = $1
      `,
      [scenarioId],
    );

    return result;
  }

  async getMaxPUAreaForScenario(scenarioId: string): Promise<number> {
    const [{ area }]: [{ area: number }] = await this.repo.query(
      `
        SELECT max(st_area(the_geom)) as area
        FROM scenarios_pu_data INNER JOIN planning_units_geom ON scenarios_pu_data.pu_geom_id = planning_units_geom.id
        WHERE scenario_id = $1
      `,
      [scenarioId],
    );

    return area;
  }
}
