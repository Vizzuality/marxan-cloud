import { ProjectBlmRepository } from '@marxan-api/modules/blm/values/project-blm-repository';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectBlm } from '@marxan-api/modules/blm/values/repositories/project-blm.api.entity';
import { TypeormProjectBlmRepository } from '@marxan-api/modules/blm/values/repositories/typeorm-project-blm-repository';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectBlm])],
  providers: [
    {
      provide: ProjectBlmRepository,
      useClass: TypeormProjectBlmRepository,
    },
  ],
  exports: [ProjectBlmRepository],
})
export class ProjectBlmRepositoryModule {}
