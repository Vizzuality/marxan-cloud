import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ScenariosPlanningUnitGeoEntity } from '@marxan/scenarios-planning-unit';

import { GetAvailablePlanningUnits } from '../ports/available-planning-units/get-available-planning-units';

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
}
