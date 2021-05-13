import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ScenariosController } from './scenarios.controller';
import { Scenario } from './scenario.api.entity';
import { ScenariosService } from './scenarios.service';
import { UsersModule } from 'modules/users/users.module';
import { Project } from 'modules/projects/project.api.entity';
import { ProtectedAreasModule } from 'modules/protected-areas/protected-areas.module';
import { ProjectsModule } from 'modules/projects/projects.module';
import { ScenarioFeaturesModule } from '../scenarios-features';
import { ProxyService } from 'modules/proxy/proxy.service';
import { WdpaAreaCalculationService } from './wdpa-area-calculation.service';
import { CostSurfaceFacade } from './cost-surface/cost-surface.facade';
import { AnalysisModule } from '../analysis/analysis.module';

@Module({
  imports: [
    AnalysisModule,
    ProtectedAreasModule,
    forwardRef(() => ProjectsModule),
    TypeOrmModule.forFeature([Project, Scenario]),
    UsersModule,
    ScenarioFeaturesModule,
  ],
  providers: [
    ScenariosService,
    ProxyService,
    WdpaAreaCalculationService,
    CostSurfaceFacade,
  ],
  controllers: [ScenariosController],
  exports: [ScenariosService],
})
export class ScenariosModule {}
