import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BlmFinalResultEntity } from '@marxan/blm-calibration/blm-final-results.geo.entity';

import { BlmFinalResultsRepository } from './blm-final-results.repository';
import { BlmFinalResultsTypeormRepository } from './blm-final-results.typeorm-repository';

@Module({
  imports: [TypeOrmModule.forFeature([BlmFinalResultEntity])],
  providers: [
    {
      provide: BlmFinalResultsRepository,
      useClass: BlmFinalResultsTypeormRepository,
    },
  ],
  exports: [BlmFinalResultsRepository],
})
export class BlmFinalResultsRepositoryModule {}
