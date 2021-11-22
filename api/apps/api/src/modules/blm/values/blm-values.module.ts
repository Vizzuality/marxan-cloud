import { Module } from '@nestjs/common';
import { ProjectBlmRepositoryModule } from '@marxan-api/modules/blm/values/repositories/project-blm-repository.module';

@Module({
  imports: [ProjectBlmRepositoryModule],
  exports: [ProjectBlmRepositoryModule],
})
export class BlmValuesModule {}
