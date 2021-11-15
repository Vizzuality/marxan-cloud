import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { ProjectAclService } from './project-acl.service';
import { ProjectAccessControl } from '@marxan-api/modules/access-control';

@Module({
  imports: [CqrsModule],
  providers: [ProjectAclService],
  exports: [ProjectAccessControl],
})
export class ProjectAclModule {}
