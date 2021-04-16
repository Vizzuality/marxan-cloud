import { Injectable, Logger } from '@nestjs/common';
import { TileService, Tile } from 'src/modules/tile/tile.service';
// import { Repository, SelectQueryBuilder } from 'typeorm';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
// import { AdminArea } from './admin-areas.geo.entity';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Alias } from 'typeorm/query-builder/Alias';
// import { Transform } from 'class-transformer';

/**
 * Supported admin area levels (sub-national): either level 1 or level 2.
 * @todo change type level to string
 */
export class AdminAreaLevelFilters {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2)
  // @Transform((level: any) => parseInt(level))
  level: number;
}


/**
 * @todo extent to the appBaseService
 */
@Injectable()
export class AdminAreasService {
  private readonly logger: Logger = new Logger(AdminAreasService.name);
  constructor(
    // @InjectRepository(AdminArea) private readonly repository: Repository<AdminArea>,
    private readonly tileService: TileService,
  ) {}

  /**
   *
   * @todo add filters to filster dto
   */

  // computeFilters(
  //   query: SelectQueryBuilder<AdminArea>,
  //   filters?: AdminAreaLevelFilters,
  //   alias = 'c'
  // ): SelectQueryBuilder<AdminArea> {
  //   if (filters?.level === 2) {
  //     query.andWhere(`${alias}.gid2 IS NOT NULL`);
  //   }

  //   if (filters?.level === 1) {
  //     query.andWhere(
  //       `${alias}.gid1 IS NOT NULL AND ${alias}.gid2 IS NULL`
  //     );
  //   }

  //   if (filters?.level === 0) {
  //     query.andWhere(
  //       `${alias}.gid0 IS NOT NULL AND ${alias}.gid1 IS NULL AND ${alias}.gid2 IS NULL`
  //     )
  //   }

  //   return query;
  // }

  // public getQueryBuilder(
  //   alias: string = 'c',
  // ): SelectQueryBuilder<AdminArea> {
  //   return this.computeFilters(
  //     this.repository.createQueryBuilder(alias)
  //   )
  // }



  public findTile(
    z: number,
    x: number,
    y: number,
    table: string,
    geometry: string,
    extent: number,
    buffer: number,
    maxZoomLevel: number,
    customQuery: string,
    attributes: string,
  ): Promise<Tile> {
    // const customQueryQB = this.getQueryBuilder(

    // )
    // console.log('customQueryQB', customQueryQB)

    this.logger.debug('test_execute_tile_service');
    return this.tileService.getTile(
      z,
      x,
      y,
      (table = 'admin_regions'),
      (geometry = 'the_geom'),
      (extent = 4096),
      (buffer = 256),
      (maxZoomLevel = 12),
      (customQuery = 'gid_0 is not null and gid_1 is null and gid_2 is null'),
      (attributes = 'gid_0, gid_1, gid_2'),
    );
  }
}
