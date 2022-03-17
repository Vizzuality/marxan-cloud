import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput, ExportJobOutput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import { ClonePieceUrisResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import { PlanningUnitsGridGeoJsonTransform } from '@marxan/cloning/infrastructure/clone-piece-data/planning-units-grid-geojson';
import { FileRepository } from '@marxan/files-repository';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/Either';
import { BBox } from 'geojson';
import { EntityManager } from 'typeorm';
import {
  ExportPieceProcessor,
  PieceExportProvider,
} from '../pieces/export-piece-processor';

interface ProjectSelectResult {
  id: string;
  bbox: BBox;
}

@Injectable()
@PieceExportProvider()
export class PlanningUnitsGridGeojsonPieceExporter
  implements ExportPieceProcessor {
  constructor(
    private readonly fileRepository: FileRepository,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly apiEntityManager: EntityManager,
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly geoprocessingEntityManager: EntityManager,
  ) {}

  isSupported(piece: ClonePiece, kind: ResourceKind): boolean {
    return (
      piece === ClonePiece.PlanningUnitsGridGeojson &&
      kind === ResourceKind.Project
    );
  }

  async run(input: ExportJobInput): Promise<ExportJobOutput> {
    const [project]: [ProjectSelectResult] = await this.apiEntityManager.query(
      `
        SELECT id, bbox
        FROM projects
        WHERE id = $1
      `,
      [input.resourceId],
    );

    const qb = this.geoprocessingEntityManager.createQueryBuilder();
    const geoJsonStream = await qb
      .select('ST_AsGeoJSON(the_geom) as geojson')
      .from('planning_units_geom', 'pug')
      .innerJoin('projects_pu', 'ppu', 'pug.id = ppu.geom_id')
      .where('ppu.project_id = :projectId', { projectId: project.id })
      .stream();

    const geojsonFileTransform = new PlanningUnitsGridGeoJsonTransform(
      project.bbox,
    );
    geoJsonStream.pipe(geojsonFileTransform);

    const gridGeoJson = await this.fileRepository.save(
      geojsonFileTransform,
      'json',
    );

    if (isLeft(gridGeoJson)) {
      throw new Error(
        `${PlanningUnitsGridGeojsonPieceExporter.name} - Project Custom PA - couldn't save file - ${gridGeoJson.left.description}`,
      );
    }

    return {
      ...input,
      uris: ClonePieceUrisResolver.resolveFor(
        ClonePiece.PlanningUnitsGridGeojson,
        gridGeoJson.right,
      ),
    };
  }
}
