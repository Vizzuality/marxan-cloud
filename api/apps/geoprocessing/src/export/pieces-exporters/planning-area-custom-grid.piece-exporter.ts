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
      // TODO puid should be obtained in a proper way
      .select('ST_AsEWKB(the_geom) as ewkb, row_number() over () as puid')
      .from('planning_units_geom', 'pug')
      .where('project_id = :projectId', { projectId: project.id })
      .stream();

    const gridFileTransform = new PlanningAreaGridCustomTransform();

    gridStream.pipe(gridFileTransform);

    const gridFile = await this.fileRepository.save(gridFileTransform);
    if (isLeft(gridFile)) {
      throw new Error(
        `${PlanningAreaCustomGridPieceExporter.name} - Project Custom PA - couldn't save file - ${gridFile.left.description}`,
      );
    }

    const geoJsonQb = this.geoprocessingEntityManager.createQueryBuilder();
    const geoJsonStream = await geoJsonQb
      .select('ST_AsGeoJSON(the_geom) as geojson')
      .from('planning_units_geom', 'pug')
      .where('project_id = :projectId', { projectId: project.id })
      .stream();

    const geojsonFileTransform = new PlanningAreaGridCustomGeoJsonTransform(
      project.bbox,
    );
    geoJsonStream.pipe(geojsonFileTransform);

    const gridGeoJson = await this.fileRepository.save(
      geojsonFileTransform,
      'json',
    );

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
