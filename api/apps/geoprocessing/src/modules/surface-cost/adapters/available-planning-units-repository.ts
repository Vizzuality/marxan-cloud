import { ScenariosPuPaDataGeo } from '@marxan/scenarios-planning-unit';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  GetAvailablePlanningUnits,
  PlanningUnitWithPuid,
  PUWithArea,
} from '../ports/available-planning-units/get-available-planning-units';

@Injectable()
export class AvailablePlanningUnitsRepository
  implements GetAvailablePlanningUnits {
  constructor(
    @InjectRepository(ScenariosPuPaDataGeo)
    private readonly repo: Repository<ScenariosPuPaDataGeo>,
  ) {}

  async get(scenarioId: string): Promise<PlanningUnitWithPuid[]> {
    const result = await this.repo.find({
      where: { scenarioId },
      relations: ['projectPu'],
    });

    return result.map((spd) => ({ id: spd.id, puid: spd.projectPu.puid }));
  }

  async getPUsWithArea(scenarioId: string): Promise<PUWithArea[]> {
    const result: PUWithArea[] = await this.repo.query(
      `
        SELECT spd.id, round(pug.area) / 1000000 as area
        FROM scenarios_pu_data spd
          INNER JOIN projects_pu ppu ON ppu.id = spd.project_pu_id
          INNER JOIN planning_units_geom pug ON pug.id = ppu.geom_id
        WHERE scenario_id = $1
      `,
      [scenarioId],
    );

    return result;
  }
}
