import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApiEventsModule } from '@marxan-api/modules/api-events/api-events.module';

import { DbSpecificationRepository } from './specification.repository';
import { SpecificationApiEntity } from './specification.api.entity';
import { SpecificationFeatureConfigApiEntity } from './specification-feature-config.api.entity';
import { SpecificationCandidateCreatedHandler } from './specification-candidate-created.handler';

import { SpecificationRepository } from '../application/specification.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SpecificationApiEntity,
      SpecificationFeatureConfigApiEntity,
    ]),
    ApiEventsModule,
  ],
  providers: [
    {
      provide: SpecificationRepository,
      useClass: DbSpecificationRepository,
    },
    SpecificationCandidateCreatedHandler,
  ],
  exports: [SpecificationRepository],
})
export class SpecificationAdaptersModule {}
