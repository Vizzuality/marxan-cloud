import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput, ExportJobOutput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import { ClonePieceRelativePaths } from '@marxan/cloning/infrastructure/clone-piece-data';
import { PlanningAreaCustomContent } from '@marxan/cloning/infrastructure/clone-piece-data/planning-area-custom';
import { FileRepository } from '@marxan/files-repository';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/Either';
import { Readable } from 'stream';
import { EntityManager } from 'typeorm';
import {
  ExportPieceProcessor,
  PieceExportProvider,
} from '../pieces/export-piece-processor';

interface SelectResult {
  geojson: string;
  ewkb: Buffer;
}

@Injectable()
@PieceExportProvider()
export class PlanningAreaCustomPieceExporter implements ExportPieceProcessor {
  constructor(
    private readonly fileRepository: FileRepository,
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly entityManager: EntityManager,
  ) {}

  isSupported(piece: ClonePiece, kind: ResourceKind): boolean {
    return (
      piece === ClonePiece.PlanningAreaCustom && kind === ResourceKind.Project
    );
  }

  async run(input: ExportJobInput): Promise<ExportJobOutput> {
    const relativePaths =
      ClonePieceRelativePaths[ClonePiece.PlanningAreaCustom];

    const [result]: [SelectResult] = await this.entityManager.query(
      `
        SELECT ST_AsEWKB(the_geom) as ewkb, ST_AsGeoJSON(the_geom) as geojson
        FROM planning_areas
        WHERE project_id = $1
      `,
      [input.resourceId],
    );

    if (!result) {
      throw new Error(
        `Custom planning area not found for project with ID: ${input.resourceId}`,
      );
    }

    const planningAreaGeoJson = await this.fileRepository.save(
      Readable.from(result.geojson),
      `json`,
    );

    const content: PlanningAreaCustomContent = {
      planningAreaGeom: result.ewkb.toJSON().data,
    };

    const outputFile = await this.fileRepository.save(
      Readable.from(JSON.stringify(content)),
      `json`,
    );

    if (isLeft(outputFile)) {
      throw new Error(
        `${PlanningAreaCustomPieceExporter.name} - Project Custom PA - couldn't save file - ${outputFile.left.description}`,
      );
    }

    if (isLeft(planningAreaGeoJson)) {
      throw new Error(
        `${PlanningAreaCustomPieceExporter.name} - Project Custom PA - couldn't save file - ${planningAreaGeoJson.left.description}`,
      );
    }

    return {
      ...input,
      uris: [
        {
          uri: outputFile.right,
          relativePath: relativePaths.planningArea,
        },
        {
          uri: planningAreaGeoJson.right,
          relativePath: relativePaths.customPaGeoJson,
        },
      ],
    };
  }
}
