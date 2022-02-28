import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput, ExportJobOutput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import { ClonePieceUrisResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import {
  planningAreaCustomGridGeoJSONRelativePath,
  PlanningAreaGridCustomGeoJsonTransform,
  PlanningAreaGridCustomTransform,
} from '@marxan/cloning/infrastructure/clone-piece-data/planning-area-grid-custom';
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
export class PlanningAreaCustomGridPieceExporter
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
      piece === ClonePiece.PlanningAreaGridCustom &&
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
    const gridStream = await qb
      .select(
        'ST_AsEWKB(the_geom) as ewkb, row_number() over () as puid, ST_AsGeoJSON(the_geom) as geojson',
      )
      .from('planning_units_geom', 'pug')
      .where('project_id = :projectId', { projectId: project.id })
      .stream();

    const gridFileTransform = new PlanningAreaGridCustomTransform();
    const geojsonFileTransform = new PlanningAreaGridCustomGeoJsonTransform(
      project.bbox,
    );

    gridStream.pipe(gridFileTransform);
    gridStream.pipe(geojsonFileTransform);

    const gridGeoJson = await this.fileRepository.save(
      geojsonFileTransform,
      'json',
    );

    const gridFile = await this.fileRepository.save(gridFileTransform, 'json');
    if (isLeft(gridFile)) {
      throw new Error(
        `${PlanningAreaCustomGridPieceExporter.name} - Project Custom PA - couldn't save file - ${gridFile.left.description}`,
      );
    }

    if (isLeft(gridGeoJson)) {
      throw new Error(
        `${PlanningAreaCustomGridPieceExporter.name} - Project Custom PA - couldn't save file - ${gridGeoJson.left.description}`,
      );
    }

    return {
      ...input,
      uris: [
        ...ClonePieceUrisResolver.resolveFor(
          ClonePiece.PlanningAreaGridCustom,
          gridFile.right,
        ),
        {
          uri: gridGeoJson.right,
          relativePath: planningAreaCustomGridGeoJSONRelativePath,
        },
      ],
    };
  }
}
