import { Module } from '@nestjs/common';

import { AccessControlService } from './access-control.service';
import { ProjectAclModule } from '@marxan-api/modules/projects-acl';

@Module({
  imports: [ProjectAclModule],
  providers: [AccessControlService],
  exports: [AccessControlService],
})
export class AccessControlModule {}
