import { Module } from '@nestjs/common';

import { ProjectBlmRepository } from './project-blm-repository';
import { TypeormProjectBlmRepository } from './typeorm-project-blm-repository';

@Module({
  imports: [
    /**
     * TypeORM etc.
     */
  ],
  providers: [
    {
      provide: ProjectBlmRepository,
      useClass: TypeormProjectBlmRepository,
    },
  ],
  exports: [ProjectBlmRepository],
})
export class BlmValuesModule {}
