import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { geoprocessingConnections } from './ormconfig';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminAreasModule } from '@marxan-geoprocessing/modules/admin-areas/admin-areas.module';
import { ProtectedAreasModule } from '@marxan-geoprocessing/modules/protected-areas/protected-areas.module';
import { PlanningUnitsModule } from '@marxan-geoprocessing/modules/planning-units/planning-units.module';
import { TileModule } from '@marxan-geoprocessing/modules/tile/tile.module';
import { FeaturesModule } from '@marxan-geoprocessing/modules/features/features.module';
import { ApiEventsModule } from '@marxan-geoprocessing/modules/api-events/api-events.module';
import { CostSurfaceModule } from '@marxan-geoprocessing/modules/cost-surface/cost-surface.module';
import { ScenarioPlanningUnitsInclusionModule } from '@marxan-geoprocessing/modules/scenario-planning-units-inclusion/scenario-planning-units-inclusion.module';
import { FileTemplateModule } from '@marxan-geoprocessing/modules/scenarios';
import { PlanningAreaModule } from '@marxan-geoprocessing/modules/planning-area/planning-area.module';
import { ScenariosModule } from '@marxan-geoprocessing/modules/scenarios/scenarios.module';
import { ScenarioProtectedAreaCalculationModule } from '@marxan-geoprocessing/modules/scenario-protected-area-calculation/scenario-protected-area-calculation.module';
import { ScenarioPlanningUnitsFeaturesAggregateModule } from '@marxan-geoprocessing/modules/scenario-planning-units-features-aggregate/scenario-planning-units-features-aggregate.module';
import { ExportModule } from '@marxan-geoprocessing/export/export.module';
import { ImportModule } from '@marxan-geoprocessing/import/import.module';
import { PingController } from '@marxan-geoprocessing/modules/ping/ping.controller';
import { LegacyProjectImportModule } from './legacy-project-import/legacy-project-import.module';
import { UnusedResourcesCleanUpModule } from './modules/unused-resources-cleanup/unused-resources-cleanup.module';
import { CleanupTasksModule } from './modules/cleanup-tasks/cleanup-tasks.module';

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
    FileTemplateModule,
    AdminAreasModule,
    PlanningUnitsModule,
    TileModule,
    ProtectedAreasModule,
    FeaturesModule,
    ApiEventsModule,
    CostSurfaceModule,
    ScenarioPlanningUnitsInclusionModule,
    ScenarioProtectedAreaCalculationModule,
    PlanningAreaModule,
    ScenariosModule,
    ScenarioPlanningUnitsFeaturesAggregateModule,
    ExportModule,
    ImportModule,
    LegacyProjectImportModule,
    UnusedResourcesCleanUpModule,
    ScheduleModule.forRoot(),
    CleanupTasksModule,
  ],
  controllers: [AppController, PingController],
  providers: [AppService],
})
export class AppModule {}
