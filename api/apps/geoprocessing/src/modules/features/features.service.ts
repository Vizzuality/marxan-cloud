import { Injectable, Logger, Inject } from '@nestjs/common';
import { TileService } from '@marxan-geoprocessing/modules/tile/tile.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeoFeatureGeometry } from '@marxan/geofeatures';
import { IsArray, IsNumber, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { BBox } from 'geojson';
import { antimeridianBbox, nominatim2bbox } from '@marxan/utils/geo';

import { TileRequest } from '@marxan/tiles';

export class TileSpecification extends TileRequest {
  @ApiProperty()
  @IsString()
  id!: string;
}

/**
 * @todo add validation for bbox
 */
export class FeaturesFilters {
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Transform((value: string): BBox => JSON.parse(value))
  bbox?: BBox;
}

@Injectable()
export class FeatureService {
  private readonly logger: Logger = new Logger(FeatureService.name);

  constructor(
    @InjectRepository(GeoFeatureGeometry)
    private readonly featuresRepository: Repository<GeoFeatureGeometry>,
    private readonly tileService: TileService,
  ) {}

  /**
   *
   * @todo generate the custom queries using query builder and the entity data.
   * @todo move the string to int transformation to the AdminAreaLevelFilters class
   */

  buildFeaturesWhereQuery(id: string, bbox?: BBox): string {
    let whereQuery = `feature_id = '${id}'`;

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

  /**
   * @todo get attributes from Entity, based on user selection
   * @todo simplification level based on zoom level
   */
  public findTile(
    tileSpecification: TileSpecification,
    bbox?: BBox,
  ): Promise<Buffer> {
    const { z, x, y, id } = tileSpecification;
    const simplificationLevel = 360/Math.pow(2, z);
    const attributes = 'feature_id, properties, ';
    const table = `(select ST_RemoveRepeatedPoints((st_dump(the_geom)).geom, ${simplificationLevel}) as the_geom, properties, feature_id from "${this.featuresRepository.metadata.tableName}")`;
    const customQuery = this.buildFeaturesWhereQuery(id, bbox);
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
