import { ProjectBlmRepositoryToken } from '@marxan-api/modules/blm/values/repositories/project-blm-repository';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectBlm } from '@marxan-api/modules/blm/values/repositories/project-blm.api.entity';
import { TypeormProjectBlmRepository } from '@marxan-api/modules/blm/values/repositories/typeorm-project-blm-repository';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectBlm])],
  providers: [
    {
      provide: ProjectBlmRepositoryToken,
      useClass: TypeormProjectBlmRepository,
    },
  ],
  exports: [ProjectBlmRepositoryToken],
})
export class ProjectBlmRepositoryModule {}
