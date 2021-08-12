import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GeoFeaturesModule as GeoModule } from '@marxan-api/modules/geo-features/geo-features.module';

import { SpecificationService } from './specification.service';
import { GeoFeatureDtoMapper } from './geo-feature-dto.mapper';

@Module({
  imports: [CqrsModule, GeoModule],
  providers: [SpecificationService, GeoFeatureDtoMapper],
  exports: [SpecificationService],
})
export class SpecificationModule {}
