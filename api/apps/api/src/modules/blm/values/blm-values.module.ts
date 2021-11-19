import { Module } from '@nestjs/common';

import { ProjectBlmRepository } from '@marxan-api/modules/blm';
import { TypeormProjectBlmRepository } from './repositories/typeorm-project-blm-repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectBlm } from '@marxan-api/modules/blm/values/repositories/project-blm.api.entity';
import { MemoryProjectBlmRepository } from '@marxan-api/modules/blm/values/repositories/memory-project-blm-repository';
import { ProjectBlmRepositoryToken } from '@marxan-api/modules/blm/values/repositories/project-blm-repository';
import { ProjectBlmRepositoryModule } from '@marxan-api/modules/blm/values/repositories/project-blm-repository.module';

@Module({
  imports: [ProjectBlmRepositoryModule],
  exports: [ProjectBlmRepositoryModule],
})
export class BlmValuesModule {}
