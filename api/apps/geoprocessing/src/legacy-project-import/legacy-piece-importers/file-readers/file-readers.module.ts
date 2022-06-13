import { MarxanInput } from '@marxan/marxan-input';
import { Module } from '@nestjs/common';
import { DatFileCommaOrTabFinder } from './dat-file.comma-or-tab-finder';
import { DatFileDelimiterFinder } from './dat-file.delimiter-finder';
import { InputDatReader } from './input-dat.reader';
import { PuDatReader } from './pu-dat.reader';
import { PuvsprDatReader } from './puvspr-dat.reader';
import { SpecDatReader } from './spec-dat.reader';

@Module({
  providers: [
    PuDatReader,
    SpecDatReader,
    PuvsprDatReader,
    InputDatReader,
    MarxanInput,
    { provide: DatFileDelimiterFinder, useClass: DatFileCommaOrTabFinder },
  ],
  exports: [PuDatReader, SpecDatReader, PuvsprDatReader, InputDatReader],
})
export class FileReadersModule {}
