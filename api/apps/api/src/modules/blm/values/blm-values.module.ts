import { Module } from '@nestjs/common';
import { ProjectBlmRepositoryModule } from './repositories/project-blm/project-blm-repository.module';
import { ScenarioCalibrationRepositoryModule } from './repositories/scenario-calibration/scenario-calibration-repository.module';
import { ScenarioBlmRepositoryModule } from '@marxan-api/modules/blm/values/repositories/scenario-blm/scenario-blm-repository.module';

@Module({
  imports: [
    ProjectBlmRepositoryModule,
    ScenarioBlmRepositoryModule,
    ScenarioCalibrationRepositoryModule,
  ],
  exports: [
    ProjectBlmRepositoryModule,
    ScenarioBlmRepositoryModule,
    ScenarioCalibrationRepositoryModule,
  ],
})
export class BlmValuesModule {}
