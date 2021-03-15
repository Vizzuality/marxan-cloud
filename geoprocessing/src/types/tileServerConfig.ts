/**
 * @description Configuration options for the tile server
 */
export interface TileServerConfig<T> {
  /**
   * @description The highest zoom level at which data is clustered.
   * Any tile requests at zoom levels higher than this will return individual points only.
   */
  maxZoomLevel?: number;

  /**
   * @todo add cache options
   */

  /**
   * @description Optional callback to map the filters to where conditions in PostGreSQL
   */
  filtersToWhere?: (queryParams: T | {}) => string[];

  /**
   * @description Attributes to select from the table
   */
  attributes: string[];
}
