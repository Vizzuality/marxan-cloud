import { Injectable, Logger, Inject } from '@nestjs/common';
import { TileService, TileRequest } from 'src/modules/tile/tile.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeoFeatureGeometry } from 'src/modules/features/features.geo.entity';
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TileSpecification extends TileRequest {
  @ApiProperty()
  @IsString()
  id: string;
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
  buildFeaturesWhereQuery(id: string): string {
    const  whereQuery = `feature_id = '${id}'`;
    return whereQuery;
  }


  /**
   * @todo get attributes from Entity, based on user selection
   */
  public findTile(tileSpecification: TileSpecification): Promise<Buffer> {
    const { z, x, y , id} = tileSpecification;
    const attributes = 'feature_id';
    const table = this.featuresRepository.metadata.tableName;
    const customQuery = this.buildFeaturesWhereQuery(id);
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
