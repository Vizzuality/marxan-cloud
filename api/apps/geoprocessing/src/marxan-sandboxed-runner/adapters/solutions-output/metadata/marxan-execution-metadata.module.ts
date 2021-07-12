import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarxanExecutionMetadataGeoEntity } from '@marxan/marxan-output';

import { MarxanExecutionMetadataRepository } from './metadata-exection-metadata.repository';
import { MetadataArchiver } from './data-archiver.service';
import { MarxanDirectory } from '../../marxan-directory.service';
import { FileReader } from '../../file-reader';

@Module({
  imports: [TypeOrmModule.forFeature([MarxanExecutionMetadataGeoEntity])],
  providers: [
    MarxanExecutionMetadataRepository,
    MetadataArchiver,
    MarxanDirectory,
    FileReader,
  ],
  exports: [MarxanExecutionMetadataRepository],
})
export class MarxanExecutionMetadataModule {}
