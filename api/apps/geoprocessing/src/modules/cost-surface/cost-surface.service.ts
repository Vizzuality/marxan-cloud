import { Injectable, Logger, Inject } from '@nestjs/common';
import { TileService } from '@marxan-geoprocessing/modules/tile/tile.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IsArray,
  IsNumber,
  IsString,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { BBox } from 'geojson';
import { antimeridianBbox, nominatim2bbox } from '@marxan/utils/geo';

import { TileRequest } from '@marxan/tiles';

import { CostSurfacePuDataEntity } from '@marxan/cost-surfaces';
export class CostSurfaceTileRequest extends TileRequest {
  @ApiProperty()
  @IsString()
  projectId!: string;

  @ApiProperty()
  @IsString()
  costSurfaceId!: string;
}

export class CostSurfaceFilters {
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Transform((value: string): BBox => JSON.parse(value))
  bbox?: BBox;
}

@Injectable()
export class CostSurfaceService {
  private readonly logger: Logger = new Logger(CostSurfaceService.name);

  constructor(
    @InjectRepository(CostSurfacePuDataEntity)
    private readonly costSurfaceDataRepository: Repository<CostSurfacePuDataEntity>,
    private readonly tileService: TileService,
  ) {}

  buildCostSurfacesWhereQuery(id: string, bbox?: BBox): string {
    let whereQuery = `cost_surface_id = '${id}'`;

    if (bbox) {
      const { westBbox, eastBbox } = antimeridianBbox(nominatim2bbox(bbox));
      whereQuery += `AND
      (st_intersects(
        st_intersection(st_makeenvelope(${eastBbox}, 4326),
        ST_MakeEnvelope(0, -90, 180, 90, 4326)),
      the_geom
      ) or st_intersects(
      st_intersection(st_makeenvelope(${westBbox}, 4326),
      ST_MakeEnvelope(-180, -90, 0, 90, 4326)),
      the_geom
      ))`;
    }
    return whereQuery;
  }

  public findTile(
    tileSpecification: CostSurfaceTileRequest,
    bbox?: BBox,
  ): Promise<Buffer> {
    const { z, x, y, costSurfaceId } = tileSpecification;
    const simplificationLevel = 360 / (Math.pow(2, z + 1) * 100);
    const attributes = 'cost_surface_id, properties';
    const table = `(select ST_RemoveRepeatedPoints((st_dump(the_geom)).geom, ${simplificationLevel}) as the_geom,
                          (coalesce(properties,'{}'::jsonb) || jsonb_build_object('cost', cost)) as properties,
                          cost_surface_id
                          from "${this.costSurfaceDataRepository.metadata.tableName}")
                          inner join projects_pu on project_pu.id = cost_surface_pu_dat.projects_pu_id`;

    const customQuery = this.buildCostSurfacesWhereQuery(costSurfaceId, bbox);
    return this.tileService.getTile({
      z,
      x,
      y,
      table,
      customQuery,
      attributes,
    });
  }
}
