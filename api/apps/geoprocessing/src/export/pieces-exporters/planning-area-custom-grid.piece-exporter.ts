import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput, ExportJobOutput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import { ClonePieceRelativePaths } from '@marxan/cloning/infrastructure/clone-piece-data';
import { FileRepository } from '@marxan/files-repository';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/Either';
import { GeoJSON } from 'geojson';
import { Readable } from 'stream';
import { EntityManager } from 'typeorm';
import {
  ExportPieceProcessor,
  PieceExportProvider,
} from '../pieces/export-piece-processor';

@Injectable()
@PieceExportProvider()
export class PlanningAreaCustomGridPieceExporter
  implements ExportPieceProcessor {
  constructor(
    private readonly fileRepository: FileRepository,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly entityManager: EntityManager,
  ) {}

  isSupported(piece: ClonePiece): boolean {
    // TODO resource kind filtering
    return piece === ClonePiece.PlanningAreaGridCustom;
  }

  async run(input: ExportJobInput): Promise<ExportJobOutput> {
    if (input.resourceKind === ResourceKind.Scenario) {
      throw new Error(`Exporting scenario is not yet supported.`);
    }

    const relativePaths =
      ClonePieceRelativePaths[ClonePiece.PlanningAreaGridCustom];

    const metadata = JSON.stringify({
      shape: 'square',
      areaKm2: 4000,
      bbox: [],
      file: relativePaths.customGridGeoJson,
    });

    const geoJson: GeoJSON = {
      bbox: [0, 0, 0, 0, 0, 0],
      coordinates: [],
      type: 'MultiPolygon',
    };

    const planningAreaGeoJson = await this.fileRepository.save(
      Readable.from(JSON.stringify(geoJson)),
    );

    const outputFile = await this.fileRepository.save(
      Readable.from(metadata),
      `json`,
    );

    if (isLeft(outputFile)) {
      throw new Error(
        `${PlanningAreaCustomGridPieceExporter.name} - Project Custom PA - couldn't save file - ${outputFile.left.description}`,
      );
    }

    if (isLeft(planningAreaGeoJson)) {
      throw new Error(
        `${PlanningAreaCustomGridPieceExporter.name} - Project Custom PA - couldn't save file - ${planningAreaGeoJson.left.description}`,
      );
    }

    return {
      ...input,
      uris: [
        {
          uri: outputFile.right,
          relativePath: relativePaths.projectGrid,
        },
        {
          uri: planningAreaGeoJson.right,
          relativePath: relativePaths.customGridGeoJson,
        },
      ],
    };
  }
}
