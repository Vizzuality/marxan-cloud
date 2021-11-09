import { Module } from '@nestjs/common';

import { BlmValuesModule } from './values/blm-values.module';

@Module({
  imports: [BlmValuesModule],
  exports: [BlmValuesModule],
})
export class BlmModule {}
