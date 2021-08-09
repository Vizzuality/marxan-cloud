import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DbSpecificationRepository } from './specification.repository';
import { SpecificationApiEntity } from './specification.api.entity';
import { SpecificationFeatureConfigApiEntity } from './specification-feature-config.api.entity';
import { SpecificationFeatureApiEntity } from './specification-feature.api.entity';

import { SpecificationRepository } from '../application/specification.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SpecificationApiEntity,
      SpecificationFeatureConfigApiEntity,
      SpecificationFeatureApiEntity,
    ]),
  ],
  providers: [
    {
      provide: SpecificationRepository,
      useClass: DbSpecificationRepository,
    },
  ],
  exports: [SpecificationRepository],
})
export class SpecificationAdaptersModule {}
