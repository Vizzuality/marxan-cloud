import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput, ExportJobOutput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import { FileRepository } from '@marxan/files-repository';
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import {
  ExportPieceProcessor,
  PieceExportProvider,
} from '../pieces/export-piece-processor';
import { Readable } from 'stream';
import { isLeft } from 'fp-ts/lib/Either';
import { ClonePieceUrisResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import { ProjectCustomProtectedAreasContent } from '@marxan/cloning/infrastructure/clone-piece-data/project-custom-protected-areas';

interface ProjectCustomProtectedAreasSelectResult {
  fullname: string;
  ewkb: Buffer;
}

@Injectable()
@PieceExportProvider()
export class ProjectCustomProtectedAreasPieceExporter
  implements ExportPieceProcessor {
  constructor(
    private readonly fileRepository: FileRepository,
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly geoprocessingEntityManager: EntityManager,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(ProjectCustomProtectedAreasPieceExporter.name);
  }

  isSupported(piece: ClonePiece, kind: ResourceKind): boolean {
    return (
      piece === ClonePiece.ProjectCustomProtectedAreas &&
      kind === ResourceKind.Project
    );
  }

  async run(input: ExportJobInput): Promise<ExportJobOutput> {
    console.log('hola');
    const customProtectedAreas: ProjectCustomProtectedAreasSelectResult[] = await this.geoprocessingEntityManager.query(
      `
          SELECT ST_AsEWKB(the_geom) as ewkb, full_name as fullname
          FROM wdpa
          WHERE project_id = $1
        `,
      [input.resourceId],
    );

    console.log(customProtectedAreas);

    const content = customProtectedAreas.map<ProjectCustomProtectedAreasContent>(
      (protectedArea) => {
        return {
          fullName: protectedArea.fullname,
          ewkb: protectedArea.ewkb.toJSON().data,
        };
      },
    );
    console.log(content);

    const outputFile = await this.fileRepository.save(
      Readable.from(JSON.stringify(content)),
      `json`,
    );

    if (isLeft(outputFile)) {
      const errorMessage = `${ProjectCustomProtectedAreasPieceExporter.name} - Project Custom Protected Areas - couldn't save file - ${outputFile.left.description}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    return {
      ...input,
      uris: ClonePieceUrisResolver.resolveFor(
        ClonePiece.ProjectCustomProtectedAreas,
        outputFile.right,
      ),
    };
  }
}
