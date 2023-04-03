import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput, ExportJobOutput } from '@marxan/cloning';
import { ComponentLocation, ResourceKind } from '@marxan/cloning/domain';
import { ClonePieceRelativePathResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import { PlanningArea } from '@marxan/planning-area-repository/planning-area.geo.entity';
import { Injectable, ConsoleLogger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/Either';
import { Readable } from 'stream';
import { EntityManager } from 'typeorm';
import {
  ExportPieceProcessor,
  PieceExportProvider,
} from '../pieces/export-piece-processor';

type PlanningAreaGeojsonSelectResult = {
  geojson: string;
};

@Injectable()
@PieceExportProvider()
export class PlanningAreaCustomGeojsonPieceExporter
  implements ExportPieceProcessor {
  constructor(
    private readonly fileRepository: CloningFilesRepository,
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly geoprocessingEntityManager: EntityManager,
    private readonly logger: ConsoleLogger,
  ) {
    this.logger.setContext(PlanningAreaCustomGeojsonPieceExporter.name);
  }

  isSupported(piece: ClonePiece, kind: ResourceKind): boolean {
    return (
      piece === ClonePiece.PlanningAreaCustomGeojson &&
      kind === ResourceKind.Project
    );
  }

  async run(input: ExportJobInput): Promise<ExportJobOutput> {
    const projectId = input.resourceId;
    const [planningArea]: [
      PlanningAreaGeojsonSelectResult,
    ] = await this.geoprocessingEntityManager
      .createQueryBuilder()
      .select('ST_AsGeoJSON(the_geom)', 'geojson')
      .from(PlanningArea, 'pa')
      .where('project_id = :projectId', { projectId })
      .execute();

    if (!planningArea) {
      const errorMessage = `Custom planning area not found for project with ID: ${projectId}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const relativePath = ClonePieceRelativePathResolver.resolveFor(
      ClonePiece.PlanningAreaCustomGeojson,
    );

    const planningAreaGeoJson = await this.fileRepository.saveCloningFile(
      input.exportId,
      Readable.from(planningArea.geojson),
      relativePath,
    );

    if (isLeft(planningAreaGeoJson)) {
      const errorMessage = `${PlanningAreaCustomGeojsonPieceExporter.name} - Project Custom PA - couldn't save file - ${planningAreaGeoJson.left.description}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    return {
      ...input,
      uris: [new ComponentLocation(planningAreaGeoJson.right, relativePath)],
    };
  }
}
