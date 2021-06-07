import { forwardRef, Module, HttpModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

import { ScenariosController } from './scenarios.controller';
import { Scenario } from './scenario.api.entity';
import { ScenariosCrudService } from './scenarios-crud.service';
import { UsersModule } from '@marxan-api/modules/users/users.module';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { ProtectedAreasModule } from '@marxan-api/modules/protected-areas/protected-areas.module';
import { ProjectsModule } from '@marxan-api/modules/projects/projects.module';
import { ScenarioFeaturesModule } from '../scenarios-features';
import { ProxyService } from '@marxan-api/modules/proxy/proxy.service';
import { WdpaAreaCalculationService } from './wdpa-area-calculation.service';
import { AnalysisModule } from '../analysis/analysis.module';
import { CostSurfaceModule } from './cost-surface/cost-surface.module';
import { ScenarioService } from './scenario.service';
import { ScenarioSerializer } from './dto/scenario.serializer';

@Module({
  imports: [
    CqrsModule,
    ProtectedAreasModule,
    forwardRef(() => ProjectsModule),
    TypeOrmModule.forFeature([Project, Scenario]),
    UsersModule,
    ScenarioFeaturesModule,
    AnalysisModule,
    CostSurfaceModule,
    HttpModule,
  ],
  providers: [
    ScenarioService,
    ScenariosCrudService,
    ProxyService,
    WdpaAreaCalculationService,
    ScenarioSerializer,
  ],
  controllers: [ScenariosController],
  exports: [ScenariosCrudService, ScenarioService],
})
export class ScenariosModule {}
