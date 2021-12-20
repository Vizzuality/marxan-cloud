import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ScenarioAclService } from './scenario-acl.service';
import { UsersScenariosApiEntity } from '@marxan-api/modules/access-control/scenarios-acl/entity/users-scenarios.api.entity';

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([UsersScenariosApiEntity])],
  providers: [ScenarioAclService],
  exports: [ScenarioAclService],
})
export class ScenarioAclModule {}
