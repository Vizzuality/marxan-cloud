import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CalibrationRunResult,
  ScenarioCalibrationRepo,
} from '../../scenario-calibration-repo';
import { BlmFinalResultEntity } from '@marxan/blm-calibration';
import { DbConnections } from '@marxan-api/ormconfig.connections';

@Injectable()
export class TypeormScenarioCalibrationRepository
  implements ScenarioCalibrationRepo {
  constructor(
    @InjectRepository(BlmFinalResultEntity, DbConnections.geoprocessingDB)
    private readonly repository: Repository<BlmFinalResultEntity>,
  ) {}
  async getScenarioCalibrationResults(
    scenarioId: string,
  ): Promise<CalibrationRunResult[]> {
    return this.repository.find({ where: { scenarioId } });
  }
}
