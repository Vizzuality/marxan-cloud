import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProjectAccessControl } from '@marxan-api/modules/access-control/project-access-control';
import { ProjectAclService } from '@marxan-api/modules/projects-acl';
import { UsersProjectsApiEntity } from '@marxan-api/modules/projects/control-level/users-projects.api.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UsersProjectsApiEntity])],
  providers: [
    {
      provide: ProjectAccessControl,
      useClass: ProjectAclService,
    },
  ],
  exports: [ProjectAccessControl],
})
export class AccessControlModule {}
