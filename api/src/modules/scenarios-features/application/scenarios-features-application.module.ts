import { DynamicModule, Module, ModuleMetadata } from '@nestjs/common';
import { ScenarioFeaturesService } from './scenario-features.service';

@Module({})
export class ScenariosFeaturesApplicationModule {
  static for(adaptersModule: ModuleMetadata['imports']): DynamicModule {
    return {
      module: ScenariosFeaturesApplicationModule,
      imports: [...(adaptersModule ?? [])],
      providers: [ScenarioFeaturesService],
      exports: [ScenarioFeaturesService],
    };
  }
}
