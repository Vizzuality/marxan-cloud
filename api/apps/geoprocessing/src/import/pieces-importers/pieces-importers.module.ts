import { Logger, Module, Scope } from '@nestjs/common';
import { FileRepositoryModule } from '@marxan/files-repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ProjectMetadataPieceImporter } from './project-metadata.piece-importer';

@Module({
  imports: [
    FileRepositoryModule,
    TypeOrmModule.forFeature([], geoprocessingConnections.apiDB),
  ],
  providers: [
    ProjectMetadataPieceImporter,
    { provide: Logger, useClass: Logger, scope: Scope.TRANSIENT },
  ],
})
export class PiecesImportersModule {}
