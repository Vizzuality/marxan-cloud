import { FileService } from './files.service';
import { ConsoleLogger, Module } from '@nestjs/common';

@Module({
  providers: [FileService, ConsoleLogger],
  exports: [FileService],
})
export class FilesModule {}
