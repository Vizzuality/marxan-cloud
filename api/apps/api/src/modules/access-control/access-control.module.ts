import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersProjectsApiEntity } from './projects-acl/entity/users-projects.api.entity';
import { UsersScenariosApiEntity } from './scenarios-acl/entity/users-scenarios.api.entity';

import { ProjectAccessControl } from './projects-acl/project-access-control';
import { ProjectAclService } from './projects-acl/project-acl.service';
import { ProjectAclController } from './projects-acl/project-acl.controller';
import { ProjectAclModule } from './projects-acl/project-acl.module';
import { ScenarioAclModule } from './scenarios-acl/scenario-acl.module';
import { ScenarioAccessControl } from './scenarios-acl/scenario-access-control';
import { ScenarioAclService } from './scenarios-acl/scenario-acl.service';
import { ScenarioAclController } from './scenarios-acl/scenario-acl.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsersProjectsApiEntity]),
    ProjectAclModule,
    TypeOrmModule.forFeature([UsersScenariosApiEntity]),
    ScenarioAclModule,
  ],
  providers: [
    {
      provide: ProjectAccessControl,
      useClass: ProjectAclService,
    },
    {
      provide: ScenarioAccessControl,
      useClass: ScenarioAclService,
    },
  ],
  controllers: [ProjectAclController, ScenarioAclController],
  exports: [ProjectAccessControl, ScenarioAccessControl],
})
export class AccessControlModule {}
