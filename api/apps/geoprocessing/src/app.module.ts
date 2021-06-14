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

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...geoprocessingConnections.default,
      keepConnectionAlive: true,
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
