// to-do: work on cache later
//import { Cache, defaultCacheOptions} from './cache';
import { createQueryForTile } from 'src/utils/vector-tile-builder';
import { TileServerConfig } from 'src/types/tileServerConfig';
import { TileRenderer } from 'src/types/tileRenderer';
import { TileInput } from 'src/types/tileInput';
import {
  defaultGetBaseQuery,
  zip
} from 'src/utils/vector-tile.utils'
import { FetchSpecification, FetchUtils } from 'nestjs-base-service';
import { omit } from 'lodash';
import { VectorTileDTO } from './dto/vector-tile-dto'

export async function TileServer<T>({
  maxZoomLevel = 12,
  filtersToWhere,
  attributes = [],
}: TileServerConfig<T>): Promise<TileRenderer<T>> {

  //do we need to create the constructure?
  // constructor(
  //   @InjectRepository(VectorTile, 'geoprocessingDB')
  //   private readonly VectorTileRepository: Repository<VectorTile>,
  // ) {
  //   super(adminAreasRepository, 'admin_area', 'admin_areas');
  // }

  //same with serializerConfig?

  return async ({
    z,
    x,
    y,
    table = '',
    geometry = 'the_geom',
    sourceLayer = '',
    maxZoomLevel: requestMaxZoomLevel = undefined,
    extent = 4096,
    queryParams = {},
    id = '', //id of the request - I leave it at the moment
    getBaseQuery = defaultGetBaseQuery,
  }: TileInput<T>) => {
    try {
      const filtersQuery = !!filtersToWhere ? filtersToWhere(queryParams) : [];

      // debug && console.time('query' + id);
      // const cacheKey = cache.getCacheKey(table, z, x, y, filtersQuery);
      // try {
      //   const value = await cache.getCacheValue(cacheKey);
      //   if (value) {
      //     return value;
      //   }
      // } catch (e) {
      //   // In case the cache get fail, we continue to generate the tile
      //   debug && console.log({ e });
      // }
      let query: string;

      z = parseInt(`${z}`, 10);
      if (isNaN(z)) {
        throw new Error('Invalid zoom level');
      }

      x = parseInt(`${x}`, 10);
      y = parseInt(`${y}`, 10);
      if (isNaN(x) || isNaN(y)) {
        throw new Error('Invalid tile coordinates');
      }

      try {
        query = createQueryForTile({
          z,
          x,
          y,
          maxZoomLevel: requestMaxZoomLevel || maxZoomLevel,
          table,
          geometry,
          sourceLayer,
          extent,
          attributes,
          query: filtersQuery,
          getBaseQuery,
        });



        // async getTilebyQuery(
        //   fetchSpecification: FetchSpecification,
        // ): Promise<Partial<VectorTIle>> {

        //   // const query = query

        //   const queryWithFilters = FetchUtils.processFetchSpecification<VectorTile>(
        //     query,
        //     // this.alias,
        //     fetchSpecification,
        //   );

        //   const result = fetchSpecification?.omitFields?.length
        //   ? omit(results, fetchSpecification.omitFields)
        //   : results;
        //   return result;
        // }

        const queryWithFilters = FetchUtils.processFetchSpecification<VectorTile>(

        // const result = await pool.query(query);
        // console.timeEnd('query' + id);

        // console.time('gzip' + id);
        // const tile = await zip(result.rows[0].mvt);
        // console.timeEnd('gzip' + id);

        // try {
        //   await cache.setCacheValue(
        //     cacheKey,
        //     tile,
        //     await cache.getCacheTtl(z, cacheTtl)
        //   );
        // } catch (e) {
        //   // In case the cache set fail, we should return the generated tile
        //   debug && console.log({ e });
        // }

        return tile;
      // } catch (e) {
      //   debug && console.log(query);
      //   debug && console.log({ e });
      // }
    // } catch (e) {
    //   debug && console.log('e in connect', e);
     } finally {

     }
  } finally {

  };
}}
