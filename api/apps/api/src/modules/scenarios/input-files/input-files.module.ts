import { Module } from '@nestjs/common';
import { BoundDatModule } from './bound.dat.module';
import { PuvsprDatModule } from './puvspr.dat.module';
import { SpecDatModule } from './spec.dat.module';
import { InputFilesService } from './input-files.service';

@Module({
  imports: [BoundDatModule, PuvsprDatModule, SpecDatModule],
  providers: [InputFilesService],
  exports: [InputFilesService],
})
export class InputFilesModule {}
