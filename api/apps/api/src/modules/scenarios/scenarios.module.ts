import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

import { ScenariosController } from './scenarios.controller';
import { Scenario } from './scenario.api.entity';
import { ScenariosService } from './scenarios.service';
import { UsersModule } from '@marxan-api/modules/users/users.module';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { ProtectedAreasModule } from '@marxan-api/modules/protected-areas/protected-areas.module';
import { ProjectsModule } from '@marxan-api/modules/projects/projects.module';
import { ScenarioFeaturesModule } from '../scenarios-features';
import { ProxyService } from '@marxan-api/modules/proxy/proxy.service';
import { WdpaAreaCalculationService } from './wdpa-area-calculation.service';
import { AnalysisModule } from '../analysis/analysis.module';
import { CostSurfaceFacade } from './cost-surface/cost-surface.facade';
import { ResolvePuWithCost } from './cost-surface/resolve-pu-with-cost';
import { CostSurfaceEventsPort } from './cost-surface/cost-surface-events.port';
import { GeoprocessingCostFromShapefile } from './cost-surface/adapters/geoprocessing-cost-from-shapefile';
import { CostSurfaceApiEvents } from './cost-surface/adapters/cost-surface-api-events';
import { ApiEventsModule } from '../api-events/api-events.module';

@Module({
  imports: [
    CqrsModule,
    ProtectedAreasModule,
    forwardRef(() => ProjectsModule),
    TypeOrmModule.forFeature([Project, Scenario]),
    UsersModule,
    ScenarioFeaturesModule,
    AnalysisModule,
    ApiEventsModule,
  ],
  providers: [
    ScenariosService,
    ProxyService,
    WdpaAreaCalculationService,
    CostSurfaceFacade,
    // internals for cost-surface
    {
      provide: ResolvePuWithCost,
      useClass: GeoprocessingCostFromShapefile,
    },
    {
      provide: CostSurfaceEventsPort,
      useClass: CostSurfaceApiEvents,
    },
  ],
  controllers: [ScenariosController],
  exports: [ScenariosService],
})
export class ScenariosModule {}
