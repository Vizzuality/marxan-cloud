import { Module } from '@nestjs/common';
import { InputFiles } from '../../ports/input-files';
import { DeriveScenarioFacade } from './derive-scenario.facade';

@Module({
  providers: [
    {
      provide: InputFiles,
      useClass: DeriveScenarioFacade,
    },
  ],
  exports: [InputFiles],
})
export class DeriveScenarioDataModule {}
