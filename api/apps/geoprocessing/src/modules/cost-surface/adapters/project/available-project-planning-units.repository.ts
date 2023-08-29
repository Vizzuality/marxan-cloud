import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  GetAvailablePlanningUnits,
  PlanningUnitWithPuid,
} from '../../ports/available-planning-units/get-available-planning-units';
import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';

@Injectable()
export class AvailableProjectPlanningUnitsRepository
  implements GetAvailablePlanningUnits {
  constructor(
    @InjectRepository(ProjectsPuEntity)
    private readonly repo: Repository<ProjectsPuEntity>,
  ) {}

  async get(projectId: string): Promise<PlanningUnitWithPuid[]> {
    const result = await this.repo.find({
      where: { projectId },
    });

    return result.map((projectPu) => ({
      id: projectPu.id,
      puid: projectPu.puid,
    }));
  }
}
