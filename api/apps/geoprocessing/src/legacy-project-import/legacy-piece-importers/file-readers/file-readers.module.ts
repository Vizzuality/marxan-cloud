import { Module } from '@nestjs/common';
import { PuDatReader } from './pu-dat.reader';

@Module({
  providers: [PuDatReader],
  exports: [PuDatReader],
})
export class FileReadersModule {}
