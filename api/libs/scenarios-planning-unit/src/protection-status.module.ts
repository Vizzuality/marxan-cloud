import { DynamicModule, Module } from '@nestjs/common';
import { getEntityManagerToken, TypeOrmModule } from '@nestjs/typeorm';

import {
  ProtectionStatusEntityManagerToken,
  ScenarioPlanningUnitsProtectedStatusCalculatorService,
} from './scenario-planning-units-protection-status-calculator-service';
import { ScenariosPlanningUnitGeoEntity } from './scenarios-planning-unit.geo.entity';

@Module({})
export class ProtectionStatusModule {
  static for(connectionName?: string): DynamicModule {
    return {
      module: ProtectionStatusModule,
      imports: [
        TypeOrmModule.forFeature(
          [ScenariosPlanningUnitGeoEntity],
          connectionName,
        ),
      ],
      providers: [
        ScenarioPlanningUnitsProtectedStatusCalculatorService,
        {
          provide: ProtectionStatusEntityManagerToken,
          useExisting: getEntityManagerToken(connectionName),
        },
      ],
      exports: [ScenarioPlanningUnitsProtectedStatusCalculatorService],
    };
  }
}
