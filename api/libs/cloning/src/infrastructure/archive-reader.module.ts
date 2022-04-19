import { CloningFileSRepositoryModule } from '@marxan/cloning-files-repository';
import { Module } from '@nestjs/common';
import { ArchiveReaderAdapter } from './archive-reader.adapter';
import { ArchiveReader } from './archive-reader.port';

@Module({
  imports: [CloningFileSRepositoryModule],
  providers: [{ provide: ArchiveReader, useClass: ArchiveReaderAdapter }],
  exports: [ArchiveReader],
})
export class ArchiveReaderModule {}
