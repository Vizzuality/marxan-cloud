import { Module } from '@nestjs/common';
import { PuDatReader } from './pu-dat.reader';
import { PuvsprDatReader } from './puvspr-dat.reader';
import { SpecDatReader } from './spec-dat.reader';

@Module({
  providers: [PuDatReader, SpecDatReader, PuvsprDatReader],
  exports: [PuDatReader, SpecDatReader, PuvsprDatReader],
})
export class FileReadersModule {}
