import { DynamicModule, Module, ModuleMetadata } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CalculateFeaturesHandler } from './calculate-features.handler';
import { DetermineFeaturesHandler } from './determine-features.handler';
import { SubmitSpecificationHandler } from './submit-specification.handler';
import { GetSpecificationHandler } from './get-specification.handler';
import { CalculateFeaturesSaga } from './calculate-features.saga';
import { DetermineFeaturesSaga } from './determine-features.saga';

@Module({})
export class SpecificationApplicationModule {
  static for(adaptersModule: ModuleMetadata['imports']): DynamicModule {
    return {
      module: SpecificationApplicationModule,
      imports: [CqrsModule, ...(adaptersModule ?? [])],
      providers: [
        CalculateFeaturesHandler,
        DetermineFeaturesHandler,
        SubmitSpecificationHandler,
        GetSpecificationHandler,
        CalculateFeaturesSaga,
        DetermineFeaturesSaga,
      ],
    };
  }
}
