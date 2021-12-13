import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProjectBlm } from '@marxan-api/modules/blm/values/repositories/project-blm.api.entity';

import { TypeormProjectBlmRepository } from './typeorm-project-blm-repository';
import { ProjectBlmRepo } from '../project-blm-repo';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectBlm])],
  providers: [
    {
      provide: ProjectBlmRepo,
      useClass: TypeormProjectBlmRepository,
    },
  ],
  exports: [ProjectBlmRepo],
})
export class ProjectBlmRepositoryModule {}
