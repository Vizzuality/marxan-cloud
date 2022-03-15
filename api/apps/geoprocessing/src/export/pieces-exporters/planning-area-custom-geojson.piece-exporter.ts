import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput, ExportJobOutput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import { ClonePieceUrisResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import { FileRepository } from '@marxan/files-repository';
import { PlanningUnitGridShape } from '@marxan/scenarios-planning-unit';
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/Either';
import { Readable } from 'stream';
import { EntityManager } from 'typeorm';
import {
  ExportPieceProcessor,
  PieceExportProvider,
} from '../pieces/export-piece-processor';

interface PlanningAreaGeojsonSelectResult {
  geojson: string;
}

@Injectable()
@PieceExportProvider()
export class PlanningAreaCustomGeojsonPieceExporter
  implements ExportPieceProcessor {
  constructor(
    private readonly fileRepository: FileRepository,
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly geoprocessingEntityManager: EntityManager,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly apiEntityManager: EntityManager,
    private readonly logger: Logger,
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
    const [planningArea]: [
      PlanningAreaGeojsonSelectResult,
    ] = await this.geoprocessingEntityManager.query(
      `
        SELECT ST_AsGeoJSON(the_geom) as geojson
        FROM planning_areas
        WHERE project_id = $1
      `,
      [input.resourceId],
    );

    if (!planningArea) {
      const errorMessage = `Custom planning area not found for project with ID: ${input.resourceId}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const planningAreaGeoJson = await this.fileRepository.save(
      Readable.from(planningArea.geojson),
      `json`,
    );

    if (isLeft(planningAreaGeoJson)) {
      const errorMessage = `${PlanningAreaCustomGeojsonPieceExporter.name} - Project Custom PA - couldn't save file - ${planningAreaGeoJson.left.description}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    return {
      ...input,
      uris: ClonePieceUrisResolver.resolveFor(
        ClonePiece.PlanningAreaCustomGeojson,
        planningAreaGeoJson.right,
      ),
    };
  }
}
