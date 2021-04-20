import { Injectable, Logger } from '@nestjs/common';
import { TileService } from 'src/modules/tile/tile.service';
import { IsInt, Max, Min} from 'class-validator';
// import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';


/**
 * Supported admin area levels (national and sub-national): either level 0, level 1 or level 2.
 * @todo different from the adminAreaLevel in the api side
 * @todo check transformation from string to int that doesn't work.
 */
export class AdminAreaLevelFilters {
  @ApiProperty()
  @IsInt()
  @Min(0)
  @Max(2)
  // @Transform((level: string ) => parseInt(level))
  level: 0 |1 |2;
};

@Injectable()
export class AdminAreasService {
  private readonly logger: Logger = new Logger(AdminAreasService.name);
  constructor(
    private readonly tileService: TileService,
  ) {}

  /**
   *
   * @todo generate the custom queries using query builder and the entity data.
   * @todo move the string to int transformation to the AdminAreaLevelFilters class
   */
  buildAdminAreaQuery(
    level: AdminAreaLevelFilters
  ): string {
    let customsql: string = "";
    const adminAreaLevel = parseInt(`${level}`, 10)
    if (adminAreaLevel === 0) {
      customsql += `gid_0 IS NOT NULL AND gid_1 IS NULL AND gid_2 IS NULL`;
    }
    if (adminAreaLevel === 1) {
      customsql += `gid_1 IS NOT NULL AND gid_2 IS NULL`;
    }
    if (adminAreaLevel === 2) {
      customsql += `gid_2 IS NOT NULL`;
    }
    return customsql;
  }

  /**
   *
   * @todo find another way of parsing the attributes
   */
  getAttributes(
    level: AdminAreaLevelFilters
  ): string {
    return `gid_${level}`;
  }

  /**
   * @todo get this query from query builder
   * @todo apply validation on the controller
   * @todo update the function to include guid apiQuery param
   */
  public findTile(
    z: number,
    x: number,
    y: number,
    level: AdminAreaLevelFilters,
  ): Promise<Buffer> {
    const customQuery = this.buildAdminAreaQuery(level)
    const attributes = this.getAttributes(level);
    const table = 'admin_regions';
    const geometry = 'the_geom';
    const extent = 4096;
    const buffer = 256;
    const maxZoomLevel = 12;

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
