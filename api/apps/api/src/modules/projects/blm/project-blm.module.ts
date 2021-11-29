import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { BlmModule } from '@marxan-api/modules/blm';

import { SetProjectBlmHandler } from './set-project-blm-handler';
import { ProjectBlmSaga } from './project-blm.saga';
import { ChangeBlmRangeHandler } from './change-blm-range.handler';

@Module({
  imports: [CqrsModule, BlmModule],
  providers: [SetProjectBlmHandler, ChangeBlmRangeHandler, ProjectBlmSaga],
})
export class ProjectBlmModule {}
