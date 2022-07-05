import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StripSingleSplitConfigFeatureValue } from '@marxan-api/modules/features-hash/strip-single-split-config-feature-value.service';
import { SingleConfigFeatureValueHasher } from './single-config-feature-value.hasher';

@Module({
  imports: [TypeOrmModule.forFeature()],
  providers: [
    StripSingleSplitConfigFeatureValue,
    SingleConfigFeatureValueHasher,
  ],
  exports: [SingleConfigFeatureValueHasher],
})
export class FeatureHashModule {}
