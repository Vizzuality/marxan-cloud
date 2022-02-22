import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { FileRepositoryModule } from '@marxan/files-repository';
import { Logger, Module, Scope } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectMetadataPieceImporter } from './project-metadata.piece-importer';
import { ScenarioMetadataPieceImporter } from './scenario-metadata.piece-importer';

@Module({
  imports: [
    FileRepositoryModule,
    TypeOrmModule.forFeature([], geoprocessingConnections.apiDB),
  ],
  providers: [
    ProjectMetadataPieceImporter,
    ScenarioMetadataPieceImporter,
    { provide: Logger, useClass: Logger, scope: Scope.TRANSIENT },
  ],
})
export class PiecesImportersModule {}
