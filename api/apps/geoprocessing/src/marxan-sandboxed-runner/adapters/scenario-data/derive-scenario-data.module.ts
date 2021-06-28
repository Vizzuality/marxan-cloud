import { HttpModule, Module } from '@nestjs/common';
import { InputFiles } from '../../ports/input-files';
import { DeriveScenarioFacade } from './derive-scenario.facade';

@Module({
  imports: [HttpModule],
  providers: [
    {
      provide: InputFiles,
      useClass: DeriveScenarioFacade,
    },
  ],
  exports: [InputFiles],
})
export class DeriveScenarioDataModule {}
