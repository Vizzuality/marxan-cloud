import { Injectable, Logger } from '@nestjs/common';
import { TileService, TileRequest } from 'src/modules/tile/tile.service';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  Max,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class TileSpecification extends TileRequest{
  @ApiProperty()
  @Min(0)
  @Max(2)
  @IsInt()
  @Transform(value =>  Number.parseInt(value))
  level: number;
}


@Injectable()
export class AdminAreasService {
  private readonly logger: Logger = new Logger(AdminAreasService.name);
  constructor(private readonly tileService: TileService) {}

  /**
   *
   * @todo generate the custom queries using query builder and the entity data.
   * @todo move the string to int transformation to the AdminAreaLevelFilters class
   */
  buildAdminAreaQuery(level: number): string {
    let customsql: string = '';
    if (level === 0) {
      customsql += `gid_0 IS NOT NULL AND gid_1 IS NULL AND gid_2 IS NULL`;
    }
    if (level === 1) {
      customsql += `gid_1 IS NOT NULL AND gid_2 IS NULL`;
    }
    if (level === 2) {
      customsql += `gid_2 IS NOT NULL`;
    }
    return customsql;
  }

  /**
   *
   * @todo find another way of parsing the attributes
   */
  getAttributes(level: number): string {
    return `gid_${level}`;
  }

  /**
   * @todo get this query from query builder
   * @todo apply validation on the controller
   * @todo update the function to include guid apiQuery param
   */
  public findTile(
    {
      z,
      x,
      y,
      level
    }: {
      z: number,
      x: number,
      y: number,
      level: number
    }
  ): Promise<Buffer> {
    const customQuery = this.buildAdminAreaQuery(level);
    const attributes = this.getAttributes(level);
    const table = 'admin_regions';
    const geometry = 'the_geom';
    const extent = 4096;
    const buffer = 256;
    const maxZoomLevel = 12;
    console.log('params', level)

    return this.tileService.getTile(
      z,
      x,
      y,
      table,
      geometry,
      extent,
      buffer,
      maxZoomLevel,
      customQuery,
      attributes,
    );
  }
}
