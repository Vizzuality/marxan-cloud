import { Module } from '@nestjs/common';
import { ProjectBlmRepositoryModule } from './repositories/project-blm/project-blm-repository.module';
import { ScenarioCalibrationRepositoryModule } from './repositories/scenario-calibration/scenario-calibration-repository.module';

@Module({
  imports: [ProjectBlmRepositoryModule, ScenarioCalibrationRepositoryModule],
  exports: [ProjectBlmRepositoryModule, ScenarioCalibrationRepositoryModule],
})
export class BlmValuesModule {}
