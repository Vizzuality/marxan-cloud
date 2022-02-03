import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ScenarioAclService } from '@marxan-api/modules/access-control/scenarios-acl/scenario-acl.service';
import { UsersScenariosApiEntity } from '@marxan-api/modules/access-control/scenarios-acl/entity/users-scenarios.api.entity';
import { UsersProjectsApiEntity } from '@marxan-api/modules/access-control/projects-acl/entity/users-projects.api.entity';
import { UsersModule } from '@marxan-api/modules/users/users.module';
import { ScenariosModule } from '@marxan-api/modules/scenarios/scenarios.module';
import { LockService } from './locks/lock.service';
import { ScenarioLockEntity } from './locks/entity/scenario.lock.api.entity';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([UsersScenariosApiEntity]),
    TypeOrmModule.forFeature([UsersProjectsApiEntity]),
    TypeOrmModule.forFeature([ScenarioLockEntity]),
    forwardRef(() => UsersModule),
    forwardRef(() => ScenariosModule),
  ],
  providers: [ScenarioAclService, LockService],
  exports: [ScenarioAclService],
})
export class ScenarioAclModule {}
