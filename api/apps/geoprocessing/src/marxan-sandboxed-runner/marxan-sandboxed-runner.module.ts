import { Module } from '@nestjs/common';

import { SingleRunAdapterModule } from './adapters-single/single-run-adapter.module';
import { BlmRunAdapterModule } from './adapters-blm/blm-run-adapter.module';

@Module({
  imports: [SingleRunAdapterModule],
  exports: [SingleRunAdapterModule],
})
export class MarxanSandboxedSingleRunnerModule {}

@Module({
  imports: [BlmRunAdapterModule],
  exports: [BlmRunAdapterModule],
})
export class MarxanSandboxedBlmRunnerModule {}
