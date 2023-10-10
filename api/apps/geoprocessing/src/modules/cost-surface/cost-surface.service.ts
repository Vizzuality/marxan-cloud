import { Injectable, Logger, Inject } from '@nestjs/common';
import { TileService } from '@marxan-geoprocessing/modules/tile/tile.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsArray, IsNumber, IsString, IsOptional } from 'class-validator';
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

  /** TODO: 'bbox' is an optional parameter here, confirm if we can remove it, since cost surface will always be
   *   within the project grid
   */
  public findTile(
    tileSpecification: CostSurfaceTileRequest,
    bbox?: BBox,
  ): Promise<Buffer> {
    const { z, x, y, costSurfaceId } = tileSpecification;
    const simplificationLevel = 360 / (Math.pow(2, z + 1) * 100);
    const attributes = 'cost';
    const table = `(SELECT ST_RemoveRepeatedPoints((st_dump(the_geom)).geom, ${simplificationLevel}) AS the_geom,
                          cost,
                          cost_surface_id
                          FROM cost_surface_pu_data
                          INNER JOIN projects_pu ppu on ppu.id=cost_surface_pu_data.projects_pu_id
                          INNER JOIN planning_units_geom pug on pug.id=ppu.geom_id)`;

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
