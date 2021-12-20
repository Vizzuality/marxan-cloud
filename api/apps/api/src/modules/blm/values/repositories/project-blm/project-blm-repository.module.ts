import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TypeormProjectBlmRepository } from './typeorm-project-blm-repository';
import { ProjectBlm } from './project-blm.api.entity';
import { ProjectBlmRepo } from '../../project-blm-repo';

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
