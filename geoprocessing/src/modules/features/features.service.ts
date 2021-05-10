import { Injectable, Logger, Inject } from '@nestjs/common';
import { TileService, TileRequest } from 'src/modules/tile/tile.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeoFeatureGeometry } from 'src/modules/features/features.geo.entity';
import {
  IsArray,
  IsNumber,
  IsString,
  IsOptional,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { BBox } from 'geojson';

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

  // @ValidateNested({ each: true })
  // @Type(() => Array)
  // @IsNumber({}, {each: true})
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
    this.logger.debug(`BBox ${bbox}`);
    let whereQuery = `feature_id = '${id}'`;
    // if (filters?.bbox) {
    //   whereQuery += `AND the_geom && ST_MakeEnvelope(${filters?.bbox[0]}, 4326)`
    // }

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
    const attributes = 'feature_id';
    const table = this.featuresRepository.metadata.tableName;
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
