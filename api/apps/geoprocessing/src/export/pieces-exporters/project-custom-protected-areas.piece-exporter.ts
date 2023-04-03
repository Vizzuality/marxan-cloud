import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput, ExportJobOutput } from '@marxan/cloning';
import { ComponentLocation, ResourceKind } from '@marxan/cloning/domain';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import { Injectable, ConsoleLogger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import {
  ExportPieceProcessor,
  PieceExportProvider,
} from '../pieces/export-piece-processor';
import { Readable } from 'stream';
import { isLeft } from 'fp-ts/lib/Either';
import { ClonePieceRelativePathResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
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
    private readonly fileRepository: CloningFilesRepository,
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly geoprocessingEntityManager: EntityManager,
    private readonly logger: ConsoleLogger,
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

    const relativePath = ClonePieceRelativePathResolver.resolveFor(
      ClonePiece.ProjectCustomProtectedAreas,
    );

    const outputFile = await this.fileRepository.saveCloningFile(
      input.exportId,
      Readable.from(JSON.stringify(content)),
      relativePath,
    );

    if (isLeft(outputFile)) {
      const errorMessage = `${ProjectCustomProtectedAreasPieceExporter.name} - Project Custom Protected Areas - couldn't save file - ${outputFile.left.description}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    return {
      ...input,
      uris: [new ComponentLocation(outputFile.right, relativePath)],
    };
  }
}
