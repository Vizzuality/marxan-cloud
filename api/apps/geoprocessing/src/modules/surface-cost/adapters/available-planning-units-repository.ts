import { ScenariosPuPaDataGeo } from '@marxan/scenarios-planning-unit';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  GetAvailablePlanningUnits,
  PlanningUnitWithPuid,
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
}
