import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { geoprocessingConnections } from './ormconfig';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminAreasModule } from '@marxan-geoprocessing/modules/admin-areas/admin-areas.module';
import { ProtectedAreasModule } from '@marxan-geoprocessing/modules/protected-areas/protected-areas.module';
import { PlanningUnitsModule } from '@marxan-geoprocessing/modules/planning-units/planning-units.module';
import { TileModule } from './modules/tile/tile.module';
import { FeaturesModule } from '@marxan-geoprocessing/modules/features/features.module';
import { ApiEventsModule } from './modules/api-events/api-events.module';
import { SurfaceCostModule } from './modules/surface-cost/surface-cost.module';
import { ScenarioPlanningUnitsInclusionModule } from '@marxan-geoprocessing/modules/scenario-planning-units-inclusion/scenario-planning-units-inclusion.module';
import { CostTemplateModule } from '@marxan-geoprocessing/modules/scenarios';
import { PlanningAreaModule } from '@marxan-geoprocessing/modules/planning-area/planning-area.module';
import { MarxanSandboxedRunnerModule } from '@marxan-geoprocessing/marxan-sandboxed-runner/marxan-sandboxed-runner.module';
import { ScenariosModule } from '@marxan-geoprocessing/modules/scenarios/scenarios.module';
import { ScenarioProtectedAreaCalculationModule } from '@marxan-geoprocessing/modules/scenario-protected-area-calculation/scenario-protected-area-calculation.module';
import { ScenarioPlanningUnitsFeaturesAggregateModule } from '@marxan-geoprocessing/modules/scenario-planning-units-features-aggregate/scenario-planning-units-features-aggregate.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...geoprocessingConnections.default,
      keepConnectionAlive: true,
      migrationsTransactionMode: 'each',
    }),
    TypeOrmModule.forRoot({
      ...geoprocessingConnections.apiDB,
      keepConnectionAlive: true,
    }),
    CostTemplateModule,
    AdminAreasModule,
    PlanningUnitsModule,
    TileModule,
    ProtectedAreasModule,
    FeaturesModule,
    ApiEventsModule,
    SurfaceCostModule,
    ScenarioPlanningUnitsInclusionModule,
    ScenarioProtectedAreaCalculationModule,
    PlanningAreaModule,
    MarxanSandboxedRunnerModule,
    ScenariosModule,
    ScenarioPlanningUnitsFeaturesAggregateModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
