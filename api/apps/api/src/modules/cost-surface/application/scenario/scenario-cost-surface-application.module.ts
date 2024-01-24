import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { LinkCostSurfaceToScenarioHandler } from '@marxan-api/modules/cost-surface/application/scenario/link-cost-surface-to-scenario.handler';
import { ScenarioCostSurfaceInfraModule } from '@marxan-api/modules/cost-surface/infra/scenario/scenario-cost-surface-infra.module';
import { ScenarioCostSurfaceAdaptersModule } from '@marxan-api/modules/cost-surface/adapters/scenario-cost-surface-adapters.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';

@Module({
  imports: [
    ScenarioCostSurfaceInfraModule,
    ScenarioCostSurfaceAdaptersModule,
    CqrsModule,
    TypeOrmModule.forFeature([Scenario]),
  ],
  providers: [LinkCostSurfaceToScenarioHandler],
})
export class ScenarioCostSurfaceApplicationModule {}
