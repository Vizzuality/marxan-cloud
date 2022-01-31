import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TypeormScenarioBlmRepository } from './typeorm-scenario-blm-repository';
import { ScenarioBlm } from './scenario-blm.api.entity';
import { ScenarioBlmRepo } from '../../blm-repos';

@Module({
  imports: [TypeOrmModule.forFeature([ScenarioBlm])],
  providers: [
    {
      provide: ScenarioBlmRepo,
      useClass: TypeormScenarioBlmRepository,
    },
  ],
  exports: [ScenarioBlmRepo],
})
export class ScenarioBlmRepositoryModule {}
