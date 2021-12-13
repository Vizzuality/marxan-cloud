import { Module } from '@nestjs/common';
import { ProjectMetadata } from './project-metadata';

@Module({
  providers: [ProjectMetadata],
})
export class PiecesExportersModule {}
