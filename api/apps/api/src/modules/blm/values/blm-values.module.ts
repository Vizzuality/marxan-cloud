import { Module } from '@nestjs/common';
import { ProjectBlmRepositoryModule } from './repositories/project-blm-repository.module';

@Module({
  imports: [ProjectBlmRepositoryModule],
  exports: [ProjectBlmRepositoryModule],
})
export class BlmValuesModule {}
