import { Injectable, Logger, Inject } from '@nestjs/common';
import { TileService } from '@marxan-geoprocessing/modules/tile/tile.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeoFeatureGeometry } from '@marxan/geofeatures';
import { IsArray, IsNumber, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { BBox } from 'geojson';
import { nominatim2bbox } from '@marxan-geoprocessing/utils/bbox.utils';

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
    @Inject(TileService)
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
      whereQuery += `AND st_intersects(ST_MakeEnvelope(${nominatim2bbox(
        bbox,
      )}, 4326), the_geom)`;
    }
    return whereQuery;
  }

  /**
   * @todo get attributes from Entity, based on user selection
   */
  public findTile(
    tileSpecification: TileSpecification,
    bbox?: BBox,
  ): Promise<Buffer> {
    const { z, x, y, id } = tileSpecification;
    const attributes = 'feature_id, properties';
    const table = `(select (st_dump(the_geom)).geom as the_geom, properties, feature_id from "${this.featuresRepository.metadata.tableName}")`;
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
