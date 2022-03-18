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
import { ProtectedArea } from '@marxan/protected-areas';

type ProjectCustomProtectedAreasSelectResult = {
  fullName: string;
  ewkb: Buffer;
};

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
    const customProtectedAreas: ProjectCustomProtectedAreasSelectResult[] = await this.geoprocessingEntityManager
      .createQueryBuilder()
      .select('ST_AsEWKB(wdpa.the_geom)', 'ewkb')
      .addSelect('full_name', 'fullName')
      .from(ProtectedArea, 'wdpa')
      .where('project_id = :projectId', { projectId: input.resourceId })
      .execute();

    const content = customProtectedAreas.map<ProjectCustomProtectedAreasContent>(
      (protectedArea) => {
        return {
          fullName: protectedArea.fullName,
          ewkb: protectedArea.ewkb.toJSON().data,
        };
      },
    );

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
