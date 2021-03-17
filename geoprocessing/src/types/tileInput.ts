import { GetBaseQuery } from './tileQuery';
import { TileRequest } from './tileRequest';

/**
 * @description The required input values for the tile renderer
 */
export interface TileInput<T> extends TileRequest {
  /**
   * @description The name of the table - @todo add default table name
   */
  table?: string;

  /**
   * @description The geometry column name, default is 'the_geom'
   */
  geometry?: string;

  /**
   * @description The MVT source layer on which the points are rendered, default is points
   */
  sourceLayer?: string;

  /**
   * @description The tile extent is the grid dimension value as specified by ST_AsMVT. The default is 4096.
   * @see https://postgis.net/docs/ST_AsMVT.html
   */
  extent?: number;

  /**
   * @description The query parameters used to filter
   */
  queryParams?: T | {};

  /**
   * @description Unique ID of the request, default is an empty string
   */
  id?: string;

  /**
   * @description Function which create the based query with applied filters
   * Default is using the table name to select from and add the intersect within the BBox of the tiles,
   * also add the filters to where in the query
   * Be aware, if you overwrite this you need to make sure the result return the following columns:
   * - "geometry" AS geom
   * - "maxZoomLevel + 1" AS expansionZoom
   * - all the attibutes from the list
   */
  getBaseQuery?: GetBaseQuery;

  /**
   * @description The highest zoom level at which data is clustered.
   * Any tile requests at zoom levels higher than this will return individual points only.
   * This will overwrite the `maxZoomLevel` provided to the server initialization
   */
  maxZoomLevel?: number;

  /**
   * @todo add cache
   */
}
