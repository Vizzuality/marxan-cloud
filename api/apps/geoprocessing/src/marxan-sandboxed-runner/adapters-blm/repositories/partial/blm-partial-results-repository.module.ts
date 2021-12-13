import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BlmPartialResultEntity } from '@marxan/blm-calibration/blm-partial-results.geo.entity';

import { BlmPartialResultsRepository } from './blm-partial-results.repository';
import { BlmPartialResultsTypeormRepository } from './blm-partial-results.typeorm-repository';

@Module({
  imports: [TypeOrmModule.forFeature([BlmPartialResultEntity])],
  providers: [
    {
      provide: BlmPartialResultsRepository,
      useClass: BlmPartialResultsTypeormRepository,
    },
  ],
  exports: [BlmPartialResultsRepository],
})
export class BlmPartialResultsRepositoryModule {}
