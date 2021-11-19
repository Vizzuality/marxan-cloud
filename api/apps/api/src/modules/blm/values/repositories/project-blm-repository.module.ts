import { ProjectBlmRepositoryToken } from '@marxan-api/modules/blm/values/repositories/project-blm-repository';
import { MemoryProjectBlmRepository } from '@marxan-api/modules/blm/values/repositories/memory-project-blm-repository';
import { Module } from '@nestjs/common';

@Module({
  //imports: [TypeOrmModule.forFeature([ProjectBlm])],
  providers: [
    {
      provide: ProjectBlmRepositoryToken,
      useFactory: () => MemoryProjectBlmRepository,
    },
  ],
  exports: [ProjectBlmRepositoryToken],
})
export class ProjectBlmRepositoryModule {}
