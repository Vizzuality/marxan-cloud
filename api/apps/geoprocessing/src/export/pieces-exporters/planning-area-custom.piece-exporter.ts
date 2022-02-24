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
import { PlanningUnitGridShape } from '@marxan/scenarios-planning-unit';
import {
  ExportPieceProcessor,
  PieceExportProvider,
} from '../pieces/export-piece-processor';

interface PlanningAreaSelectResult {
  geojson: string;
  ewkb: Buffer;
}

interface ProjectSelectResult {
  planning_unit_grid_shape: PlanningUnitGridShape;
  planning_unit_area_km2: number;
}

@Injectable()
@PieceExportProvider()
export class PlanningAreaCustomPieceExporter implements ExportPieceProcessor {
  constructor(
    private readonly fileRepository: FileRepository,
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly geoprocessingEntityManager: EntityManager,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly apiEntityManager: EntityManager,
  ) {}

  isSupported(piece: ClonePiece, kind: ResourceKind): boolean {
    return (
      piece === ClonePiece.PlanningAreaCustom && kind === ResourceKind.Project
    );
  }

  async run(input: ExportJobInput): Promise<ExportJobOutput> {
    const relativePaths =
      ClonePieceRelativePaths[ClonePiece.PlanningAreaCustom];

    const [project]: [ProjectSelectResult] = await this.apiEntityManager.query(
      `
        SELECT planning_unit_grid_shape, planning_unit_area_km2
        FROM projects
        WHERE id = $1
      `,
      [input.resourceId],
    );

    if (!project) {
      throw new Error(`Project with ID ${input.resourceId} not found`);
    }

    const [planningArea]: [
      PlanningAreaSelectResult,
    ] = await this.geoprocessingEntityManager.query(
      `
        SELECT ST_AsEWKB(the_geom) as ewkb, ST_AsGeoJSON(the_geom) as geojson
        FROM planning_areas
        WHERE project_id = $1
      `,
      [input.resourceId],
    );

    if (!planningArea) {
      throw new Error(
        `Custom planning area not found for project with ID: ${input.resourceId}`,
      );
    }

    const planningAreaGeoJson = await this.fileRepository.save(
      Readable.from(planningArea.geojson),
      `json`,
    );

    const content: PlanningAreaCustomContent = {
      puAreaKm2: project.planning_unit_area_km2,
      puGridShape: project.planning_unit_grid_shape,
      planningAreaGeom: planningArea.ewkb.toJSON().data,
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
