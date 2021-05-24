import { FileService } from './files.service';
import { Logger, Module } from '@nestjs/common';

@Module({
  providers: [FileService, Logger],
  exports: [FileService],
})
export class FilesModule {}
