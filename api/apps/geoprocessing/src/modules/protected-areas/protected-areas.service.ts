import { Injectable, Logger, Inject } from '@nestjs/common';
import {
  TileService,
  TileRequest,
} from '@marxan-geoprocessing/modules/tile/tile.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsNumber, IsOptional, IsString } from 'class-validator';

import { ProtectedArea } from '@marxan-geoprocessing/modules/protected-areas/protected-areas.geo.entity';
import { BBox } from 'geojson';
import { Transform } from 'class-transformer';
import { nominatim2bbox } from '@marxan-geoprocessing/utils/bbox.utils';

export class ProtectedAreasFilters {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsNumber({}, { each: true })
  @Transform((value: string): BBox => JSON.parse(value))
  bbox?: BBox;
}

@Injectable()
export class ProtectedAreasService {
  private readonly logger: Logger = new Logger(ProtectedAreasService.name);
  constructor(
    @InjectRepository(ProtectedArea)
    private readonly protectedAreasRepository: Repository<ProtectedArea>,
    @Inject(TileService)
    private readonly tileService: TileService,
  ) {}

  /**
   * @param filters bounding box of the area where the grids would be generated
   */
  buildProtectedAreasWhereQuery(
    filters?: ProtectedAreasFilters,
  ): string | undefined {
    let whereQuery = undefined;
    whereQuery = filters?.id ? ` id = '${filters?.id}'` : undefined;
    if (filters?.bbox) {
      const bboxIntersect = `st_intersects(ST_MakeEnvelope(${nominatim2bbox(
        filters.bbox,
      )}, 4326), the_geom)`;
      whereQuery = whereQuery
        ? `${whereQuery} and ${bboxIntersect}`
        : bboxIntersect;
    }
    return whereQuery;
  }

  /**
   * @todo get attributes from Entity, based on user selection
   */
  public findTile(
    tileSpecification: TileRequest,
    filters?: ProtectedAreasFilters,
  ): Promise<Buffer> {
    const { z, x, y } = tileSpecification;
    const attributes = 'full_name, status, wdpaid, iucn_cat';
    const table = this.protectedAreasRepository.metadata.tableName;
    const customQuery = this.buildProtectedAreasWhereQuery(filters);
    return this.tileService.getTile({
      z,
      x,
      y,
      table,
      attributes,
      customQuery,
    });
  }
}
