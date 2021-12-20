import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DbConnections } from '../../../../../ormconfig.connections';
import { BlmFinalResultEntity } from '@marxan/blm-calibration';
import { ScenarioCalibrationRepo } from '../../scenario-calibration-repo';
import { TypeormScenarioCalibrationRepository } from './typeorm-scenario-calibration-repository';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [BlmFinalResultEntity],
      DbConnections.geoprocessingDB,
    ),
  ],
  providers: [
    {
      provide: ScenarioCalibrationRepo,
      useClass: TypeormScenarioCalibrationRepository,
    },
  ],
  exports: [ScenarioCalibrationRepo],
})
export class ScenarioCalibrationRepositoryModule {}
