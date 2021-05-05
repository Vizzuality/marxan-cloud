import { Module } from '@nestjs/common';
import { PlanningUnitsModule } from '../planning-units/planning-units.module';
import { ScenarioPuRequestModule } from './scenario-pu-request/scenario-pu-request.module';

import { AnalysisService } from './analysis.service';
import { ArePuidsAllowed } from './are-puids-allowed';

@Module({
  imports: [
    // Base Service for processing entity config
    ScenarioPuRequestModule,
    PlanningUnitsModule,
  ],
  providers: [
    {
      provide: ArePuidsAllowed,
      useValue: {}, // replace with useClass of Service extending (BaseService of scenarios_pu_data) with required functionality
    },
    AnalysisService,
  ],
  exports: [AnalysisService],
})
export class AnalysisModule {}
