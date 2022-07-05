import { DynamicModule, Module } from '@nestjs/common';
import { getEntityManagerToken, TypeOrmModule } from '@nestjs/typeorm';
import { StripSingleSplitConfigFeatureValue } from './strip-single-split-config-feature-value.service';
import {
  entityManagerToken,
  SingleConfigFeatureValueHasher,
} from './single-config-feature-value.hasher';

@Module({})
export class FeatureHashModule {
  static for(connectionName?: string): DynamicModule {
    return {
      module: FeatureHashModule,
      imports: [TypeOrmModule.forFeature([], connectionName)],
      providers: [
        {
          provide: entityManagerToken,
          useValue: getEntityManagerToken(connectionName),
        },
        StripSingleSplitConfigFeatureValue,
        SingleConfigFeatureValueHasher,
      ],
      exports: [SingleConfigFeatureValueHasher],
    };
  }
}
