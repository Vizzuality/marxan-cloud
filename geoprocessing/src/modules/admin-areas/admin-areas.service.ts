import { Injectable, Logger } from '@nestjs/common';
<<<<<<< HEAD
import { TileService } from 'src/modules/tile/tile.service';
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
    level: number,
  ): Promise<Buffer> {

    // const customQueryQB = this.getQueryBuilder(

    // )
    // console.log('customQueryQB', customQueryQB)
    const table = 'admin_regions';
    const geometry = 'the_geom';
    const extent = 4096;
    const buffer = 256;
    const maxZoomLevel = 12;
    /**
     * @todo get this query from query builder
     * @todo use the level to generate the cusom query
     */
    const customQuery = 'gid_0 is not null and gid_1 is null and gid_2 is null';
    const attributes = 'gid_0, gid_1, gid_2';


    this.logger.debug('test_execute_tile_service');
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
=======
import { TileServerService } from 'modules/vector-tile/vector-tile.service'

const logger = new Logger('admin-areas-service');

@Injectable()
export class AdminAreasService {
  constructor(
    private readonly tileServerService: TileServerService,
  ) {}

  public findTest(): number {
    logger.debug('test_execute')
    return this.tileServerService.getTile()
>>>>>>> WIP
  }
}
