import { Module } from '@nestjs/common';
import { PuDatReader } from './pu-dat.reader';
import { SpecDatReader } from './spec-dat.reader';

@Module({
  providers: [PuDatReader, SpecDatReader],
  exports: [PuDatReader, SpecDatReader],
})
export class FileReadersModule {}
