import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { nominatim2bbox } from '@marxan-geoprocessing/utils/bbox.utils';
import { TileService } from '@marxan-geoprocessing/modules/tile/tile.service';

import { ProtectedArea } from '@marxan/protected-areas';
import { ProtectedAreaTileRequest } from './protected-area-tile-request';

type QueryResult = { mvt: Buffer };

@Injectable()
export class ProtectedAreasTilesService {
  constructor(
    @InjectRepository(ProtectedArea)
    private readonly areas: Repository<ProtectedArea>,
    private readonly tileService: TileService,
  ) {}

  async getProtectedAreaTile(
    request: ProtectedAreaTileRequest,
  ): Promise<Buffer> {
    const tiles = await this.getTiles(request);
    return this.tileService.zip(tiles.mvt);
  }

  private async getTiles({
    z,
    x,
    y,
    protectedAreaId,
    projectId,
    bbox,
  }: ProtectedAreaTileRequest): Promise<QueryResult> {
    const extent = 4096;
    const buffer = 256;
    const inputProjection = 4326;
    const attributes = 'full_name, status, wdpaid, iucn_cat';
    const table = 'wdpa';
    const query = this.areas.manager.createQueryBuilder();

    query
      .select(`ST_AsMVT(tile.*, 'layer0', ${extent}, 'mvt_geom')`, 'mvt')
      .from((subQuery) => {
        subQuery.select(
          `${attributes}, ST_AsMVTGeom(
          ST_Transform(the_geom, 3857),
          ST_TileEnvelope(${z}, ${x}, ${y}),
          ${extent},
          ${buffer},
          true) AS mvt_geom`,
        );
        subQuery
          .from(table, 'data')
          .where(
            `ST_Intersects(ST_Transform(ST_TileEnvelope(:z, :x, :y), ${inputProjection}), the_geom )`,
            { z, x, y },
          );

        if (projectId) {
          subQuery.andWhere(
            new Brackets((orBuilder) =>
              orBuilder
                .where(`project_id = :project_id`, {
                  project_id: projectId,
                })
                .orWhere(`project_id is null`),
            ),
          );
        } else {
          subQuery.andWhere(`project_id is null`);
        }

        if (bbox) {
          subQuery.andWhere(
            `st_intersects(ST_MakeEnvelope(:...bbox, 4326), the_geom)`,
            {
              bbox: nominatim2bbox(bbox),
            },
          );
        }

        if (protectedAreaId) {
          subQuery.andWhere(`id = :protectedAreaId`, { protectedAreaId });
        }

        return subQuery;
      }, 'tile');
    return await query.getRawOne();
  }
}
