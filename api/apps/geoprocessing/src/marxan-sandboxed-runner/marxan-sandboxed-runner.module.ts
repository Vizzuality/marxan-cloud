import { DynamicModule, Module } from '@nestjs/common';

import { SingleRunAdapterModule } from './adapters-single/single-run-adapter.module';
import { BlmRunAdapterModule } from './adapters-blm/blm-run-adapter.module';

@Module({})
export class MarxanSandboxedRunnerModule {
  static forSingle(): DynamicModule {
    return {
      module: MarxanSandboxedRunnerModule,
      imports: [SingleRunAdapterModule],
      exports: [SingleRunAdapterModule],
    };
  }
  static forCalibration(): DynamicModule {
    return {
      module: MarxanSandboxedRunnerModule,
      imports: [BlmRunAdapterModule],
      exports: [BlmRunAdapterModule],
    };
  }
}
